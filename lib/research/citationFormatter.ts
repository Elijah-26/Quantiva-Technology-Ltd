import type { Citation, CitationStyle, Paper } from './types'

export function lastName(fullName: string): string {
  const t = fullName.trim()
  if (!t) return 'Unknown'
  const parts = t.split(/\s+/)
  if (parts.length === 1) return parts[0]
  return parts[parts.length - 1].replace(/,/g, '')
}

function apaAuthorSegment(a: { name: string }): string {
  const parts = a.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'Unknown'
  const last = lastName(a.name)
  const given = parts.slice(0, -1)
  const initials = given.map((g) => `${g[0]}.`).join(' ')
  return initials ? `${last}, ${initials}` : last
}

/** One author segment for reference list; trailing period when required by APA. */
function apaRefAuthorPiece(a: { name: string }): string {
  const seg = apaAuthorSegment(a)
  return seg.endsWith('.') ? seg : `${seg}.`
}

function apaInText(p: Paper): string {
  const n = p.authors.length
  const y = p.year
  if (n === 0) return `(n.d.)`
  if (n === 1) return `(${lastName(p.authors[0].name)}, ${y})`
  if (n === 2) return `(${lastName(p.authors[0].name)} & ${lastName(p.authors[1].name)}, ${y})`
  return `(${lastName(p.authors[0].name)} et al., ${y})`
}

function apaFull(p: Paper): string {
  let auth = 'Unknown.'
  if (p.authors.length === 1) auth = apaRefAuthorPiece(p.authors[0])
  else if (p.authors.length === 2)
    auth = `${apaRefAuthorPiece(p.authors[0])}, & ${apaRefAuthorPiece(p.authors[1])}`
  else if (p.authors.length > 2)
    auth = `${p.authors
      .slice(0, -1)
      .map(apaRefAuthorPiece)
      .join(', ')}, & ${apaRefAuthorPiece(p.authors[p.authors.length - 1])}`
  const j = p.journal ? ` ${p.journal}.` : ''
  const doi = p.doi ? ` https://doi.org/${p.doi.replace(/^https?:\/\/doi\.org\//i, '')}` : ''
  return `${auth} (${p.year}). ${p.title}.${j}${doi}`.trim()
}

function mlaInText(p: Paper): string {
  if (p.authors.length === 0) return `("${p.title.slice(0, 20)}…")`
  if (p.authors.length === 1) return `(${lastName(p.authors[0].name)})`
  if (p.authors.length === 2)
    return `(${lastName(p.authors[0].name)} and ${lastName(p.authors[1].name)})`
  return `(${lastName(p.authors[0].name)} et al.)`
}

function mlaFull(p: Paper): string {
  const a0 = p.authors[0]?.name || 'Unknown'
  const rest =
    p.authors.length > 1
      ? `, et al.`
      : ''
  const j = p.journal ? ` ${p.journal},` : ''
  const doi = p.doi ? ` https://doi.org/${p.doi.replace(/^https?:\/\/doi\.org\//i, '')}.` : '.'
  return `${a0}${rest} "${p.title}."${j} ${p.year},${doi}`.replace(/,\s*\./g, '.').trim()
}

function chicagoInText(p: Paper): string {
  return apaInText(p).replace('&', 'and')
}

function chicagoFull(p: Paper): string {
  const auth = p.authors.map((a) => `${lastName(a.name)}, ${a.name.split(/\s+/)[0]}`).join(', ')
  const j = p.journal ? ` ${p.journal}` : ''
  const doi = p.doi ? ` https://doi.org/${p.doi.replace(/^https?:\/\/doi\.org\//i, '')}` : ''
  return `${auth}. "${p.title}."${j} (${p.year}).${doi}`.trim()
}

function ieeeInText(ordinal: number): string {
  return `[${ordinal}]`
}

function ieeeFull(p: Paper, ordinal: number): string {
  const initials = p.authors
    .map((a) => {
      const ps = a.name.split(/\s+/)
      const last = lastName(a.name)
      const ini = ps
        .slice(0, -1)
        .map((x) => `${x[0]}.`)
        .join(' ')
      return ini ? `${ini} ${last}` : last
    })
    .join(', ')
  const j = p.journal ? ` ${p.journal}` : ''
  const doi = p.doi ? ` doi: ${p.doi.replace(/^https?:\/\/doi\.org\//i, '')}` : ''
  return `[${ordinal}] ${initials}, "${p.title},"${j}, ${p.year}.${doi}`.trim()
}

export function formatInTextCitation(
  paper: Paper,
  style: CitationStyle,
  options?: { pageNumber?: string; ieeeOrdinal?: number }
): string {
  let base: string
  switch (style) {
    case 'MLA':
      base = mlaInText(paper)
      break
    case 'Chicago':
      base = chicagoInText(paper)
      break
    case 'IEEE':
      base = ieeeInText(options?.ieeeOrdinal ?? 1)
      break
    case 'APA':
    default:
      base = apaInText(paper)
  }
  if (options?.pageNumber && style !== 'IEEE') {
    base = base.replace(/\)$/, `, p. ${options.pageNumber})`)
  }
  return base
}

export function formatCitation(paper: Paper, style: CitationStyle, ieeeOrdinal?: number): Citation {
  let fullReference: string
  let inText: string
  switch (style) {
    case 'MLA':
      fullReference = mlaFull(paper)
      inText = mlaInText(paper)
      break
    case 'Chicago':
      fullReference = chicagoFull(paper)
      inText = chicagoInText(paper)
      break
    case 'IEEE':
      fullReference = ieeeFull(paper, ieeeOrdinal ?? 1)
      inText = ieeeInText(ieeeOrdinal ?? 1)
      break
    case 'APA':
    default:
      fullReference = apaFull(paper)
      inText = apaInText(paper)
  }
  return {
    inText,
    fullReference,
    doi: paper.doi,
  }
}

export function generateReferenceList(papers: Paper[], style: CitationStyle): string[] {
  return papers.map((p, i) => formatCitation(p, style, style === 'IEEE' ? i + 1 : undefined).fullReference)
}

export function mapSessionCitationStyle(raw: string | undefined): CitationStyle {
  const s = (raw || 'apa').toLowerCase()
  if (s === 'mla') return 'MLA'
  if (s === 'chicago') return 'Chicago'
  if (s === 'ieee') return 'IEEE'
  if (s === 'harvard') return 'APA'
  return 'APA'
}
