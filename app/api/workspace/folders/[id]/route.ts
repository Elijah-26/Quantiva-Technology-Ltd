import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uniqueFolderSlug } from '@/lib/workspace/folder-slug'
import { folderMoveWouldCycle } from '@/lib/workspace/folder-cycle'

export async function PATCH(
  request: NextRequest,
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

    const { data: row, error: fetchErr } = await supabase
      .from('workspace_folders')
      .select('id, name, slug, parent_id, icon_emoji, sort_order')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    let name = typeof body.name === 'string' ? body.name.trim() : row.name
    let parentId: string | null | undefined =
      body.parentId === null
        ? null
        : typeof body.parentId === 'string' && body.parentId.length > 0
          ? body.parentId
          : undefined
    if (parentId === undefined) parentId = row.parent_id as string | null

    const iconEmoji =
      typeof body.iconEmoji === 'string' ? body.iconEmoji.trim().slice(0, 8) : row.icon_emoji
    const sortOrder =
      typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
        ? body.sortOrder
        : row.sort_order

    if (!name || name.length > 200) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (parentId) {
      if (parentId === id) {
        return NextResponse.json({ error: 'Folder cannot be its own parent' }, { status: 400 })
      }
      const { data: parent, error: pErr } = await supabase
        .from('workspace_folders')
        .select('id')
        .eq('id', parentId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (pErr || !parent) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 })
      }
      if (await folderMoveWouldCycle(supabase, id, parentId)) {
        return NextResponse.json({ error: 'Invalid parent (would create a cycle)' }, { status: 400 })
      }
    }

    const parentChanged = parentId !== (row.parent_id as string | null)
    const nameChanged = name !== row.name
    let slug = row.slug as string
    if (parentChanged || nameChanged) {
      slug = await uniqueFolderSlug(supabase, user.id, parentId, name)
    }

    const { data: folder, error: updErr } = await supabase
      .from('workspace_folders')
      .update({
        name,
        slug,
        parent_id: parentId,
        icon_emoji: iconEmoji || '📁',
        sort_order: sortOrder,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    return NextResponse.json({ folder })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    const { error: delErr } = await supabase
      .from('workspace_folders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
