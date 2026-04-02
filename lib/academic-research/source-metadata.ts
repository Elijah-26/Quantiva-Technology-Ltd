/**
 * Deterministic extraction of author/year for conservative in-text citations.
 * No LLM inference — only structured signals and light year regex on trusted snippets.
 */

export type EnrichedSourceFields = {
  author?: string
  year?: string
  /** True only when both author and year are set from high-confidence parsing */
  citeVerified?: boolean
}

/** Extract 4-digit year from text (first reasonable match). */
function extractYearFromText(text: string): string | undefined {
  const m = text.match(/\b(19[89]\d|20\d{2})\b/)
  return m ? m[1] : undefined
}

/** Pull common academic meta tags from raw HTML. */
export function parseCitationMetaFromHtml(html: string): EnrichedSourceFields {
  if (!html || html.length < 20) return {}

  let author: string | undefined
  let year: string | undefined

  const citationAuthor =
    html.match(/<meta[^>]+name=["']citation_author["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']citation_author["']/i)
  if (citationAuthor?.[1]) {
    author = citationAuthor[1].trim().split(',')[0]?.trim()
  }

  if (!author) {
    const dcCreator =
      html.match(/<meta[^>]+name=["']DC\.Creator["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']dc\.creator["'][^>]+content=["']([^"']+)["']/i)
    if (dcCreator?.[1]) author = dcCreator[1].trim().split(',')[0]?.trim()
  }

  const citationDate =
    html.match(/<meta[^>]+name=["']citation_publication_date["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']citation_publication_date["']/i) ||
    html.match(/<meta[^>]+name=["']citation_date["'][^>]+content=["']([^"']+)["']/i)
  if (citationDate?.[1]) {
    const y = extractYearFromText(citationDate[1])
    if (y) year = y
  }

  if (!year) {
    const pd =
      html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i)
    if (pd?.[1]) {
      const y = extractYearFromText(pd[1])
      if (y) year = y
    }
  }

  if (!year) {
    const jsonLd = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    if (jsonLd) {
      for (const block of jsonLd) {
        const inner = block.replace(/^[\s\S]*?>/, '').replace(/<\/script>$/i, '')
        try {
          const data = JSON.parse(inner) as unknown
          const arr = Array.isArray(data) ? data : [data]
          for (const item of arr) {
            if (!item || typeof item !== 'object') continue
            const o = item as Record<string, unknown>
            if (o['@type'] === 'ScholarlyArticle' || o['@type'] === 'Article' || o['@type'] === 'NewsArticle') {
              const a = o.author as Record<string, unknown> | Record<string, unknown>[] | string | undefined
              if (typeof a === 'string' && !author) author = a.split(',')[0]?.trim()
              else if (a && typeof a === 'object' && !Array.isArray(a) && typeof a.name === 'string' && !author) {
                author = String(a.name).split(',')[0]?.trim()
              } else if (Array.isArray(a) && a[0] && typeof a[0] === 'object' && typeof (a[0] as { name?: string }).name === 'string' && !author) {
                author = String((a[0] as { name: string }).name).split(',')[0]?.trim()
              }
              const d = o.datePublished || o.dateCreated
              if (typeof d === 'string' && !year) {
                const y = extractYearFromText(d)
                if (y) year = y
              }
            }
          }
        } catch {
          /* ignore */
        }
      }
    }
  }

  const citeVerified = Boolean(author && author.length > 1 && year && /^\d{4}$/.test(year))
  return citeVerified ? { author, year, citeVerified: true } : {}
}

export function mergeEnrichment(
  base: { title: string; excerpt: string },
  extra: EnrichedSourceFields
): EnrichedSourceFields {
  const year = extra.year || extractYearFromText(base.excerpt) || extractYearFromText(base.title)
  const author = extra.author
  const citeVerified = Boolean(author && author.length > 1 && year && /^\d{4}$/.test(year))
  if (citeVerified) return { author, year, citeVerified: true }
  if (year && !author) return { year }
  return {}
}
