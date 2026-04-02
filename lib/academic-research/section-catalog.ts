import type { AcademicTemplateType } from './types'
import type { OutlineItem } from './types'

/** Persisted on session.answers._documentPlan */
export type DocumentPlan = {
  /** Catalog entry ids the user wants included */
  selectedIds: string[]
  /** User-added headings (slug generated server-side) */
  customSections: { heading: string }[]
}

export const DOCUMENT_PLAN_KEY = '_documentPlan'

export type CatalogEntry = { id: string; defaultHeading: string }

function slugifyHeading(h: string, index: number): string {
  const base = h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return base || `section-${index}`
}

/** Typical sections per template; all selected by default in UI until user changes. */
export const SECTION_CATALOG: Record<AcademicTemplateType, CatalogEntry[]> = {
  dissertation_thesis: [
    { id: 'abstract', defaultHeading: 'Abstract' },
    { id: 'acknowledgements', defaultHeading: 'Acknowledgements' },
    { id: 'introduction', defaultHeading: 'Introduction' },
    { id: 'literature-review', defaultHeading: 'Literature review' },
    { id: 'methodology', defaultHeading: 'Methodology' },
    { id: 'results', defaultHeading: 'Results' },
    { id: 'discussion', defaultHeading: 'Discussion' },
    { id: 'conclusion', defaultHeading: 'Conclusion' },
    { id: 'recommendations', defaultHeading: 'Recommendations' },
  ],
  literature_review: [
    { id: 'introduction', defaultHeading: 'Introduction' },
    { id: 'search-strategy', defaultHeading: 'Search strategy' },
    { id: 'thematic-synthesis', defaultHeading: 'Thematic synthesis' },
    { id: 'critical-appraisal', defaultHeading: 'Critical appraisal' },
    { id: 'gaps', defaultHeading: 'Research gaps' },
    { id: 'conclusion', defaultHeading: 'Conclusion' },
  ],
  case_study: [
    { id: 'introduction', defaultHeading: 'Introduction' },
    { id: 'case-context', defaultHeading: 'Case context' },
    { id: 'theoretical-lens', defaultHeading: 'Theoretical lens' },
    { id: 'data-collection', defaultHeading: 'Data and sources' },
    { id: 'within-case-analysis', defaultHeading: 'Within-case analysis' },
    { id: 'cross-case', defaultHeading: 'Cross-case insights' },
    { id: 'discussion', defaultHeading: 'Discussion' },
    { id: 'conclusion', defaultHeading: 'Conclusion' },
  ],
  research_proposal: [
    { id: 'introduction', defaultHeading: 'Introduction' },
    { id: 'background', defaultHeading: 'Background and significance' },
    { id: 'aims', defaultHeading: 'Aims and objectives' },
    { id: 'literature', defaultHeading: 'Literature review' },
    { id: 'methods', defaultHeading: 'Methodology' },
    { id: 'ethics', defaultHeading: 'Ethics and feasibility' },
    { id: 'timeline', defaultHeading: 'Timeline' },
    { id: 'references-note', defaultHeading: 'Expected contributions' },
  ],
  research_paper: [
    { id: 'abstract', defaultHeading: 'Abstract' },
    { id: 'introduction', defaultHeading: 'Introduction' },
    { id: 'related-work', defaultHeading: 'Related work' },
    { id: 'methods', defaultHeading: 'Methods' },
    { id: 'results', defaultHeading: 'Results' },
    { id: 'discussion', defaultHeading: 'Discussion' },
    { id: 'conclusion', defaultHeading: 'Conclusion' },
  ],
}

export function defaultDocumentPlan(templateType: AcademicTemplateType): DocumentPlan {
  const cat = SECTION_CATALOG[templateType]
  return {
    selectedIds: cat.map((c) => c.id),
    customSections: [],
  }
}

function parseDocumentPlan(raw: unknown): DocumentPlan | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const selectedIds = Array.isArray(o.selectedIds)
    ? o.selectedIds.filter((x): x is string => typeof x === 'string')
    : []
  const customSections = Array.isArray(o.customSections)
    ? o.customSections
        .filter((x): x is { heading: string } => x != null && typeof x === 'object' && typeof (x as { heading?: string }).heading === 'string')
        .map((x) => ({ heading: String((x as { heading: string }).heading).trim() }))
        .filter((x) => x.heading.length > 0)
    : []
  if (selectedIds.length === 0 && customSections.length === 0) return null
  return { selectedIds, customSections }
}

/** Read plan from session answers; returns null if user has not saved a plan yet. */
export function getDocumentPlanFromAnswers(answers: Record<string, unknown>): DocumentPlan | null {
  return parseDocumentPlan(answers[DOCUMENT_PLAN_KEY])
}

/**
 * Build outline from saved document plan. Returns null if plan is missing or empty → caller should fall back to LLM.
 */
export function outlineFromDocumentPlan(
  templateType: AcademicTemplateType,
  plan: DocumentPlan | null
): OutlineItem[] | null {
  if (!plan) return null
  const catalog = SECTION_CATALOG[templateType]
  const byId = new Map(catalog.map((c) => [c.id, c]))
  const items: OutlineItem[] = []
  let order = 0

  for (const id of plan.selectedIds) {
    const c = byId.get(id)
    if (!c) continue
    items.push({
      slug: slugifyHeading(c.defaultHeading, order),
      heading: c.defaultHeading,
      sort_order: order++,
    })
  }

  for (const cs of plan.customSections) {
    const h = cs.heading.trim()
    if (!h) continue
    items.push({
      slug: slugifyHeading(h, order),
      heading: h,
      sort_order: order++,
    })
  }

  if (items.length === 0) return null

  const used = new Set<string>()
  for (const it of items) {
    let slug = it.slug
    let n = 0
    while (used.has(slug)) {
      n++
      slug = `${it.slug}-${n}`
    }
    used.add(slug)
    it.slug = slug
  }

  return items
}

/**
 * Returns outline from saved document plan, or null if no plan / empty plan (use LLM outline).
 */
export function resolveOutlineForSession(
  templateType: AcademicTemplateType,
  answers: Record<string, unknown>
): OutlineItem[] | null {
  const plan = getDocumentPlanFromAnswers(answers)
  if (!plan) return null
  return outlineFromDocumentPlan(templateType, plan)
}
