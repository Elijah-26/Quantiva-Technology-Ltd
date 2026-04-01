import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    jurisdiction: row.jurisdiction,
    accessLevel: row.access_level,
    wordCount: row.word_count,
    downloadCount: row.download_count,
    rating: Number(row.rating),
    isFavorite: false,
    lastUpdated: row.last_updated || String(row.updated_at || '').slice(0, 10),
    preview: row.preview,
    readMinutes: row.read_minutes,
    complexity: row.complexity as 'Low' | 'Moderate' | 'High',
    versions: Array.isArray(row.versions) ? row.versions : [],
    relatedIds: (row.related_ids || []) as string[],
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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

    const { data: row, error } = await supabase
      .from('library_documents')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ document: mapRow(row as Record<string, unknown>) })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
