import {
  DOCUMENT_FLOWS,
  type OnDemandDocId,
} from '@/lib/on-demand-generation/wizard-flows'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

const COMPANIES = [
  'Northwind Labs Ltd',
  'Aurora Analytics Inc',
  'Cedar Compliance Co',
  'Meridian Health Systems',
  'Vertex Fintech Group',
  'Summit Education Partners',
]

const SUMMARIES = [
  'B2B SaaS platform serving mid-market customers with analytics and workflow automation; processes account and billing data.',
  'Regional healthcare network operating clinics and a patient portal; handles PHI under applicable regulations.',
  'E-commerce retailer shipping consumer goods across multiple countries; uses payment processors and marketing cookies.',
]

function seedNarrative(seed: Record<string, string>): string {
  const parts = [
    seed.document_title,
    seed.purpose,
    seed.main_instructions,
    seed.audience,
    seed.must_include,
  ]
    .filter(Boolean)
    .join('\n')
  return parts.slice(0, 4000)
}

/**
 * Fills required wizard fields with plausible scheduled-demo values; optional user seed enriches custom or extra briefs.
 */
export function buildSyntheticWizardContext(
  docId: OnDemandDocId,
  options?: { seed?: Record<string, string> | null }
): Record<string, string> {
  const flow = DOCUMENT_FLOWS[docId]
  const seed = options?.seed || null
  const out: Record<string, string> = {}

  if (docId === 'custom' && seed && Object.keys(seed).length > 0) {
    for (const [k, v] of Object.entries(seed)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim()
    }
  }

  const company = pick(COMPANIES)
  const summary = pick(SUMMARIES)

  const defaults: Record<string, string> = {
    document_title: 'Scheduled custom brief — cross-functional playbook',
    audience: 'Leadership and operational leads',
    purpose:
      'Summarize priorities, dependencies, and decision points for the next planning cycle (synthetic scheduled demo).',
    tone: 'professional',
    length: 'medium',
    main_instructions:
      'Sections: context, objectives, risks, stakeholders, timeline, success metrics, and next actions.',
    must_include: 'A short risk table and a RACI-style bullet list.',
    must_avoid: 'Binding legal commitments or jurisdiction-specific filings language.',
    company_name: company,
    business_summary: summary,
    website: 'https://example.com',
    party_a: 'Acme Subcontractor LLC',
    party_b: 'Contoso Client Ltd',
    contract_purpose:
      'Master services agreement for implementation and support of analytics software, including SLAs and data protection terms.',
    hr_topic:
      'Remote work and hybrid attendance policy, including equipment stipend and core collaboration hours.',
    target_role: pick(['Product Manager', 'Senior Backend Engineer', 'Compliance Analyst', 'UX Researcher']),
    years_experience: pick(['4', '6', '8', '12']),
    seniority: pick(['mid', 'senior', 'lead'] as const),
    full_name: pick(['Alex Morgan', 'Jordan Lee', 'Sam Patel', 'Riley Chen']),
    email: 'draft.user@example.com',
    phone: '+1-555-0100',
    location: pick(['London, UK', 'Toronto, CA', 'Austin, US']),
    professional_summary:
      'Results-oriented professional with a track record of shipping reliable products and collaborating across legal, engineering, and GTM teams.',
    key_skills: 'Stakeholder management, documentation, SQL, Python, GDPR awareness, agile delivery',
    work_history:
      '2021–Present — Senior Analyst, DataWorks Ltd\n2018–2021 — Consultant, Bright Advisory',
    education: 'M.Sc. Information Systems, State University, 2017',
    certifications: 'Certified Information Privacy Professional (example)',
    marriage_duration: '10 years',
    children_involved: pick(['yes', 'no'] as const),
    party_names_anonymous: 'Petitioner and Respondent; seeking an amicable division of assets.',
    separation_status: pick(['considering', 'separated'] as const),
    assets_topics: 'Family home, retirement accounts, small business interest, vehicle, student loans.',
    priorities: 'Stability for children, fair support calculation, clear parenting schedule outline.',
    disclosing_party: 'Northwind Labs Ltd',
    receiving_party: 'Vendor Partner Co',
    confidential_scope:
      'Product roadmaps, pricing, customer lists, and technical architecture shared during evaluation.',
    term_length: '3 years',
    mutual_nda: pick(['one_way', 'mutual'] as const),
    company_applying: pick(['Globex Industries', 'Initech Solutions', 'Umbrella BioTech']),
    why_role:
      'Strong alignment with mission and opportunity to deepen domain expertise while mentoring junior teammates.',
    key_achievements:
      'Led cross-functional launch reducing incident rate 30%; owned vendor security review program.',
    memo_to: 'All department heads',
    memo_from: 'Office of the COO',
    memo_subject: 'Q2 operational priorities and risk register update',
    memo_background:
      'Following internal audit findings and vendor changes, we need aligned guidance before budget lock.',
    memo_points:
      '- Complete vendor DPA renewals by month-end\n- Freeze non-critical third-party integrations\n- Report exceptions to Legal',
    action_requested: 'Confirm owners for each workstream by EOW.',
  }

  for (const step of flow.steps) {
    for (const f of step.fields) {
      if (out[f.id]?.trim()) continue
      if (f.type === 'select' && f.options?.length) {
        out[f.id] = pick(f.options).value
      } else if (defaults[f.id]) {
        out[f.id] = defaults[f.id]
      } else if (f.required) {
        out[f.id] = `Scheduled sample content for ${f.label}`
      }
    }
  }

  if (seed && docId !== 'custom') {
    const extra = seedNarrative(seed)
    if (extra) {
      const prev = out.additional_requirements || ''
      out.additional_requirements = [prev, 'Thematic brief from user seed library:', extra]
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 8000)
    }
  }

  return out
}

export function pickRandomOnDemandType(): OnDemandDocId {
  const ids = Object.keys(DOCUMENT_FLOWS) as OnDemandDocId[]
  return pick(ids)
}
