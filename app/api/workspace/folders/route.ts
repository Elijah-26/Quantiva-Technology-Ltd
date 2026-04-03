import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { uniqueFolderSlug } from '@/lib/workspace/folder-slug'

const DEFAULT_FOLDERS = [
  { name: 'GDPR Compliance', slug: 'gdpr', icon_emoji: '🔒', sort_order: 10 },
  { name: 'Contracts', slug: 'contracts', icon_emoji: '✍️', sort_order: 20 },
  { name: 'HR Documents', slug: 'hr', icon_emoji: '👥', sort_order: 30 },
]

export async function GET() {
  try {
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

    let { data: folders, error } = await supabase
      .from('workspace_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!folders?.length) {
      const rows = DEFAULT_FOLDERS.map((f) => ({
        user_id: user.id,
        name: f.name,
        slug: f.slug,
        icon_emoji: f.icon_emoji,
        sort_order: f.sort_order,
      }))
      const { data: inserted, error: insErr } = await supabase
        .from('workspace_folders')
        .insert(rows)
        .select('*')

      if (!insErr && inserted?.length) {
        folders = inserted
      }
    }

    return NextResponse.json({ folders: folders || [] })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Create a folder (optional parent for subfolders). */
export async function POST(request: NextRequest) {
  try {
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
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const parentId =
      typeof body.parentId === 'string' && body.parentId.length > 0 ? body.parentId : null
    const iconEmoji = typeof body.iconEmoji === 'string' ? body.iconEmoji.trim().slice(0, 8) : '📁'

    if (!name || name.length > 200) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (parentId) {
      const { data: parent, error: pErr } = await supabase
        .from('workspace_folders')
        .select('id')
        .eq('id', parentId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (pErr || !parent) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 })
      }
    }

    const { data: maxRow } = await supabase
      .from('workspace_folders')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextOrder = (typeof maxRow?.sort_order === 'number' ? maxRow.sort_order : 0) + 10
    const slug = await uniqueFolderSlug(supabase, user.id, parentId, name)

    const { data: folder, error: insErr } = await supabase
      .from('workspace_folders')
      .insert({
        user_id: user.id,
        name,
        slug,
        icon_emoji: iconEmoji || '📁',
        sort_order: nextOrder,
        parent_id: parentId,
      })
      .select('*')
      .single()

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }

    return NextResponse.json({ folder }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
