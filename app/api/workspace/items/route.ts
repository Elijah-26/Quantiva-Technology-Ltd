import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

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

    const [{ data: ownedRows, error: ownedErr }, { data: shareRows, error: shareErr }] =
      await Promise.all([
        supabase.from('workspace_items').select('*').eq('user_id', user.id).order('updated_at', {
          ascending: false,
        }),
        supabase
          .from('workspace_item_shares')
          .select('workspace_item_id')
          .eq('shared_with_user_id', user.id),
      ])

    if (ownedErr) {
      return NextResponse.json({ error: ownedErr.message }, { status: 500 })
    }
    if (shareErr) {
      return NextResponse.json({ error: shareErr.message }, { status: 500 })
    }

    const shareIds = [...new Set((shareRows || []).map((r) => r.workspace_item_id).filter(Boolean))]
    let sharedItems: Record<string, unknown>[] = []
    if (shareIds.length) {
      const { data: sItems, error: sErr } = await supabase
        .from('workspace_items')
        .select('*')
        .in('id', shareIds)
        .order('updated_at', { ascending: false })
      if (sErr) {
        return NextResponse.json({ error: sErr.message }, { status: 500 })
      }
      sharedItems = sItems || []
    }

    const merged = new Map<string, { row: Record<string, unknown>; isOwner: boolean }>()
    for (const row of ownedRows || []) {
      merged.set(row.id as string, { row: row as Record<string, unknown>, isOwner: true })
    }
    for (const row of sharedItems) {
      const id = row.id as string
      if (!merged.has(id)) merged.set(id, { row, isOwner: false })
    }

    const folderIds = [
      ...new Set(
        [...merged.values()]
          .map((v) => v.row.folder_id as string | null)
          .filter((fid): fid is string => Boolean(fid))
      ),
    ]

    const folderMeta = new Map<string, { slug: string; name: string }>()
    if (folderIds.length) {
      const { data: folders } = await supabaseAdmin
        .from('workspace_folders')
        .select('id, slug, name')
        .in('id', folderIds)
      for (const f of folders || []) {
        folderMeta.set(f.id as string, { slug: f.slug as string, name: f.name as string })
      }
    }

    const items = [...merged.values()].map(({ row, isOwner }) => {
      const folderId = row.folder_id as string | null
      const meta = folderId ? folderMeta.get(folderId) : undefined
      return {
        id: row.id as string,
        title: row.title,
        type: row.doc_type || 'Document',
        folder: meta?.slug || 'all',
        folderName: meta?.name ?? null,
        date: new Date(row.updated_at as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        isFavorite: row.is_favorite,
        status: row.status,
        folderId,
        libraryDocumentId: row.library_document_id ?? null,
        generationJobId: row.generation_job_id ?? null,
        hasStoredContent: Boolean(row.content_text),
        isOwner,
      }
    })

    items.sort((a, b) => {
      const ra = merged.get(a.id)?.row.updated_at as string
      const rb = merged.get(b.id)?.row.updated_at as string
      return new Date(rb).getTime() - new Date(ra).getTime()
    })

    return NextResponse.json({ items })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
