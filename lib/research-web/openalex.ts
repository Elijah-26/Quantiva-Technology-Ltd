import type { WebResearchSource } from './types'
import type { AcademicTemplateType } from '@/lib/academic-research/types'

type OpenAlexWork = {
  id?: string
  title?: string
  display_name?: string
  publication_year?: number
  authorships?: { author?: { display_name?: string } }[]
  primary_location?: { landing_page_url?: string; source?: { display_name?: string } }
}

type OpenAlexResponse = {
  results?: OpenAlexWork[]
}

/**
 * Optional enrichment: fetch a few OpenAlex works for academic-style metadata (author + year).
 * No API key required for moderate use. Merged alongside Firecrawl results.
 */
export async function fetchOpenAlexSources(
  templateType: AcademicTemplateType,
  topicQuery: string,
  limit = 3
): Promise<WebResearchSource[]> {
  const q = topicQuery.trim()
  if (!q || q.length < 3) return []

  const researchy: AcademicTemplateType[] = [
    'dissertation_thesis',
    'literature_review',
    'research_paper',
    'research_proposal',
  ]
  if (!researchy.includes(templateType)) return []

  try {
    const url = new URL('https://api.openalex.org/works')
    url.searchParams.set('search', q.slice(0, 280))
    url.searchParams.set('per_page', String(Math.min(limit, 5)))
    url.searchParams.set('select', 'id,title,display_name,publication_year,authorships,primary_location')

    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 12_000)
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return []
    const json = (await res.json()) as OpenAlexResponse
    const rows = json.results || []
    const out: WebResearchSource[] = []

    for (const w of rows) {
      const title = (w.title || w.display_name || '').trim()
      if (!title) continue
      const year = w.publication_year != null ? String(w.publication_year) : undefined
      const firstAuthor = w.authorships?.[0]?.author?.display_name?.trim()
      const landing = w.primary_location?.landing_page_url?.trim()
      const idStr = typeof w.id === 'string' ? w.id.trim() : ''
      let url = landing && landing.startsWith('http') ? landing : ''
      if (!url && idStr.startsWith('http')) {
        url = idStr.replace('https://api.openalex.org/works/', 'https://openalex.org/')
      }
      if (!url.startsWith('http')) continue
      const citeVerified = Boolean(firstAuthor && year && /^\d{4}$/.test(year))

      out.push({
        url,
        title,
        excerpt: firstAuthor && year ? `${firstAuthor} (${year}). ${title}` : title,
        provider: 'openalex',
        author: firstAuthor,
        year,
        citeVerified,
      })
    }
    return out
  } catch {
    return []
  }
}
