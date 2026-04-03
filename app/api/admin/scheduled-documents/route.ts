import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/auth/admin'

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

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const limit = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '50', 10)))
  const offset = Math.max(0, parseInt(request.nextUrl.searchParams.get('offset') || '0', 10))

  try {
    const { data, error, count } = await supabaseAdmin
      .from('library_documents')
      .select(
        'id, title, description, category, jurisdiction, preview, word_count, created_at, updated_at, generation_metadata, source',
        { count: 'exact' }
      )
      .eq('source', 'scheduled')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      documents: data || [],
      total: count ?? (data?.length ?? 0),
      limit,
      offset,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
