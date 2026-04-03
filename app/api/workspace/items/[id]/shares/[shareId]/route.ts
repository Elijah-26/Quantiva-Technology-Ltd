import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Revoke a share (document owner) or remove yourself from a shared document. */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; shareId: string }> }
) {
  try {
    const { id: itemId, shareId } = await context.params
    if (!itemId || !shareId) {
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

    /** Recipient leaves shared document (no share UUID needed). */
    if (shareId === 'self') {
      const { data: removed, error: leaveErr } = await supabase
        .from('workspace_item_shares')
        .delete()
        .eq('workspace_item_id', itemId)
        .eq('shared_with_user_id', user.id)
        .select('id')
        .maybeSingle()
      if (leaveErr) {
        return NextResponse.json({ error: leaveErr.message }, { status: 500 })
      }
      if (!removed) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json({ ok: true })
    }

    const { data: row } = await supabase
      .from('workspace_item_shares')
      .select('id, workspace_item_id, shared_with_user_id')
      .eq('id', shareId)
      .eq('workspace_item_id', itemId)
      .maybeSingle()

    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isRecipient = row.shared_with_user_id === user.id
    let isOwner = false
    if (!isRecipient) {
      const { data: item } = await supabase
        .from('workspace_items')
        .select('id')
        .eq('id', itemId)
        .eq('user_id', user.id)
        .maybeSingle()
      isOwner = Boolean(item)
    }

    if (!isOwner && !isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error: delErr } = await supabase
      .from('workspace_item_shares')
      .delete()
      .eq('id', shareId)

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
