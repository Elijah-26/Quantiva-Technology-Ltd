import { getResearchWebProvider } from './firecrawl'
import { fetchOpenAlexSources } from './openalex'
import type { TemplateGuidanceInput, TemplateGuidanceResult } from './types'

function dedupeSources<T extends { url: string }>(rows: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const s of rows) {
    const u = s.url.split('?')[0].replace(/\/$/, '').toLowerCase()
    if (!u || u.length < 8) continue
    if (seen.has(u)) continue
    seen.add(u)
    out.push(s)
  }
  return out
}

/** Firecrawl (when configured) plus optional OpenAlex enrichment. */
export async function gatherResearchSources(input: TemplateGuidanceInput): Promise<TemplateGuidanceResult> {
  const provider = getResearchWebProvider()
  const result = await provider.fetchTemplateGuidance(input)
  const openAlex = await fetchOpenAlexSources(input.templateType, input.topicQuery, 3)
  const merged = dedupeSources([...openAlex, ...result.sources])
  return {
    sources: merged,
    skippedReason: result.skippedReason,
  }
}
