import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

/** POST — record a library document download (increments download_count). Authenticated only. */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: row, error: selErr } = await supabaseAdmin
      .from('library_documents')
      .select('id, download_count')
      .eq('id', id)
      .maybeSingle()

    if (selErr || !row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const next = (typeof row.download_count === 'number' ? row.download_count : 0) + 1
    const { error: updErr } = await supabaseAdmin
      .from('library_documents')
      .update({ download_count: next, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (updErr) {
      console.error('increment download_count', updErr)
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, downloadCount: next })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
