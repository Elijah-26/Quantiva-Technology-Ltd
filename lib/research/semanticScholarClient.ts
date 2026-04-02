import type { Author, Paper } from './types'

const BASE = 'https://api.semanticscholar.org/graph/v1'
const TIMEOUT_MS = 10_000

const SEARCH_FIELDS =
  'title,authors,year,abstract,citationCount,externalIds,openAccessPdf,tldr,paperId'

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: 'application/json' }
  const key = process.env.SEMANTIC_SCHOLAR_API_KEY?.trim()
  if (key) h['x-api-key'] = key
  return h
}

async function fetchWithRetry(url: string): Promise<Response> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS)
  let res = await fetch(url, { headers: headers(), signal: ac.signal })
  clearTimeout(t)
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000))
    const ac2 = new AbortController()
    const t2 = setTimeout(() => ac2.abort(), TIMEOUT_MS)
    res = await fetch(url, { headers: headers(), signal: ac2.signal })
    clearTimeout(t2)
  }
  return res
}

type S2Author = { name?: string }
type S2Paper = {
  paperId?: string
  title?: string
  year?: number
  abstract?: string
  citationCount?: number
  authors?: S2Author[]
  externalIds?: { DOI?: string; ArXiv?: string }
  openAccessPdf?: { url?: string }
  tldr?: { text?: string }
}

type S2SearchResponse = { data?: S2Paper[] }

function s2ToPaper(p: S2Paper): Paper | null {
  const title = (p.title || '').trim()
  if (!title) return null
  const year = typeof p.year === 'number' ? p.year : 0
  if (year < 1000) return null

  const authors: Author[] = (p.authors || [])
    .map((a) => {
      const n = a.name?.trim()
      return n ? { name: n } : null
    })
    .filter((x): x is Author => x != null)

  const doi = p.externalIds?.DOI?.trim()
  const abstract = (p.abstract || '').trim()
  if (!abstract) return null

  const pdf = p.openAccessPdf?.url?.trim()
  const url =
    pdf && pdf.startsWith('http')
      ? pdf
      : doi
        ? `https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//i, '')}`
        : `https://www.semanticscholar.org/paper/${p.paperId || 'unknown'}`

  return {
    id: p.paperId || `s2:${doi || title.slice(0, 30)}`,
    doi: doi?.replace(/^https?:\/\/doi\.org\//i, ''),
    title,
    authors,
    year,
    abstract,
    citationCount: typeof p.citationCount === 'number' ? p.citationCount : 0,
    openAccessUrl: pdf && pdf.startsWith('http') ? pdf : undefined,
    tldr: p.tldr?.text?.trim() || undefined,
    source: 'semantic_scholar',
  }
}

export async function searchPapers(
  query: string,
  options?: { limit?: number; minCitations?: number }
): Promise<Paper[]> {
  const q = query.trim()
  if (q.length < 2) return []

  try {
    const limit = Math.min(options?.limit ?? 15, 50)
    const url = new URL(`${BASE}/paper/search`)
    url.searchParams.set('query', q.slice(0, 500))
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('fields', SEARCH_FIELDS)

    const res = await fetchWithRetry(url.toString())
    if (!res.ok) return []

    const json = (await res.json()) as S2SearchResponse
    const rows = json.data || []
    const out: Paper[] = []
    for (const row of rows) {
      const p = s2ToPaper(row)
      if (!p) continue
      if (typeof options?.minCitations === 'number' && p.citationCount < options.minCitations) continue
      out.push(p)
    }
    return out
  } catch {
    return []
  }
}

export async function getPaperReferences(paperId: string): Promise<Paper[]> {
  const id = encodeURIComponent(paperId.trim())
  if (!id) return []
  try {
    const url = `${BASE}/paper/${id}/references?fields=title,authors,year,abstract,citationCount,externalIds,openAccessPdf,tldr,paperId&limit=50`
    const res = await fetchWithRetry(url)
    if (!res.ok) return []
    const json = (await res.json()) as { data?: Array<{ citedPaper?: S2Paper }> }
    const out: Paper[] = []
    for (const row of json.data || []) {
      const cp = row.citedPaper
      if (!cp) continue
      const p = s2ToPaper(cp)
      if (p) out.push(p)
    }
    return out
  } catch {
    return []
  }
}

export async function getPaperTldr(paperId: string): Promise<string | null> {
  const id = encodeURIComponent(paperId.trim())
  if (!id) return null
  try {
    const url = `${BASE}/paper/${id}?fields=tldr`
    const res = await fetchWithRetry(url)
    if (!res.ok) return null
    const json = (await res.json()) as { tldr?: { text?: string } }
    return json.tldr?.text?.trim() || null
  } catch {
    return null
  }
}
