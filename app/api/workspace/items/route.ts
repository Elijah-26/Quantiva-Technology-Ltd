import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const { data: folders } = await supabase
      .from('workspace_folders')
      .select('id, slug')
      .eq('user_id', user.id)

    const slugByFolderId = new Map<string, string>()
    for (const f of folders || []) {
      slugByFolderId.set(f.id, f.slug)
    }

    const { data: items, error } = await supabase
      .from('workspace_items')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mapped = (items || []).map((row) => ({
      id: row.id,
      title: row.title,
      type: row.doc_type || 'Document',
      folder: row.folder_id ? slugByFolderId.get(row.folder_id) || 'all' : 'all',
      date: new Date(row.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isFavorite: row.is_favorite,
      status: row.status,
      folderId: row.folder_id,
      libraryDocumentId: row.library_document_id,
    }))

    return NextResponse.json({ items: mapped })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
