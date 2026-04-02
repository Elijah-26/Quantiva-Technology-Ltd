import type { Author, Paper } from './types'
import { reconstructAbstract } from './abstractReconstructor'

const BASE = 'https://api.openalex.org'
const TIMEOUT_MS = 10_000

function getMailto(): string {
  return (process.env.OPENALEX_EMAIL || 'app@localhost').trim()
}

type OpenAlexWork = {
  id?: string
  display_name?: string
  title?: string
  doi?: string
  publication_year?: number
  cited_by_count?: number
  abstract_inverted_index?: Record<string, number[]>
  authorships?: Array<{ author?: { display_name?: string; orcid?: string } }>
  primary_location?: {
    source?: { display_name?: string }
    landing_page_url?: string
    pdf_url?: string
  }
  open_access?: { oa_url?: string; is_oa?: boolean }
  best_oa_location?: { url?: string; pdf_url?: string }
  concepts?: Array<{ display_name?: string }>
}

type OpenAlexListResponse = {
  results?: OpenAlexWork[]
}

function workToPaper(w: OpenAlexWork): Paper | null {
  const title = (w.display_name || w.title || '').trim()
  if (!title) return null
  const year = w.publication_year
  if (typeof year !== 'number' || year < 1000) return null

  const authors: Author[] = (w.authorships || [])
    .map((a) => {
      const n = a.author?.display_name?.trim()
      if (!n) return null
      const orcid = a.author?.orcid
      return { name: n, ...(orcid ? { orcid } : {}) } as Author
    })
    .filter((x): x is Author => x != null)

  const abstract = reconstructAbstract(w.abstract_inverted_index)
  if (!abstract.trim()) return null

  let doi = w.doi?.replace(/^https?:\/\/doi\.org\//i, '') || undefined

  const landing = w.primary_location?.landing_page_url?.trim()
  const oaUrl =
    w.best_oa_location?.pdf_url ||
    w.best_oa_location?.url ||
    w.open_access?.oa_url ||
    w.primary_location?.pdf_url ||
    undefined

  let url = landing && landing.startsWith('http') ? landing : ''
  if (!url && w.id?.startsWith('https://openalex.org/')) url = w.id
  if (!url && w.id) {
    const idShort = w.id.replace('https://api.openalex.org/', '')
    url = `https://openalex.org/${idShort}`
  }
  if (!url.startsWith('http')) url = 'https://openalex.org/'

  const journal = w.primary_location?.source?.display_name?.trim()
  const concepts = (w.concepts || [])
    .slice(0, 8)
    .map((c) => c.display_name)
    .filter((x): x is string => Boolean(x))

  return {
    id: w.id || `openalex:${title.slice(0, 40)}`,
    doi,
    title,
    authors,
    year,
    journal,
    abstract,
    citationCount: typeof w.cited_by_count === 'number' ? w.cited_by_count : 0,
    openAccessUrl: oaUrl?.startsWith('http') ? oaUrl : undefined,
    source: 'openalex',
    concepts,
  }
}

export async function searchPapers(
  query: string,
  options?: { yearFrom?: number; minCitations?: number; limit?: number; requireAbstract?: boolean }
): Promise<Paper[]> {
  const q = query.trim()
  if (q.length < 2) return []

  try {
    const url = new URL(`${BASE}/works`)
    url.searchParams.set('search', q.slice(0, 400))
    url.searchParams.set('per_page', String(Math.min(options?.limit ?? 20, 50)))
    url.searchParams.set('sort', 'cited_by_count:desc')
    url.searchParams.set('mailto', getMailto())

    const filters: string[] = []
    if (options?.requireAbstract !== false) filters.push('has_abstract:true')
    if (typeof options?.yearFrom === 'number' && options.yearFrom > 1900) {
      filters.push(`publication_year:>${options.yearFrom - 1}`)
    }
    if (typeof options?.minCitations === 'number' && options.minCitations > 0) {
      filters.push(`cited_by_count:>${options.minCitations}`)
    }
    if (filters.length) url.searchParams.set('filter', filters.join(','))

    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), TIMEOUT_MS)
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return []

    const json = (await res.json()) as OpenAlexListResponse
    const rows = json.results || []
    const out: Paper[] = []
    for (const w of rows) {
      const p = workToPaper(w)
      if (p) out.push(p)
    }
    return out
  } catch {
    return []
  }
}

export async function getPaper(openAlexId: string): Promise<Paper | null> {
  const id = openAlexId.trim()
  if (!id) return null
  try {
    const path = id.startsWith('http') ? id.replace('https://api.openalex.org/', '') : id
    const url = `${BASE}/works/${encodeURIComponent(path)}?mailto=${encodeURIComponent(getMailto())}`
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), TIMEOUT_MS)
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (!res.ok) return null
    const w = (await res.json()) as OpenAlexWork
    return workToPaper(w)
  } catch {
    return null
  }
}
