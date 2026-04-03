import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function approxWordsFromTargetBand(band: string): number {
  const m: Record<string, number> = {
    '5k': 5000,
    '8k': 8000,
    '12k': 12000,
    '15k': 15000,
    '80k': 80000,
  }
  return m[band] || 0
}

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
      .select(
        'id, title, description, category, jurisdiction, access_level, word_count, download_count, rating, last_updated, preview, read_minutes, complexity, versions, related_ids, created_at, updated_at, source, created_by_user_id, file_storage_path, original_filename'
      )
      .order('title', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const libraryDocs = (data || []).map((row) => {
      const r = row as {
        file_storage_path?: string | null
        original_filename?: string | null
      }
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
        lastUpdated: row.last_updated || row.updated_at?.slice(0, 10) || '',
        preview: row.preview,
        readMinutes: row.read_minutes,
        complexity: row.complexity as 'Low' | 'Moderate' | 'High',
        versions: Array.isArray(row.versions) ? row.versions : [],
        relatedIds: (row.related_ids || []) as string[],
        source: (row as { source?: string }).source ?? 'curated',
        createdByUserId: (row as { created_by_user_id?: string | null }).created_by_user_id ?? null,
        documentKind: 'library' as const,
        hasFileAttachment: Boolean(r.file_storage_path),
        originalFilename: r.original_filename ?? null,
      }
    })

    const { data: sessions, error: sesErr } = await supabase
      .from('academic_research_sessions')
      .select(
        'id, title, template_type, status, citation_style, word_target_band, updated_at, created_at'
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100)

    if (sesErr) {
      return NextResponse.json({ error: sesErr.message }, { status: 500 })
    }

    const academicDocs = (sessions || []).map((s) => {
      const tpl = String(s.template_type || '').replace(/_/g, ' ')
      const status = String(s.status || 'draft')
      const band = String(s.word_target_band || '')
      const approx = approxWordsFromTargetBand(band)
      const updated = s.updated_at?.slice(0, 10) || ''
      return {
        id: s.id,
        title: s.title || tpl,
        description: `Academic research (${tpl}) · ${status}`,
        category: 'academic',
        jurisdiction: '',
        accessLevel: 'free',
        wordCount: approx,
        downloadCount: 0,
        rating: 0,
        isFavorite: false,
        lastUpdated: updated,
        preview: `Session status: ${status}. Open in Academic Research to view or export.`,
        readMinutes: approx > 0 ? Math.max(1, Math.ceil(approx / 200)) : 1,
        complexity: 'Moderate' as const,
        versions: [] as { version: string; date: string; note: string }[],
        relatedIds: [] as string[],
        source: 'academic_research' as const,
        createdByUserId: user.id,
        documentKind: 'academic' as const,
        hasFileAttachment: false,
        originalFilename: null,
      }
    })

    const documents = [...libraryDocs, ...academicDocs].sort((a, b) =>
      String(b.lastUpdated).localeCompare(String(a.lastUpdated))
    )

    return NextResponse.json({ documents })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
