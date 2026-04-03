import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { id } = await params

  const { data, error } = await supabaseAdmin.from('library_documents').select('*').eq('id', id).single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ document: data })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { id } = await params

  try {
    const body = await request.json().catch(() => ({}))
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.title === 'string') patch.title = body.title.trim()
    if (typeof body.description === 'string') patch.description = body.description
    if (typeof body.category === 'string') patch.category = body.category.trim()
    if (typeof body.jurisdiction === 'string') patch.jurisdiction = body.jurisdiction.trim()
    if (typeof body.access_level === 'string' && ['free', 'pro', 'business'].includes(body.access_level)) {
      patch.access_level = body.access_level
    }
    if (typeof body.preview === 'string') patch.preview = body.preview
    if (typeof body.full_content === 'string') patch.full_content = body.full_content
    if (typeof body.source === 'string' && ['curated', 'scheduled', 'on_demand'].includes(body.source)) {
      patch.source = body.source
    }
    if (typeof body.word_count === 'number') patch.word_count = body.word_count
    if (body.complexity === 'Low' || body.complexity === 'Moderate' || body.complexity === 'High') {
      patch.complexity = body.complexity
    }

    const { data, error } = await supabaseAdmin.from('library_documents').update(patch).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ document: data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { id } = await params

  const { error } = await supabaseAdmin.from('library_documents').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
