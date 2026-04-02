import type { Paper } from './types'
import type { WebResearchSource } from '@/lib/research-web/types'
import { lastName } from './citationFormatter'

function firstAuthorLast(authors: { name: string }[]): string {
  if (!authors.length) return ''
  return lastName(authors[0].name)
}

function paperUrl(p: Paper): string {
  if (p.openAccessUrl?.startsWith('http')) return p.openAccessUrl
  if (p.doi) return `https://doi.org/${p.doi.replace(/^https?:\/\/doi\.org\//i, '')}`
  if (p.source === 'openalex' && p.id.startsWith('http')) return p.id
  if (p.source === 'openalex') return `https://openalex.org/${p.id.replace(/^https:\/\/api\.openalex\.org\/works\//, '')}`
  return `https://www.semanticscholar.org/paper/${encodeURIComponent(p.id)}`
}

/** Maps scholarly papers to persisted scraped_context rows (extends WebResearchSource). */
export function papersToWebResearchSources(papers: Paper[]): WebResearchSource[] {
  return papers.map((p) => {
    const author = firstAuthorLast(p.authors)
    const yearStr = String(p.year)
    const citeVerified = Boolean(
      author.length > 0 && p.year >= 1000 && p.authors.length > 0
    )
    const excerptParts = [p.abstract.slice(0, 1400)]
    if (p.tldr) excerptParts.push(`Summary: ${p.tldr}`)
    return {
      url: paperUrl(p),
      title: p.title,
      excerpt: excerptParts.filter(Boolean).join('\n\n'),
      provider: p.source === 'openalex' ? 'openalex' : 'semantic_scholar',
      author: author || undefined,
      year: yearStr,
      citeVerified,
      doi: p.doi,
      paperId: p.id,
      tldr: p.tldr,
      journal: p.journal,
      citationCount: p.citationCount,
    }
  })
}
