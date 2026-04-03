import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

/** GET single workspace item; RLS allows owner, org readers, or explicit share. */
export async function GET(
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: row, error } = await supabase
      .from('workspace_items')
      .select(
        'id, title, doc_type, status, content_text, generation_job_id, library_document_id, folder_id, updated_at, user_id'
      )
      .eq('id', id)
      .single()

    if (error || !row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isOwner = row.user_id === user.id
    let folderName: string | null = null
    if (row.folder_id) {
      const { data: f } = await supabaseAdmin
        .from('workspace_folders')
        .select('name')
        .eq('id', row.folder_id)
        .maybeSingle()
      folderName = (f?.name as string) ?? null
    }

    return NextResponse.json({
      item: {
        id: row.id,
        title: row.title,
        docType: row.doc_type,
        status: row.status,
        contentText: row.content_text,
        generationJobId: row.generation_job_id,
        libraryDocumentId: row.library_document_id,
        folderId: row.folder_id,
        folderName,
        updatedAt: row.updated_at,
        isOwner,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const body = await request.json().catch(() => ({}))
    const patch: Record<string, unknown> = {}

    if (typeof body.title === 'string') {
      const t = body.title.trim()
      if (!t || t.length > 500) {
        return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
      }
      patch.title = t
    }
    if (typeof body.isFavorite === 'boolean') {
      patch.is_favorite = body.isFavorite
    }
    if (body.folderId === null) {
      patch.folder_id = null
    } else if (typeof body.folderId === 'string' && body.folderId.length > 0) {
      const { data: folder } = await supabase
        .from('workspace_folders')
        .select('id')
        .eq('id', body.folderId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
      }
      patch.folder_id = body.folderId
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
    }

    patch.updated_at = new Date().toISOString()

    const { data: updated, error: updErr } = await supabase
      .from('workspace_items')
      .update(patch)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, title, doc_type, status, folder_id, is_favorite, updated_at')
      .maybeSingle()

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }
    if (!updated) {
      return NextResponse.json({ error: 'Not found or not allowed' }, { status: 404 })
    }

    return NextResponse.json({
      item: {
        id: updated.id,
        title: updated.title,
        docType: updated.doc_type,
        status: updated.status,
        folderId: updated.folder_id,
        isFavorite: updated.is_favorite,
        updatedAt: updated.updated_at,
      },
    })
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

    const { data: deleted, error: delErr } = await supabase
      .from('workspace_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle()

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }
    if (!deleted) {
      return NextResponse.json({ error: 'Not found or not allowed' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
