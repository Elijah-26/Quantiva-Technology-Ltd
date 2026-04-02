export const ACADEMIC_TEMPLATE_TYPES = [
  'dissertation_thesis',
  'literature_review',
  'case_study',
  'research_proposal',
  'research_paper',
] as const

export type AcademicTemplateType = (typeof ACADEMIC_TEMPLATE_TYPES)[number]

export function isAcademicTemplateType(s: string): s is AcademicTemplateType {
  return (ACADEMIC_TEMPLATE_TYPES as readonly string[]).includes(s)
}

export type SessionStatus = 'draft' | 'researching' | 'generating' | 'completed' | 'failed'

export type OutlineItem = { slug: string; heading: string; sort_order: number }

export type WizardMeta = { step: number }

export function getWizardStep(answers: Record<string, unknown>): number {
  const meta = answers._meta as WizardMeta | undefined
  return typeof meta?.step === 'number' && meta.step >= 0 ? meta.step : 0
}

export function setWizardStep(answers: Record<string, unknown>, step: number): Record<string, unknown> {
  return { ...answers, _meta: { step } }
}
