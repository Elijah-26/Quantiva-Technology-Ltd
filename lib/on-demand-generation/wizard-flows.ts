/** On-Demand Document wizard: 12 document types, per-type steps, Firecrawl research mode. */

export const INDUSTRY_OPTIONS = [
  { value: 'saas', label: 'SaaS / Technology' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance / Fintech' },
  { value: 'education', label: 'Education' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'retail', label: 'Retail' },
  { value: 'legal', label: 'Legal services' },
  { value: 'other', label: 'Other' },
] as const

export const JURISDICTION_OPTIONS = [
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'eu', label: 'European Union' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'global', label: 'Global / Multi-jurisdiction' },
] as const

export const SENIORITY_OPTIONS = [
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead / Principal' },
  { value: 'exec', label: 'Executive' },
] as const

export const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal' },
  { value: 'professional', label: 'Professional' },
  { value: 'concise', label: 'Concise' },
  { value: 'friendly', label: 'Friendly professional' },
] as const

export const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (1–2 pages equivalent)' },
  { value: 'medium', label: 'Medium (3–5 pages equivalent)' },
  { value: 'long', label: 'Long (detailed)' },
] as const

export type FieldType = 'text' | 'textarea' | 'select' | 'url'

export type WizardField = {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: readonly { value: string; label: string }[]
}

export type WizardStep = {
  id: string
  title: string
  description?: string
  fields: WizardField[]
}

export type ResearchMode = 'none' | 'firecrawl'

export type FlowCategory = 'legal_compliance' | 'hr' | 'career' | 'family_law' | 'internal' | 'custom'

export type DocumentFlow = {
  researchMode: ResearchMode
  category: FlowCategory
  steps: WizardStep[]
}

export const ON_DEMAND_DOC_IDS = [
  'privacy',
  'dpa',
  'terms',
  'contract',
  'compliance',
  'hr',
  'resume',
  'law_divorce',
  'nda',
  'cover_letter',
  'memorandum',
  'custom',
] as const

export type OnDemandDocId = (typeof ON_DEMAND_DOC_IDS)[number]

export function isOnDemandDocId(s: string): s is OnDemandDocId {
  return (ON_DEMAND_DOC_IDS as readonly string[]).includes(s)
}

/** Lucide icon name for UI mapping */
export type DocumentCardMeta = {
  id: OnDemandDocId
  name: string
  description: string
  icon: string
  glow?: boolean
}

export const DOCUMENT_CARDS: DocumentCardMeta[] = [
  {
    id: 'privacy',
    name: 'Privacy Policy',
    description: 'GDPR, CCPA-oriented privacy policies (draft)',
    icon: 'Lock',
  },
  {
    id: 'dpa',
    name: 'Data Processing Agreement (DPA)',
    description: 'Processor / controller data processing terms',
    icon: 'FileStack',
  },
  {
    id: 'terms',
    name: 'Terms of Service',
    description: 'Terms and conditions for your business',
    icon: 'ScrollText',
  },
  {
    id: 'contract',
    name: 'Contract',
    description: 'Employment, service, and partnership contracts',
    icon: 'Handshake',
  },
  {
    id: 'compliance',
    name: 'Compliance Doc',
    description: 'Regulatory compliance documentation',
    icon: 'BadgeCheck',
  },
  {
    id: 'hr',
    name: 'HR Document',
    description: 'Employee handbooks and HR policies',
    icon: 'Users',
  },
  {
    id: 'resume',
    name: 'Resume / CV',
    description: 'Professional resume tailored to your experience',
    icon: 'IdCard',
  },
  {
    id: 'law_divorce',
    name: 'Family law — divorce (informational)',
    description: 'Checklist-style scaffold only — not legal advice',
    icon: 'Scale',
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Mutual or one-way confidentiality draft',
    icon: 'Shield',
  },
  {
    id: 'cover_letter',
    name: 'Cover letter',
    description: 'Tailored letter for a specific role',
    icon: 'Mail',
  },
  {
    id: 'memorandum',
    name: 'Internal memorandum',
    description: 'Memo for teams or leadership',
    icon: 'FileText',
  },
  {
    id: 'custom',
    name: 'Custom Document',
    description: 'Describe any document; AI drafts from your brief',
    icon: 'Zap',
    glow: true,
  },
]

