import type { AcademicTemplateType } from '@/lib/academic-research/types'

export type WebResearchSource = {
  url: string
  title: string
  excerpt: string
  provider: 'firecrawl'
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
