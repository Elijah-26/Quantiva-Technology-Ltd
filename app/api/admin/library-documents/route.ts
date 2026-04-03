import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'
import {
  ADMIN_LIBRARY_DOCUMENTS_SELECT_LEGACY,
  ADMIN_LIBRARY_DOCUMENTS_SELECT_WITH_FILES,
  missingLibraryFileAttachmentColumnsError,
} from '@/lib/library-documents-query'

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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const limit = Math.min(200, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)))
  const offset = Math.max(0, parseInt(request.nextUrl.searchParams.get('offset') || '0', 10))
  const search = (request.nextUrl.searchParams.get('search') || '').trim()

  try {
    const { count: globalTotal } = await supabaseAdmin
      .from('library_documents')
      .select('*', { count: 'exact', head: true })

    const runList = (cols: string) => {
      let q = supabaseAdmin
        .from('library_documents')
        .select(cols, { count: 'exact' })
        .order('updated_at', { ascending: false })
      if (search) {
        q = q.or(`title.ilike.%${search}%,category.ilike.%${search}%`)
      }
      return q.range(offset, offset + limit - 1)
    }

    let { data: rows, error, count } = await runList(ADMIN_LIBRARY_DOCUMENTS_SELECT_WITH_FILES)
    if (error && missingLibraryFileAttachmentColumnsError(error.message)) {
      const r2 = await runList(ADMIN_LIBRARY_DOCUMENTS_SELECT_LEGACY)
      rows = r2.data
      error = r2.error
      count = r2.count
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: metaRows } = await supabaseAdmin.from('library_documents').select('source, download_count')

    const bySource: Record<string, number> = {}
    let totalDownloads = 0
    for (const r of metaRows || []) {
      const s = (r.source as string) || 'curated'
      bySource[s] = (bySource[s] || 0) + 1
      totalDownloads += Number(r.download_count) || 0
    }

    return NextResponse.json({
      documents: rows || [],
      total: count ?? 0,
      limit,
      offset,
      stats: {
        globalTotal: globalTotal ?? 0,
        totalDownloads,
        countBySource: bySource,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json().catch(() => ({}))
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const fullContent = typeof body.full_content === 'string' ? body.full_content : ''
    const preview =
      typeof body.preview === 'string' && body.preview.trim()
        ? body.preview.trim()
        : fullContent.slice(0, 500)
    const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim() : 'general'
    const jurisdiction =
      typeof body.jurisdiction === 'string' && body.jurisdiction.trim() ? body.jurisdiction.trim() : ''
    const accessLevel =
      typeof body.access_level === 'string' && ['free', 'pro', 'business'].includes(body.access_level)
        ? body.access_level
        : 'free'
    const source =
      typeof body.source === 'string' && ['curated', 'scheduled', 'on_demand'].includes(body.source)
        ? body.source
        : 'curated'
    const description = typeof body.description === 'string' ? body.description : ''
    const wc = typeof body.word_count === 'number' ? body.word_count : wordCount(fullContent || preview)
    const now = new Date().toISOString().slice(0, 10)

    const row = {
      title,
      description: description || `Library document: ${title}`,
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
      complexity: (body.complexity === 'Low' || body.complexity === 'High' ? body.complexity : 'Moderate') as
        | 'Low'
        | 'Moderate'
        | 'High',
      versions: [{ version: '1.0', date: now, note: 'Created via admin' }],
      related_ids: [] as string[],
      source,
      created_by_user_id: auth.user.id,
    }

    const { data, error } = await supabaseAdmin.from('library_documents').insert(row).select('id').single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
