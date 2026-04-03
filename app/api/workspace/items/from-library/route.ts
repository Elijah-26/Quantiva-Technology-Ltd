import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { recordAuditEvent } from '@/lib/audit'

/** Save a library template into the user's workspace. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const libraryDocumentId = typeof body.libraryDocumentId === 'string' ? body.libraryDocumentId : ''
    const folderSlug = typeof body.folderSlug === 'string' ? body.folderSlug : 'contracts'
    const folderIdBody = typeof body.folderId === 'string' && body.folderId.length > 0 ? body.folderId : null
    if (!libraryDocumentId) {
      return NextResponse.json({ error: 'libraryDocumentId required' }, { status: 400 })
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

    const { data: libDoc, error: libErr } = await supabase
      .from('library_documents')
      .select('title, category')
      .eq('id', libraryDocumentId)
      .single()

    if (libErr || !libDoc) {
      return NextResponse.json({ error: 'Library document not found' }, { status: 404 })
    }

    let folderId: string | null = null
    if (folderIdBody) {
      const { data: byId } = await supabase
        .from('workspace_folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('id', folderIdBody)
        .maybeSingle()
      if (byId) folderId = byId.id as string
    }
    if (!folderId) {
      const { data: folderRow } = await supabase
        .from('workspace_folders')
        .select('id')
        .eq('user_id', user.id)
        .eq('slug', folderSlug)
        .maybeSingle()
      if (folderRow) folderId = folderRow.id as string
    }

    const { data: item, error: insErr } = await supabase
      .from('workspace_items')
      .insert({
        user_id: user.id,
        folder_id: folderId,
        title: libDoc.title,
        doc_type: libDoc.category,
        status: 'saved',
        is_favorite: false,
        library_document_id: libraryDocumentId,
      })
      .select()
      .single()

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 })
    }

    await recordAuditEvent(supabaseAdmin, {
      actorUserId: user.id,
      action: 'workspace.saved_from_library',
      entityType: 'workspace_item',
      entityId: item.id,
      metadata: { libraryDocumentId, title: libDoc.title },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
