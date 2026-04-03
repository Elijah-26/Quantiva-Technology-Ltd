import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'

const BUCKET = 'library-documents'

/** GET — download original uploaded file (authenticated). */
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: row, error } = await supabaseAdmin
      .from('library_documents')
      .select('id, file_storage_path, file_mime_type, original_filename')
      .eq('id', id)
      .maybeSingle()

    if (error || !row?.file_storage_path) {
      return NextResponse.json({ error: 'No file for this document' }, { status: 404 })
    }

    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(row.file_storage_path)

    if (dlErr || !blob) {
      console.error('storage download', dlErr)
      return NextResponse.json({ error: 'File unavailable' }, { status: 502 })
    }

    const mime = typeof row.file_mime_type === 'string' && row.file_mime_type ? row.file_mime_type : 'application/octet-stream'
    const filename =
      typeof row.original_filename === 'string' && row.original_filename ? row.original_filename : 'document'

    const ab = await blob.arrayBuffer()
    const safeAscii = filename.replace(/"/g, '').replace(/[^\x20-\x7E]/g, '_') || 'document'

    return new NextResponse(ab, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, max-age=0',
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
