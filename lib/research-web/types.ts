import type { SupabaseClient } from '@supabase/supabase-js'
import type { AcademicTemplateType } from '@/lib/academic-research/types'

/** Optional: enables 24h Supabase cache + research_logs for scholarly + supplement steps. */
export type ResearchGatherContext = {
  supabase: SupabaseClient
  userId: string
  citationStyle?: string
  yearFrom?: number
}

export type WebResearchSource = {
  url: string
  title: string
  excerpt: string
  provider: 'firecrawl' | 'openalex' | 'semantic_scholar'
  /** Present when extracted with confidence (e.g. meta tags, OpenAlex) */
  author?: string
  year?: string
  /** Parenthetical (Author, Year) allowed in body only when true */
  citeVerified?: boolean
  doi?: string
  paperId?: string
  tldr?: string
  journal?: string
  citationCount?: number
}

export type TemplateGuidanceInput = {
  templateType: AcademicTemplateType
  /** User topic / title line for search query building */
  topicQuery: string
  /** Extra phrases from answers (e.g. discipline) */
  contextHints?: string[]
  researchContext?: ResearchGatherContext
}

export type TemplateGuidanceResult = {
  sources: WebResearchSource[]
  skippedReason?: string
}

export interface ResearchWebProvider {
  fetchTemplateGuidance(input: TemplateGuidanceInput): Promise<TemplateGuidanceResult>
}
