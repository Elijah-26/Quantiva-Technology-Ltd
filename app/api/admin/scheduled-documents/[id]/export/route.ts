import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/auth/admin'
import {
  buildMarkdownDraftDocxBuffer,
  buildMarkdownDraftPdfBuffer,
} from '@/lib/markdown-draft-export'

export const runtime = 'nodejs'

type AdminAuth =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse }

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
  if (!isPlatformAdmin(user)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user }
}

function safeFilename(title: string): string {
  return title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 80) || 'scheduled_document'
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await context.params
  const format = request.nextUrl.searchParams.get('format') || 'docx'
  if (format !== 'docx' && format !== 'pdf') {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  }

  const { data: row, error } = await supabaseAdmin
    .from('library_documents')
    .select('id, title, full_content, source')
    .eq('id', id)
    .eq('source', 'scheduled')
    .maybeSingle()

  if (error || !row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const title = String(row.title || 'Document')
  const body = String(row.full_content || '')
  const base = safeFilename(title)

  try {
    if (format === 'docx') {
      const buf = await buildMarkdownDraftDocxBuffer(title, body)
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${base}.docx"`,
        },
      })
    }
    const buf = await buildMarkdownDraftPdfBuffer(title, body)
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${base}.pdf"`,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
