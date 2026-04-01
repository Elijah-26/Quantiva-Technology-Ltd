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

    const { data, error } = await supabase
      .from('library_documents')
      .select('*')
      .order('title', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const documents = (data || []).map((row) => ({
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
      lastUpdated: row.last_updated || row.updated_at?.slice(0, 10) || '',
      preview: row.preview,
      readMinutes: row.read_minutes,
      complexity: row.complexity as 'Low' | 'Moderate' | 'High',
      versions: Array.isArray(row.versions) ? row.versions : [],
      relatedIds: (row.related_ids || []) as string[],
    }))

    return NextResponse.json({ documents })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