function legalContextStep(): WizardStep {
  return {
    id: 'context',
    title: 'Industry and jurisdiction',
    description: 'Helps tailor clauses and regulatory references.',
    fields: [
      {
        id: 'industry',
        label: 'Industry',
        type: 'select',
        required: true,
        options: INDUSTRY_OPTIONS,
      },
      {
        id: 'jurisdiction',
        label: 'Primary jurisdiction',
        type: 'select',
        required: true,
        options: JURISDICTION_OPTIONS,
      },
    ],
  }
}

function orgDetailsStep(): WizardStep {
  return {
    id: 'organization',
    title: 'Organization details',
    fields: [
      {
        id: 'company_name',
        label: 'Legal or brand name',
        type: 'text',
        required: true,
        placeholder: 'Acme Ltd',
      },
      {
        id: 'website',
        label: 'Website (optional)',
        type: 'url',
        placeholder: 'https://example.com',
      },
      {
        id: 'business_summary',
        label: 'What does the organization do?',
        type: 'textarea',
        required: true,
        placeholder: 'Products, services, users, and data you collect…',
      },
    ],
  }
}

function finishStep(legalNote?: string): WizardStep {
  return {
    id: 'finish',
    title: 'Requirements and review',
    description: legalNote,
    fields: [
      {
        id: 'additional_requirements',
        label: 'Specific clauses, tone, or constraints (optional)',
        type: 'textarea',
        placeholder: 'e.g., Mention subprocessors, include cookie section…',
      },
    ],
  }
}

