import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'

const BUCKET = 'library-documents'

type AdminAuth = { ok: true; user: User } | { ok: false; response: NextResponse }

async function requireAdmin(): Promise<AdminAuth> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set(name, '', options)
        },
      },
    }
  )
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!(await isUserPlatformAdmin(user, supabaseAdmin))) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user }
}

function wordCount(text: string): number {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

function safeStorageSegment(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^\.+/, '') || 'file'
  return base.slice(0, 200)
}

function isProbablyTextMime(mime: string, ext: string): boolean {
  if (mime.startsWith('text/')) return true
  return ['txt', 'md', 'markdown', 'html', 'htm', 'csv', 'json', 'xml', 'log'].includes(ext)
}

/** POST multipart: file + same metadata fields as JSON create */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const originalFilename = file.name || 'upload'
    const ext = originalFilename.includes('.')
      ? originalFilename.split('.').pop()!.toLowerCase()
      : ''
    const mime = file.type || 'application/octet-stream'

    const titleRaw = String(formData.get('title') || '').trim()
    const title =
      titleRaw ||
      originalFilename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() ||
      'Untitled upload'

    const description = String(formData.get('description') || '')
    const category =
      String(formData.get('category') || '').trim() || 'general'
    const jurisdiction = String(formData.get('jurisdiction') || '').trim()
    const accessLevelRaw = String(formData.get('access_level') || 'free')
    const accessLevel = ['free', 'pro', 'business'].includes(accessLevelRaw) ? accessLevelRaw : 'free'
    const sourceRaw = String(formData.get('source') || 'curated')
    const source = ['curated', 'scheduled', 'on_demand'].includes(sourceRaw) ? sourceRaw : 'curated'
    const previewField = String(formData.get('preview') || '').trim()
    const fullContentField = String(formData.get('full_content') || '')

    const buffer = Buffer.from(await file.arrayBuffer())
    let fullContent = fullContentField.trim()
    if (!fullContent && isProbablyTextMime(mime, ext)) {
      try {
        fullContent = buffer.toString('utf8')
      } catch {
        fullContent = ''
      }
    }
    if (!fullContent) {
      fullContent = `[Uploaded file: ${originalFilename}]\n\nUse Download original on the document page to open this file.`
    }

    const preview =
      previewField ||
      fullContent.slice(0, 500) ||
      `Uploaded file: ${originalFilename}`

    const wc =
      isProbablyTextMime(mime, ext) && fullContent.length > 0
        ? wordCount(fullContent)
        : Math.max(1, Math.floor(buffer.length / 5))

    const now = new Date().toISOString().slice(0, 10)

    const row = {
      title,
      description: description || `Library upload: ${title}`,
      category,
      jurisdiction,
      access_level: accessLevel,
      word_count: wc,
      download_count: 0,
      rating: 0,
      last_updated: now,
      preview: preview || '—',
      full_content: fullContent,
      read_minutes: Math.max(1, Math.ceil(wc / 200)),
      complexity: 'Moderate' as const,
      versions: [{ version: '1.0', date: now, note: 'Uploaded via admin' }],
      related_ids: [] as string[],
      source,
      created_by_user_id: auth.user.id,
      file_storage_path: null as string | null,
      file_mime_type: mime,
      original_filename: originalFilename,
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('library_documents')
      .insert(row)
      .select('id')
      .single()

    if (insErr || !inserted?.id) {
      console.error('library insert', insErr)
      return NextResponse.json({ error: insErr?.message || 'Insert failed' }, { status: 500 })
    }

    const docId = inserted.id as string
    const storagePath = `${docId}/${safeStorageSegment(originalFilename)}`

    const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: mime,
      upsert: true,
    })

    if (upErr) {
      await supabaseAdmin.from('library_documents').delete().eq('id', docId)
      console.error('storage upload', upErr)
      return NextResponse.json(
        { error: upErr.message || 'File storage failed. Ensure bucket library-documents exists.' },
        { status: 500 }
      )
    }

    const { error: updErr } = await supabaseAdmin
      .from('library_documents')
      .update({
        file_storage_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', docId)

    if (updErr) {
      console.error('library path update', updErr)
      await supabaseAdmin.storage.from(BUCKET).remove([storagePath])
      await supabaseAdmin.from('library_documents').delete().eq('id', docId)
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    return NextResponse.json({ id: docId }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
