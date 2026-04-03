import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** List people this document is shared with (owner only). */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await context.params
    if (!itemId) {
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

    const { data: item } = await supabase
      .from('workspace_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: shares, error: sErr } = await supabase
      .from('workspace_item_shares')
      .select('id, shared_with_user_id, created_at')
      .eq('workspace_item_id', itemId)

    if (sErr) {
      return NextResponse.json({ error: sErr.message }, { status: 500 })
    }

    const userIds = [...new Set((shares || []).map((s) => s.shared_with_user_id))]
    const emailById = new Map<string, string>()
    if (userIds.length) {
      const { data: profiles } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', userIds)
      for (const p of profiles || []) {
        emailById.set(p.id as string, (p.email as string) || '')
      }
    }

    return NextResponse.json({
      shares: (shares || []).map((s) => ({
        id: s.id,
        sharedWithUserId: s.shared_with_user_id,
        email: emailById.get(s.shared_with_user_id as string) || null,
        createdAt: s.created_at,
      })),
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Share with another registered user by email (owner only). */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await context.params
    if (!itemId) {
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

    const body = await request.json().catch(() => ({}))
    const raw = typeof body.email === 'string' ? body.email : ''
    const email = normalizeEmail(raw)
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { data: item } = await supabase
      .from('workspace_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: target, error: tErr } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (tErr || !target) {
      return NextResponse.json(
        { error: 'No user found with that email. They must sign up first.' },
        { status: 404 }
      )
    }

    const targetId = target.id as string
    if (targetId === user.id) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })
    }

    const { data: share, error: insErr } = await supabase
      .from('workspace_item_shares')
      .insert({
        workspace_item_id: itemId,
        shared_with_user_id: targetId,
      })
      .select('id, shared_with_user_id, created_at')
      .single()

    if (insErr) {
      if (insErr.code === '23505') {
        return NextResponse.json({ error: 'Already shared with this user' }, { status: 409 })
      }
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }

    return NextResponse.json({
      share: {
        id: share.id,
        sharedWithUserId: share.shared_with_user_id,
        email: target.email as string,
        createdAt: share.created_at,
      },
    }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
