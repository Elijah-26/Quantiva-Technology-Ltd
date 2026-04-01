import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
