import type { AcademicTemplateType } from '@/lib/academic-research/types'

export type WebResearchSource = {
  url: string
  title: string
  excerpt: string
  provider: 'firecrawl' | 'openalex'
  /** Present when extracted with confidence (e.g. meta tags, OpenAlex) */
  author?: string
  year?: string
  /** Parenthetical (Author, Year) allowed in body only when true */
  citeVerified?: boolean
}

export type TemplateGuidanceInput = {
  templateType: AcademicTemplateType
  /** User topic / title line for search query building */
  topicQuery: string
  /** Extra phrases from answers (e.g. discipline) */
  contextHints?: string[]
}

export type TemplateGuidanceResult = {
  sources: WebResearchSource[]
  skippedReason?: string
}

export interface ResearchWebProvider {
  fetchTemplateGuidance(input: TemplateGuidanceInput): Promise<TemplateGuidanceResult>
}
