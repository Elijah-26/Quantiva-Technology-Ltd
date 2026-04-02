import type { AcademicTemplateType, OutlineItem } from './types'

function safeJsonParseArray(raw: string): unknown[] {
  try {
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export async function openaiChat(
  system: string,
  user: string,
  maxTokens: number
): Promise<{ text: string; error?: string }> {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return {
      text: '',
      error: 'OPENAI_API_KEY is not configured',
    }
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: maxTokens,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      return { text: '', error: json?.error?.message || 'OpenAI request failed' }
    }
    const text = json?.choices?.[0]?.message?.content?.trim()
    if (!text) return { text: '', error: 'Empty model response' }
    return { text }
  } catch (e) {
    return { text: '', error: e instanceof Error ? e.message : 'Generation failed' }
  }
}

type ScrapedRow = {
  title?: string
  excerpt?: string
  author?: string
  year?: string
  citeVerified?: boolean
}

export function summarizeScraped(scraped: unknown): string {
  if (!Array.isArray(scraped)) return ''
  const lines = (scraped as { title?: string; excerpt?: string }[])
    .slice(0, 5)
    .map((s, i) => `[${i + 1}] ${s.title || 'Source'}\n${(s.excerpt || '').slice(0, 600)}`)
  return lines.join('\n\n')
}

/**
 * Catalog for the model: only sources marked CITATION_OK may receive (Author, Year) in the body.
 */
export function formatSourceCatalog(scraped: unknown): string {
  if (!Array.isArray(scraped) || scraped.length === 0) {
    return `(No web sources. Do NOT use parenthetical (Author, Year) citations in the body. Use neutral attribution, e.g. "Previous work suggests…", without invented names or dates.)`
  }
  return (scraped as ScrapedRow[])
    .slice(0, 14)
    .map((s, i) => {
      const n = i + 1
      const title = (s.title || 'Source').trim()
      const url = String((s as { url?: string }).url || '').trim()
      const lines = [`Source ${n}: ${title}`]
      if (url) lines.push(`  URL: ${url}`)
      if (s.citeVerified && s.author && s.year) {
        lines.push(
          `  CITATION_OK: yes — you may cite in prose as (${s.author}, ${s.year}) when this source is relevant.`
        )
      } else {
        lines.push(
          `  CITATION_OK: no — do not use (Author, Year) for this source; paraphrase without a parenthetical citation.`
        )
      }
      return lines.join('\n')
    })
    .join('\n\n')
}

function answersSummary(answers: Record<string, unknown>): string {
  const skip = new Set(['_meta', 'citation_style', 'word_target_band', '_documentPlan'])
  return Object.entries(answers)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => `${k}: ${String(v).slice(0, 800)}`)
    .join('\n')
}

const OUTLINE_SYSTEM = `You are an academic writing assistant. Output ONLY valid JSON: an array of objects with keys "slug" (kebab-case id), "heading" (human title), "sort_order" (integer starting at 0). 
No markdown fences. Sections must follow conventions for the document type. Use 6–14 sections. Do not include a separate "References" section in the outline (references are added later). Do not invent empirical results.`

export async function generateOutlineJson(input: {
  templateType: AcademicTemplateType
  answers: Record<string, unknown>
  scrapedContext: unknown
}): Promise<{ outline: OutlineItem[]; error?: string; raw?: string }> {
  const scraped = summarizeScraped(input.scrapedContext)
  const user = `Document type: ${input.templateType}

User inputs:
${answersSummary(input.answers)}

Web research excerpts (may be empty):
${scraped || '(none)'}

Produce outline sections appropriate for this type. For research_paper favour IMRaD-style. For dissertation_thesis use chapter-level blocks (Introduction, Literature review, Methodology, etc.).`

  const { text, error } = await openaiChat(OUTLINE_SYSTEM, user, 2000)
  if (error || !text) return { outline: [], error, raw: text }

  const arr = safeJsonParseArray(text)
  const outline: OutlineItem[] = []
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i] as Record<string, unknown>
    const slug = String(row.slug || `section-${i}`).replace(/\s+/g, '-').toLowerCase()
    const heading = String(row.heading || `Section ${i + 1}`)
    const sort_order = typeof row.sort_order === 'number' ? row.sort_order : i
    outline.push({ slug, heading, sort_order })
  }
  outline.sort((a, b) => a.sort_order - b.sort_order)
  return { outline }
}

