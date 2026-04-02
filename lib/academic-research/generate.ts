import type { AcademicTemplateType, OutlineItem } from './types'

function safeJsonParseArray(raw: string): unknown[] {
  try {
    const v = JSON.parse(raw) as unknown
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export async function openaiChat(system: string, user: string, maxTokens: number): Promise<{ text: string; error?: string }> {
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

export function summarizeScraped(scraped: unknown): string {
  if (!Array.isArray(scraped)) return ''
  const lines = (scraped as { title?: string; excerpt?: string }[])
    .slice(0, 5)
    .map((s, i) => `[${i + 1}] ${s.title || 'Source'}\n${(s.excerpt || '').slice(0, 600)}`)
  return lines.join('\n\n')
}

function answersSummary(answers: Record<string, unknown>): string {
  const skip = new Set(['_meta', 'citation_style', 'word_target_band'])
  return Object.entries(answers)
    .filter(([k]) => !skip.has(k))
    .map(([k, v]) => `${k}: ${String(v).slice(0, 800)}`)
    .join('\n')
}

const OUTLINE_SYSTEM = `You are an academic writing assistant. Output ONLY valid JSON: an array of objects with keys "slug" (kebab-case id), "heading" (human title), "sort_order" (integer starting at 0). 
No markdown fences. Sections must follow conventions for the document type requested. Do not invent citations or dataset results.`

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

Produce 6–14 outline sections appropriate for this type. For research_paper favour IMRaD-style headings where suitable. For dissertation_thesis include typical chapter-level blocks.`

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

function sectionSystem(templateType: AcademicTemplateType, citationStyle: string): string {
  return `You write rigorous academic prose in ${citationStyle || 'APA'}-style tone (narrative citations like (Author, Year) placeholders only — do not fabricate real references). 
Document context: ${templateType}. Use clear headings within the section if needed (###). No boilerplate about being an AI. Full paragraphs, not bullet-only unless the section is inherently list-based.`
}

export async function generateSectionBody(input: {
  templateType: AcademicTemplateType
  citationStyle: string
  answers: Record<string, unknown>
  scrapedSummary: string
  outline: OutlineItem[]
  sectionSlug: string
  sectionHeading: string
}): Promise<{ body: string; error?: string }> {
  const outlineStr = input.outline.map((o) => `- ${o.slug}: ${o.heading}`).join('\n')
  const user = `Full document outline:
${outlineStr}

Write the section titled "${input.sectionHeading}" (slug ${input.sectionSlug}). Cross-reference other sections only briefly where natural.

User inputs:
${answersSummary(input.answers)}

Research excerpts:
${input.scrapedSummary || '(none)'}

Target: substantial section (roughly 400–900 words unless the section is intentionally short e.g. abstract).`

  const { text, error } = await openaiChat(
    sectionSystem(input.templateType, input.citationStyle),
    user,
    3500
  )
  if (error || !text) return { body: '', error }
  return { body: text }
}
