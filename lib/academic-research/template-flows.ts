import type { AcademicTemplateType } from './types'

export type FlowFieldType = 'text' | 'textarea' | 'select'

export type FlowField = {
  name: string
  label: string
  type: FlowFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

export type FlowStep = {
  id: string
  title: string
  description?: string
  fields: FlowField[]
}

const CITATION_FIELDS: FlowField[] = [
  {
    name: 'citation_style',
    label: 'Citation style',
    type: 'select',
    required: true,
    options: [
      { value: 'apa', label: 'APA 7' },
      { value: 'mla', label: 'MLA 9' },
      { value: 'chicago', label: 'Chicago 17' },
      { value: 'harvard', label: 'Harvard' },
    ],
  },
  {
    name: 'word_target_band',
    label: 'Length target',
    type: 'select',
    required: true,
    options: [
      { value: '5k', label: '~5,000 words' },
      { value: '8k', label: '~8,000 words' },
      { value: '12k', label: '~12,000 words' },
      { value: '15k', label: '~15,000 words' },
      { value: '80k', label: '~80,000 words (thesis-scale)' },
    ],
  },
]

export const TEMPLATE_UI_META: Record<
  AcademicTemplateType,
  { label: string; description: string }
> = {
  dissertation_thesis: {
    label: 'Dissertation / Thesis',
    description: 'Long-form thesis: questions, methods, ethics, and chapter-style output.',
  },
  literature_review: {
    label: 'Literature review',
    description: 'Thematic synthesis, inclusion criteria, and structured narrative.',
  },
  case_study: {
    label: 'Case study',
    description: 'Bounded case, propositions, and evidence-focused structure.',
  },
  research_proposal: {
    label: 'Research proposal',
    description: 'Aims, hypotheses, methods, timeline, and significance.',
  },
  research_paper: {
    label: 'Research paper',
    description: 'IMRaD-style article: contributions, design, and discussion.',
  },
}

const FLOWS: Record<AcademicTemplateType, FlowStep[]> = {
  dissertation_thesis: [
    {
      id: 'institution',
      title: 'Programme & discipline',
      description: 'Where this work sits academically.',
      fields: [
        {
          name: 'institution',
          label: 'Institution / faculty',
          type: 'text',
          required: true,
          placeholder: 'e.g. Department of Informatics, …',
        },
        {
          name: 'discipline',
          label: 'Discipline / field',
          type: 'text',
          required: true,
          placeholder: 'e.g. Information systems, public policy',
        },
        {
          name: 'degree_level',
          label: 'Degree level',
          type: 'select',
          required: true,
          options: [
            { value: 'mphil', label: 'MPhil' },
            { value: 'phd', label: 'PhD / Doctorate' },
            { value: 'professional', label: 'Professional doctorate' },
          ],
        },
      ],
    },
    {
      id: 'research_focus',
      title: 'Research focus',
      fields: [
        {
          name: 'working_title',
          label: 'Working title',
          type: 'text',
          required: true,
          placeholder: 'Short title for the thesis',
        },
        {
          name: 'research_questions',
          label: 'Research questions',
          type: 'textarea',
          required: true,
          placeholder: 'Main RQ and sub-questions',
        },
        {
          name: 'problem_statement',
          label: 'Problem statement',
          type: 'textarea',
          required: false,
          placeholder: 'Why this research matters',
        },
      ],
    },
    {
      id: 'methods_ethics',
      title: 'Methods & ethics',
      fields: [
        {
          name: 'methodology_summary',
          label: 'Methodology (summary)',
          type: 'textarea',
          required: true,
          placeholder: 'Qualitative / quantitative / mixed; data sources',
        },
        {
          name: 'ethics',
          label: 'Ethics & approvals',
          type: 'textarea',
          required: false,
          placeholder: 'IRB, consent, GDPR, anonymity…',
        },
        {
          name: 'chapter_expectations',
          label: 'Chapter expectations',
          type: 'textarea',
          required: false,
          placeholder: 'Expected chapters or university template notes',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Formatting preferences',
      fields: [...CITATION_FIELDS],
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Save progress, then run web research, outline, and generation from the next screen.',
      fields: [],
    },
  ],

  literature_review: [
    {
      id: 'scope',
      title: 'Scope & topic',
      fields: [
        {
          name: 'review_title',
          label: 'Review title',
          type: 'text',
          required: true,
          placeholder: 'e.g. Digital sovereignty in cloud contracts',
        },
        {
          name: 'research_domain',
          label: 'Domain / field',
          type: 'text',
          required: true,
          placeholder: 'e.g. Law & technology',
        },
        {
          name: 'keywords',
          label: 'Keywords & search strings',
          type: 'textarea',
          required: true,
          placeholder: 'Terms you would use in databases',
        },
      ],
    },
    {
      id: 'themes',
      title: 'Themes & frameworks',
      fields: [
        {
          name: 'themes',
          label: 'Core themes to synthesize',
          type: 'textarea',
          required: true,
          placeholder: 'Theme A, B, C…',
        },
        {
          name: 'theoretical_framework',
          label: 'Theoretical lens (optional)',
          type: 'textarea',
          required: false,
          placeholder: 'Theories or models guiding the review',
        },
      ],
    },
    {
      id: 'criteria',
      title: 'Inclusion criteria',
      fields: [
        {
          name: 'date_range',
          label: 'Date range',
          type: 'text',
          required: false,
          placeholder: 'e.g. 2018–2026',
        },
        {
          name: 'inclusion_exclusion',
          label: 'Inclusion / exclusion rules',
          type: 'textarea',
          required: true,
          placeholder: 'Study types, languages, geography…',
        },
        {
          name: 'synthesis_goal',
          label: 'Synthesis goal',
          type: 'textarea',
          required: true,
          placeholder: 'What decision or insight should this review enable?',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Formatting preferences',
      fields: [...CITATION_FIELDS],
    },
    { id: 'review', title: 'Review', description: 'Ready for research & generation.', fields: [] },
  ],

  case_study: [
    {
      id: 'case_boundary',
      title: 'Case boundary',
      fields: [
        {
          name: 'case_title',
          label: 'Case title',
          type: 'text',
          required: true,
          placeholder: 'Name of organisation or case',
        },
        {
          name: 'unit_of_analysis',
          label: 'Unit of analysis',
          type: 'text',
          required: true,
          placeholder: 'e.g. Single organisation, programme, site',
        },
        {
          name: 'context',
          label: 'Context & setting',
          type: 'textarea',
          required: true,
          placeholder: 'Industry, geography, timeframe',
        },
      ],
    },
    {
      id: 'propositions',
      title: 'Questions & propositions',
      fields: [
        {
          name: 'research_questions',
          label: 'Research questions',
          type: 'textarea',
          required: true,
          placeholder: 'What the case should illuminate',
        },
        {
          name: 'propositions',
          label: 'Propositions (if any)',
          type: 'textarea',
          required: false,
          placeholder: 'Optional: expected relationships',
        },
      ],
    },
    {
      id: 'evidence',
      title: 'Data & evidence',
      fields: [
        {
          name: 'data_sources',
          label: 'Data sources',
          type: 'textarea',
          required: true,
          placeholder: 'Interviews, documents, archives, observations…',
        },
        {
          name: 'ethics',
          label: 'Ethics & access',
          type: 'textarea',
          required: false,
          placeholder: 'Consent, anonymity, permissions',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Formatting preferences',
      fields: [...CITATION_FIELDS],
    },
    { id: 'review', title: 'Review', fields: [] },
  ],

  research_proposal: [
    {
      id: 'aims',
      title: 'Aims & significance',
      fields: [
        {
          name: 'proposal_title',
          label: 'Proposal title',
          type: 'text',
          required: true,
          placeholder: 'Working title',
        },
        {
          name: 'background',
          label: 'Background',
          type: 'textarea',
          required: true,
          placeholder: 'Context and motivation',
        },
        {
          name: 'aims_objectives',
          label: 'Aims & objectives',
          type: 'textarea',
          required: true,
          placeholder: 'What you intend to achieve',
        },
        {
          name: 'significance',
          label: 'Significance',
          type: 'textarea',
          required: false,
          placeholder: 'Contribution to knowledge or practice',
        },
      ],
    },
    {
      id: 'hypotheses',
      title: 'Hypotheses / questions',
      fields: [
        {
          name: 'hypotheses',
          label: 'Hypotheses or RQs',
          type: 'textarea',
          required: true,
          placeholder: 'Testable statements or questions',
        },
      ],
    },
    {
      id: 'methods_plan',
      title: 'Methods & plan',
      fields: [
        {
          name: 'methodology',
          label: 'Methodology',
          type: 'textarea',
          required: true,
          placeholder: 'Design, data, analysis',
        },
        {
          name: 'timeline',
          label: 'Timeline',
          type: 'textarea',
          required: false,
          placeholder: 'Milestones (e.g. months 1–12)',
        },
        {
          name: 'risks',
          label: 'Risks & mitigation',
          type: 'textarea',
          required: false,
          placeholder: 'Optional',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Formatting preferences',
      fields: [...CITATION_FIELDS],
    },
    { id: 'review', title: 'Review', fields: [] },
  ],

  research_paper: [
    {
      id: 'paper_overview',
      title: 'Paper overview',
      fields: [
        {
          name: 'paper_title',
          label: 'Paper title',
          type: 'text',
          required: true,
          placeholder: 'Working title',
        },
        {
          name: 'venue_type',
          label: 'Target venue type',
          type: 'select',
          required: true,
          options: [
            { value: 'journal_empirical', label: 'Journal (empirical)' },
            { value: 'journal_review', label: 'Journal (review)' },
            { value: 'conference', label: 'Conference' },
            { value: 'preprint', label: 'Preprint / working paper' },
          ],
        },
        {
          name: 'contributions',
          label: 'Claimed contributions',
          type: 'textarea',
          required: true,
          placeholder: 'What is novel?',
        },
      ],
    },
    {
      id: 'study_design',
      title: 'Study design',
      fields: [
        {
          name: 'study_design',
          label: 'Study design',
          type: 'textarea',
          required: true,
          placeholder: 'e.g. Survey, experiment, case study, simulation',
        },
        {
          name: 'data',
          label: 'Data / materials',
          type: 'textarea',
          required: false,
          placeholder: 'Dataset, population, instruments',
        },
      ],
    },
    {
      id: 'imrad_notes',
      title: 'IMRaD emphasis',
      fields: [
        {
          name: 'imrad_notes',
          label: 'Section emphasis or constraints',
          type: 'textarea',
          required: false,
          placeholder: 'e.g. Strong methods section; short related work',
        },
      ],
    },
    {
      id: 'preferences',
      title: 'Formatting preferences',
      fields: [...CITATION_FIELDS],
    },
    { id: 'review', title: 'Review', fields: [] },
  ],
}

export function getFlowSteps(templateType: AcademicTemplateType): FlowStep[] {
  return FLOWS[templateType] || []
}

export function listTemplatesForApi(): Array<{
  id: AcademicTemplateType
  label: string
  description: string
  stepCount: number
}> {
  return (Object.keys(TEMPLATE_UI_META) as AcademicTemplateType[]).map((id) => ({
    id,
    ...TEMPLATE_UI_META[id],
    stepCount: getFlowSteps(id).length,
  }))
}

/** Pull topic string for Firecrawl from answers (template-specific). */
export function topicQueryFromAnswers(
  templateType: AcademicTemplateType,
  answers: Record<string, unknown>
): string {
  const keys: Record<AcademicTemplateType, string[]> = {
    dissertation_thesis: ['working_title', 'research_questions'],
    literature_review: ['review_title', 'keywords'],
    case_study: ['case_title', 'research_questions'],
    research_proposal: ['proposal_title', 'aims_objectives'],
    research_paper: ['paper_title', 'contributions'],
  }
  const parts = (keys[templateType] || [])
    .map((k) => String(answers[k] || '').trim())
    .filter(Boolean)
  return parts.join(' — ') || String(answers.working_title || answers.review_title || 'research')
}

export function contextHintsFromAnswers(
  templateType: AcademicTemplateType,
  answers: Record<string, unknown>
): string[] {
  if (templateType === 'dissertation_thesis') {
    return [String(answers.discipline || ''), String(answers.institution || '')]
  }
  if (templateType === 'literature_review') {
    return [String(answers.research_domain || '')]
  }
  if (templateType === 'case_study') {
    return [String(answers.unit_of_analysis || ''), String(answers.context || '').slice(0, 200)]
  }
  if (templateType === 'research_proposal') {
    return [String(answers.background || '').slice(0, 200)]
  }
  return [String(answers.venue_type || ''), String(answers.study_design || '').slice(0, 200)]
}
