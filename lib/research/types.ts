export interface Author {
  name: string
  orcid?: string
}

export interface Paper {
  id: string
  doi?: string
  title: string
  authors: Author[]
  year: number
  journal?: string
  abstract: string
  citationCount: number
  openAccessUrl?: string
  tldr?: string
  source: 'openalex' | 'semantic_scholar'
  concepts?: string[]
}

export interface Citation {
  inText: string
  fullReference: string
  doi?: string
}

export type DocumentType =
  | 'dissertation'
  | 'literature_review'
  | 'case_study'
  | 'research_proposal'
  | 'research_paper'

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'IEEE'

export interface ResearchResult {
  papers: Paper[]
  citations: Map<string, Citation>
}

export interface GatherResearchOptions {
  minSources?: number
  yearFrom?: number
  citationStyle: CitationStyle
}
