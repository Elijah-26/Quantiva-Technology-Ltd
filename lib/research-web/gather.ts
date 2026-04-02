import { getResearchWebProvider } from './firecrawl'
import type { TemplateGuidanceInput, TemplateGuidanceResult, WebResearchSource } from './types'
import { gatherScholarlyResearch, logResearchEvent } from '@/lib/research/researchOrchestrator'
import {
  academicTemplateToDocumentType,
  scholarlyFloorForFirecrawl,
  shouldAlwaysTryFirecrawlCaseStudy,
} from '@/lib/research/documentTypeMap'
import { mapSessionCitationStyle } from '@/lib/research/citationFormatter'
import { papersToWebResearchSources } from '@/lib/research/toSessionSources'

function normalizeUrlKey(url: string): string {
  return url.split('?')[0].replace(/\/$/, '').toLowerCase()
}

function normalizeDoiKey(d?: string): string | undefined {
  if (!d) return undefined
  const x = d.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
  return x || undefined
}

function doiFromUrl(url: string): string | undefined {
  const m = url.toLowerCase().match(/doi\.org\/(10\.\d+\/[^\s?#]+)/)
  return m ? m[1] : undefined
}

/** Scholarly rows first; then Firecrawl. Dedupe by DOI when present, else normalized URL. */
export function mergeDedupeWebSources(
  scholarly: WebResearchSource[],
  supplemental: WebResearchSource[]
): WebResearchSource[] {
  const urlSeen = new Set<string>()
  const doiSeen = new Set<string>()
  const out: WebResearchSource[] = []

  const add = (s: WebResearchSource) => {
    const doi = normalizeDoiKey(s.doi) || doiFromUrl(s.url)
    if (doi) {
      if (doiSeen.has(doi)) return
      doiSeen.add(doi)
    }
    const uk = normalizeUrlKey(s.url)
    if (uk && uk.length >= 8) {
      if (urlSeen.has(uk)) return
      urlSeen.add(uk)
    }
    out.push(s)
  }

  for (const s of scholarly) add(s)
  for (const s of supplemental) add(s)
  return out
}

function firecrawlConfigured(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim())
}

/**
 * OpenAlex + Semantic Scholar first (structured papers), then Firecrawl when the scholarly
 * count is below a template floor or case-study rules call for grey literature.
 */
export async function gatherResearchSources(input: TemplateGuidanceInput): Promise<TemplateGuidanceResult> {
  const topic = (input.topicQuery || '').trim() || 'academic research'
  const docType = academicTemplateToDocumentType(input.templateType)
  const cite = mapSessionCitationStyle(input.researchContext?.citationStyle)

  const ctx = input.researchContext
  const scholarly = await gatherScholarlyResearch(
    topic,
    docType,
    { citationStyle: cite, yearFrom: ctx?.yearFrom },
    ctx?.supabase && ctx.userId ? { supabase: ctx.supabase, userId: ctx.userId } : undefined
  )

  let scholarlySources = papersToWebResearchSources(scholarly.papers)
  const floor = scholarlyFloorForFirecrawl(docType)
  const needFirecrawl =
    scholarlySources.length < floor ||
    shouldAlwaysTryFirecrawlCaseStudy(docType, scholarlySources.length, firecrawlConfigured())

  let skippedReason: string | undefined
  let firecrawlSources: WebResearchSource[] = []

  if (needFirecrawl) {
    const provider = getResearchWebProvider()
    const fc = await provider.fetchTemplateGuidance({
      templateType: input.templateType,
      topicQuery: input.topicQuery,
      contextHints: input.contextHints,
    })
    firecrawlSources = fc.sources
    skippedReason = fc.skippedReason
    if (ctx?.supabase && ctx.userId) {
      await logResearchEvent(
        ctx.supabase,
        ctx.userId,
        topic,
        'firecrawl',
        firecrawlSources.length,
        fc.skippedReason
      )
    }
  }

  const merged = mergeDedupeWebSources(scholarlySources, firecrawlSources)
  return { sources: merged, skippedReason }
}
