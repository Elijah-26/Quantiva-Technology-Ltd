import type { AcademicTemplateType } from '@/lib/academic-research/types'
import type { DocumentType } from './types'

export function academicTemplateToDocumentType(t: AcademicTemplateType): DocumentType {
  const m: Record<AcademicTemplateType, DocumentType> = {
    dissertation_thesis: 'dissertation',
    literature_review: 'literature_review',
    case_study: 'case_study',
    research_proposal: 'research_proposal',
    research_paper: 'research_paper',
  }
  return m[t]
}

const CAP_BY_TYPE: Record<DocumentType, number> = {
  dissertation: 30,
  literature_review: 25,
  research_paper: 15,
  research_proposal: 10,
  case_study: 8,
}

export function capForDocumentType(d: DocumentType): number {
  return CAP_BY_TYPE[d]
}

/** Scholarly count below this may trigger Firecrawl supplement. */
export function scholarlyFloorForFirecrawl(d: DocumentType): number {
  if (d === 'dissertation') return 10
  if (d === 'literature_review') return 8
  if (d === 'case_study') return 6
  if (d === 'research_proposal') return 4
  return 5
}

export function shouldAlwaysTryFirecrawlCaseStudy(
  d: DocumentType,
  scholarlyCount: number,
  firecrawlConfigured: boolean
): boolean {
  return d === 'case_study' && firecrawlConfigured && scholarlyCount < 10
}
