import type { ResearchWebProvider, TemplateGuidanceInput, TemplateGuidanceResult } from './types'
import type { AcademicTemplateType } from '@/lib/academic-research/types'
import { mergeEnrichment, parseCitationMetaFromHtml } from '@/lib/academic-research/source-metadata'

const DEFAULT_API_BASE = 'https://api.firecrawl.dev'

function templateSearchQuery(templateType: AcademicTemplateType, topic: string, hints: string[]): string {
  const h = hints.filter(Boolean).join(' ')
  const base = topic.trim() || 'academic writing'
  const guides: Record<AcademicTemplateType, string> = {
    dissertation_thesis: `PhD thesis dissertation structure chapters methodology ${h} ${base}`,
    literature_review: `systematic literature review structure synthesis APA ${h} ${base}`,
    case_study: `case study research structure Yin Stake organization ${h} ${base}`,
    research_proposal: `research proposal structure aims objectives methodology timeline ${h} ${base}`,
    research_paper: `IMRaD research paper structure journal article methods ${h} ${base}`,
  }
  return guides[templateType] || `${templateType} academic structure ${h} ${base}`.slice(0, 480)
}

function excerptFromMarkdown(md: string, max = 1200): string {
  const t = (md || '').trim().replace(/\s+/g, ' ')
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

export class FirecrawlResearchProvider implements ResearchWebProvider {
  async fetchTemplateGuidance(input: TemplateGuidanceInput): Promise<TemplateGuidanceResult> {
    const key = process.env.FIRECRAWL_API_KEY?.trim()
    if (!key) {
      return {
        sources: [],
        skippedReason: 'FIRECRAWL_API_KEY is not set; skipped web research.',
      }
    }

    const base = (process.env.FIRECRAWL_API_URL || DEFAULT_API_BASE).replace(/\/$/, '')
    const query = templateSearchQuery(
      input.templateType,
      input.topicQuery,
      input.contextHints || []
    )

    try {
      const controller = new AbortController()
      const t = setTimeout(() => controller.abort(), 45_000)
      const res = await fetch(`${base}/v1/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          query,
          limit: Math.min(5, parseInt(process.env.FIRECRAWL_SEARCH_LIMIT || '5', 10) || 5),
          scrapeOptions: { formats: ['markdown', 'html'] },
        }),
      })
      clearTimeout(t)

      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
      if (!res.ok) {
        const msg =
          typeof json.error === 'string'
            ? json.error
            : typeof (json as { message?: string }).message === 'string'
              ? (json as { message: string }).message
              : `Firecrawl HTTP ${res.status}`
        return { sources: [], skippedReason: msg }
      }

      const data = json.data
      const rows: unknown[] = Array.isArray(data) ? data : []
      const sources = rows.map((row) => {
        const r = row as Record<string, unknown>
        const url = String(r.url || r.link || '')
        const title = String(r.title || r.name || url || 'Source')
        const md = String(r.markdown || r.content || r.description || '')
        const html = String(r.html || '')
        const excerpt = excerptFromMarkdown(md || String(r.description || ''))
        const meta = html ? parseCitationMetaFromHtml(html) : {}
        const merged = mergeEnrichment({ title, excerpt }, meta)
        return {
          url: url || 'https://example.invalid',
          title,
          excerpt,
          provider: 'firecrawl' as const,
          ...(merged.author ? { author: merged.author } : {}),
          ...(merged.year ? { year: merged.year } : {}),
          ...(merged.citeVerified ? { citeVerified: true as const } : {}),
        }
      }).filter((s) => s.url && s.url !== 'https://example.invalid')

      return { sources }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Firecrawl request failed'
      return { sources: [], skippedReason: msg }
    }
  }
}

export function getResearchWebProvider(): ResearchWebProvider {
  return new FirecrawlResearchProvider()
}