function sectionSystem(
  templateType: AcademicTemplateType,
  citationStyle: string,
  sectionNumber: number,
  totalSections: number
): string {
  return `You write formal academic prose suitable for a thesis or major research document.

Target citation style for any parenthetical cites: ${citationStyle || 'APA'}.

STRICT RULES:
- Use parenthetical (Author, Year) in the body ONLY for sources explicitly marked "CITATION_OK: yes" in the source list. Use the exact Author and Year given there.
- Never use [S1], [S2], or similar tags. Never write (Author, n.d.) or invented author names or years.
- For sources with CITATION_OK: no, integrate ideas without parenthetical citations (general attribution is fine).

Section ${sectionNumber} of ${totalSections} (main body). Do NOT start the body with a duplicate "#" title line for the whole document. Use ### subheadings inside this section with decimal labels ${sectionNumber}.1, ${sectionNumber}.2, ${sectionNumber}.3, etc., for subsections.

Document type context: ${templateType}. No meta-commentary about being an AI. Substantive paragraphs.`
}

export async function generateSectionBody(input: {
  templateType: AcademicTemplateType
  citationStyle: string
  answers: Record<string, unknown>
  scrapedSummary: string
  sourceCatalog: string
  outline: OutlineItem[]
  sectionSlug: string
  sectionHeading: string
  sectionNumber: number
  totalSections: number
}): Promise<{ body: string; error?: string }> {
  const outlineStr = input.outline
    .map((o, idx) => `${idx + 1}. ${o.slug}: ${o.heading}`)
    .join('\n')
  const user = `SOURCE LIST (follow CITATION_OK rules exactly):
${input.sourceCatalog}

Full document outline (you are writing section ${input.sectionNumber} only):
${outlineStr}

Section to write — main heading label: "${input.sectionNumber}. ${input.sectionHeading}" (slug: ${input.sectionSlug})

User inputs:
${answersSummary(input.answers)}

Research excerpts (condensed):
${input.scrapedSummary || '(none)'}

Write this section only. Target roughly 400–900 words unless the section is intentionally short (e.g. abstract). Use ### ${input.sectionNumber}.1, ### ${input.sectionNumber}.2, … for internal subsections.`

  const { text, error } = await openaiChat(
    sectionSystem(
      input.templateType,
      input.citationStyle,
      input.sectionNumber,
      input.totalSections
    ),
    user,
    3500
  )
  if (error || !text) return { body: '', error }
  return { body: text }
}

const FINALIZE_SYSTEM = `You produce a References / Bibliography section only. Output plain text, one reference per block separated by a blank line.

Include EVERY source from the SOURCE LIST below. For each source always include title and URL (when URL is present).
When a source had CITATION_OK: yes, format the entry in the user's citation style using that author and year.
When CITATION_OK: no, list title and URL only — do not invent authors or years.

Do not use [Sn] markers. Do not invent DOIs or page numbers. No preamble or closing commentary.`

export async function generateReferencesAppendix(input: {
  citationStyle: string
  combinedSectionBodies: string
  sourceCatalog: string
}): Promise<{ text: string; error?: string }> {
  const user = `Citation style: ${input.citationStyle || 'APA'}

SOURCE LIST:
${input.sourceCatalog}

BODY TEXT (excerpt; for context only — list all sources from SOURCE LIST regardless):
${input.combinedSectionBodies.slice(0, 12_000)}${input.combinedSectionBodies.length > 12_000 ? '\n\n[…truncated…]' : ''}

Produce the References section only.`

  const { text, error } = await openaiChat(FINALIZE_SYSTEM, user, 2500)
  if (error || !text) return { text: '', error }
  return { text }
}