export const DOCUMENT_FLOWS: Record<OnDemandDocId, DocumentFlow> = {
  privacy: {
    researchMode: 'firecrawl',
    category: 'legal_compliance',
    steps: [legalContextStep(), orgDetailsStep(), finishStep()],
  },
  dpa: {
    researchMode: 'firecrawl',
    category: 'legal_compliance',
    steps: [legalContextStep(), orgDetailsStep(), finishStep()],
  },
  terms: {
    researchMode: 'firecrawl',
    category: 'legal_compliance',
    steps: [legalContextStep(), orgDetailsStep(), finishStep()],
  },
  contract: {
    researchMode: 'firecrawl',
    category: 'legal_compliance',
    steps: [
      legalContextStep(),
      {
        id: 'parties',
        title: 'Contract parties and purpose',
        fields: [
          {
            id: 'party_a',
            label: 'Party A (e.g. your company)',
            type: 'text',
            required: true,
          },
          {
            id: 'party_b',
            label: 'Party B',
            type: 'text',
            required: true,
          },
          {
            id: 'contract_purpose',
            label: 'Purpose of the agreement',
            type: 'textarea',
            required: true,
            placeholder: 'Services provided, sale, employment, partnership…',
          },
          {
            id: 'website',
            label: 'Relevant URL (optional)',
            type: 'url',
            placeholder: 'https://',
          },
        ],
      },
      finishStep(),
    ],
  },
  compliance: {
    researchMode: 'firecrawl',
    category: 'legal_compliance',
    steps: [legalContextStep(), orgDetailsStep(), finishStep()],
  },
  hr: {
    researchMode: 'firecrawl',
    category: 'hr',
    steps: [
      legalContextStep(),
      {
        id: 'hr_scope',
        title: 'HR scope',
        fields: [
          {
            id: 'company_name',
            label: 'Employer name',
            type: 'text',
            required: true,
          },
          {
            id: 'website',
            label: 'Careers or company site (optional)',
            type: 'url',
          },
          {
            id: 'hr_topic',
            label: 'Document focus',
            type: 'textarea',
            required: true,
            placeholder: 'Handbook chapter, remote work policy, leave rules…',
          },
        ],
      },
      finishStep(),
    ],
  },
  resume: {
    researchMode: 'none',
    category: 'career',
    steps: [
      {
        id: 'role',
        title: 'Target role',
        fields: [
          {
            id: 'target_role',
            label: 'Target job title',
            type: 'text',
            required: true,
          },
          {
            id: 'years_experience',
            label: 'Years of relevant experience',
            type: 'text',
            required: true,
            placeholder: 'e.g. 5',
          },
          {
            id: 'seniority',
            label: 'Level',
            type: 'select',
            required: true,
            options: SENIORITY_OPTIONS,
          },
          {
            id: 'industry',
            label: 'Industry focus',
            type: 'select',
            required: true,
            options: INDUSTRY_OPTIONS,
          },
        ],
      },
      {
        id: 'contact',
        title: 'Contact details',
        fields: [
          {
            id: 'full_name',
            label: 'Full name',
            type: 'text',
            required: true,
          },
          {
            id: 'email',
            label: 'Email',
            type: 'text',
            required: true,
          },
          {
            id: 'phone',
            label: 'Phone (optional)',
            type: 'text',
          },
          {
            id: 'location',
            label: 'City / region (optional)',
            type: 'text',
          },
        ],
      },
      {
        id: 'experience',
        title: 'Professional profile',
        fields: [
          {
            id: 'professional_summary',
            label: 'Professional summary',
            type: 'textarea',
            required: true,
            placeholder: '2–4 sentences on your strengths and direction',
          },
          {
            id: 'key_skills',
            label: 'Key skills and tools',
            type: 'textarea',
            required: true,
            placeholder: 'Comma or bullet list',
          },
          {
            id: 'work_history',
            label: 'Recent roles (titles, employers, years)',
            type: 'textarea',
            required: true,
          },
        ],
      },
      {
        id: 'education_finish',
        title: 'Education and extras',
        fields: [
          {
            id: 'education',
            label: 'Education',
            type: 'textarea',
            required: true,
            placeholder: 'Degrees, institutions, years',
          },
          {
            id: 'certifications',
            label: 'Certifications (optional)',
            type: 'textarea',
          },
          {
            id: 'additional_requirements',
            label: 'Anything else to emphasize (optional)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  law_divorce: {
    researchMode: 'firecrawl',
    category: 'family_law',
    steps: [
      {
        id: 'disclaimer_context',
        title: 'Important — not legal advice',
        description:
          'This tool produces an informational outline only. You must consult a qualified family lawyer before taking any action.',
        fields: [
          {
            id: 'jurisdiction',
            label: 'Jurisdiction (where divorce may be filed)',
            type: 'select',
            required: true,
            options: JURISDICTION_OPTIONS,
          },
          {
            id: 'marriage_duration',
            label: 'Length of marriage / partnership (approx.)',
            type: 'text',
            required: true,
            placeholder: 'e.g. 8 years',
          },
          {
            id: 'children_involved',
            label: 'Children involved?',
            type: 'select',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
        ],
      },
      {
        id: 'parties',
        title: 'Situation (high level)',
        fields: [
          {
            id: 'party_names_anonymous',
            label: 'Describe parties without full names if you prefer (e.g. Petitioner / Respondent)',
            type: 'textarea',
            required: true,
          },
          {
            id: 'separation_status',
            label: 'Current status',
            type: 'select',
            required: true,
            options: [
              { value: 'considering', label: 'Considering separation' },
              { value: 'separated', label: 'Separated' },
              { value: 'filed', label: 'Proceedings started' },
            ],
          },
        ],
      },
      {
        id: 'topics',
        title: 'Topics to cover in the outline',
        fields: [
          {
            id: 'assets_topics',
            label: 'Assets, debts, housing, support (brief)',
            type: 'textarea',
            required: true,
          },
          {
            id: 'priorities',
            label: 'Your priorities and concerns',
            type: 'textarea',
            required: true,
          },
          {
            id: 'additional_requirements',
            label: 'Questions for a lawyer (optional)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  nda: {
    researchMode: 'none',
    category: 'legal_compliance',
    steps: [
      legalContextStep(),
      {
        id: 'nda_parties',
        title: 'Parties and confidential information',
        fields: [
          {
            id: 'disclosing_party',
            label: 'Disclosing party',
            type: 'text',
            required: true,
          },
          {
            id: 'receiving_party',
            label: 'Receiving party',
            type: 'text',
            required: true,
          },
          {
            id: 'confidential_scope',
            label: 'What information is confidential?',
            type: 'textarea',
            required: true,
          },
          {
            id: 'website',
            label: 'Company URL (optional)',
            type: 'url',
          },
        ],
      },
      {
        id: 'nda_terms',
        title: 'Term and extras',
        fields: [
          {
            id: 'term_length',
            label: 'Desired term (e.g. 2 years, perpetual)',
            type: 'text',
            required: true,
          },
          {
            id: 'mutual_nda',
            label: 'Mutual NDA?',
            type: 'select',
            required: true,
            options: [
              { value: 'one_way', label: 'One-way' },
              { value: 'mutual', label: 'Mutual' },
            ],
          },
          {
            id: 'additional_requirements',
            label: 'Additional requirements (optional)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  cover_letter: {
    researchMode: 'none',
    category: 'career',
    steps: [
      {
        id: 'target',
        title: 'Role and employer',
        fields: [
          {
            id: 'target_role',
            label: 'Job title you are applying for',
            type: 'text',
            required: true,
          },
          {
            id: 'company_applying',
            label: 'Company or organization',
            type: 'text',
            required: true,
          },
          {
            id: 'industry',
            label: 'Industry',
            type: 'select',
            required: true,
            options: INDUSTRY_OPTIONS,
          },
        ],
      },
      {
        id: 'applicant',
        title: 'About you',
        fields: [
          {
            id: 'applicant_name',
            label: 'Your name',
            type: 'text',
            required: true,
          },
          {
            id: 'email',
            label: 'Email',
            type: 'text',
            required: true,
          },
          {
            id: 'years_experience',
            label: 'Years of relevant experience',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        id: 'narrative',
        title: 'Letter content',
        fields: [
          {
            id: 'why_role',
            label: 'Why this role and organization?',
            type: 'textarea',
            required: true,
          },
          {
            id: 'key_achievements',
            label: '2–3 achievements or strengths to highlight',
            type: 'textarea',
            required: true,
          },
          {
            id: 'additional_requirements',
            label: 'Tone or points to avoid (optional)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  memorandum: {
    researchMode: 'none',
    category: 'internal',
    steps: [
      {
        id: 'routing',
        title: 'Memo routing',
        fields: [
          {
            id: 'memo_to',
            label: 'To (audience)',
            type: 'text',
            required: true,
            placeholder: 'e.g. All engineering leads',
          },
          {
            id: 'memo_from',
            label: 'From (department or name)',
            type: 'text',
            required: true,
          },
          {
            id: 'memo_subject',
            label: 'Subject line',
            type: 'text',
            required: true,
          },
          {
            id: 'industry',
            label: 'Organization type (context)',
            type: 'select',
            required: true,
            options: INDUSTRY_OPTIONS,
          },
        ],
      },
      {
        id: 'body',
        title: 'Content',
        fields: [
          {
            id: 'memo_background',
            label: 'Background / context',
            type: 'textarea',
            required: true,
          },
          {
            id: 'memo_points',
            label: 'Key points (bullet-style OK)',
            type: 'textarea',
            required: true,
          },
          {
            id: 'action_requested',
            label: 'Action requested (if any)',
            type: 'textarea',
          },
        ],
      },
      {
        id: 'memo_finish',
        title: 'Finalize',
        fields: [
          {
            id: 'additional_requirements',
            label: 'Distribution, deadline, or formatting notes (optional)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
  custom: {
    researchMode: 'none',
    category: 'custom',
    steps: [
      {
        id: 'brief',
        title: 'What do you need?',
        fields: [
          {
            id: 'document_title',
            label: 'Working title',
            type: 'text',
            required: true,
          },
          {
            id: 'audience',
            label: 'Who is the audience?',
            type: 'text',
            required: true,
          },
          {
            id: 'purpose',
            label: 'Purpose of the document',
            type: 'textarea',
            required: true,
          },
        ],
      },
      {
        id: 'style',
        title: 'Style and length',
        fields: [
          {
            id: 'tone',
            label: 'Tone',
            type: 'select',
            required: true,
            options: TONE_OPTIONS,
          },
          {
            id: 'length',
            label: 'Approximate length',
            type: 'select',
            required: true,
            options: LENGTH_OPTIONS,
          },
          {
            id: 'main_instructions',
            label: 'Main content instructions',
            type: 'textarea',
            required: true,
            placeholder: 'Sections, arguments, data to include…',
          },
        ],
      },
      {
        id: 'custom_finish',
        title: 'Constraints',
        fields: [
          {
            id: 'must_include',
            label: 'Must include (optional)',
            type: 'textarea',
          },
          {
            id: 'must_avoid',
            label: 'Must avoid (optional)',
            type: 'textarea',
          },
          {
            id: 'additional_requirements',
            label: 'Anything else (optional)',
            type: 'textarea',
          },
        ],
      },
    ],
  },
}

export function getFlow(docId: OnDemandDocId): DocumentFlow {
  return DOCUMENT_FLOWS[docId]
}

export function totalWizardSteps(docId: OnDemandDocId): number {
  return 1 + DOCUMENT_FLOWS[docId].steps.length
}

export function getAllowedFieldIds(docId: OnDemandDocId): Set<string> {
  const set = new Set<string>()
  for (const st of DOCUMENT_FLOWS[docId].steps) {
    for (const f of st.fields) {
      set.add(f.id)
    }
  }
  return set
}

const MAX_FIELD_LEN = 8000

export function sanitizeWizardContext(
  docId: OnDemandDocId,
  raw: unknown
): Record<string, string> {
  const allowed = getAllowedFieldIds(docId)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!allowed.has(k)) continue
    const s = String(v ?? '').trim().slice(0, MAX_FIELD_LEN)
    out[k] = s
  }
  return out
}

/** Map wizard answers to legacy API columns + human description. */
export function buildLegacyApiFields(
  docId: OnDemandDocId,
  ctx: Record<string, string>
): {
  industry: string
  jurisdiction: string
  companyName: string
  website: string
  description: string
  additionalRequirements: string
} {
  const industry = ctx.industry || 'other'
  const jurisdiction = ctx.jurisdiction || 'global'
  const website = ctx.website || ''

  let companyName = ctx.company_name || ctx.full_name || ctx.applicant_name || ctx.document_title || 'Client'
  if (docId === 'contract') {
    companyName = `${ctx.party_a || ''} & ${ctx.party_b || ''}`.trim() || companyName
  }
  if (docId === 'nda') {
    companyName = `${ctx.disclosing_party || ''} / ${ctx.receiving_party || ''}`.trim() || companyName
  }
  if (docId === 'cover_letter') {
    companyName = `${ctx.applicant_name || 'Applicant'} → ${ctx.company_applying || 'Company'}`
  }
  if (docId === 'memorandum') {
    companyName = ctx.memo_from || 'Internal'
  }
  if (docId === 'law_divorce') {
    companyName = 'Family law outline'
  }

  const parts: string[] = []
  for (const step of DOCUMENT_FLOWS[docId].steps) {
    for (const f of step.fields) {
      if (f.id === 'additional_requirements') continue
      const val = ctx[f.id]
      if (val) parts.push(`${f.label}: ${val}`)
    }
  }
  const description = parts.join('\n').slice(0, 12000)
  const additionalRequirements = ctx.additional_requirements || ''

  return {
    industry,
    jurisdiction,
    companyName: companyName.slice(0, 500),
    website: website.slice(0, 500),
    description,
    additionalRequirements: additionalRequirements.slice(0, MAX_FIELD_LEN),
  }
}

export function stepIsValid(
  docId: OnDemandDocId,
  stepIndex: number,
  ctx: Record<string, string>
): boolean {
  if (stepIndex <= 0) return true
  const flow = DOCUMENT_FLOWS[docId]
  const step = flow.steps[stepIndex - 1]
  if (!step) return false
  for (const f of step.fields) {
    if (!f.required) continue
    const v = (ctx[f.id] || '').trim()
    if (!v) return false
  }
  return true
}

export function getResearchMode(docId: OnDemandDocId): ResearchMode {
  return DOCUMENT_FLOWS[docId].researchMode
}
