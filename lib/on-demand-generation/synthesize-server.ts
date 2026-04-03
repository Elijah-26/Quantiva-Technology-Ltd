import {
  sanitizeWizardContext,
  type OnDemandDocId,
} from '@/lib/on-demand-generation/wizard-flows'
import { systemPromptForDocumentType, userPromptForGeneration } from '@/lib/on-demand-generation/prompts'
import { getOptionalWebContextForGeneration } from '@/lib/on-demand-generation/research-context'

export const WIZARD_DOC_LABELS: Record<string, string> = {
  privacy: 'Privacy Policy',
  dpa: 'Data Processing Agreement (DPA)',
  terms: 'Terms of Service',
  contract: 'Contract',
  compliance: 'Compliance Doc',
  hr: 'HR Document',
  resume: 'Resume / CV',
  law_divorce: 'Family law — divorce (informational)',
  nda: 'Non-Disclosure Agreement (NDA)',
  cover_letter: 'Cover letter',
  memorandum: 'Internal memorandum',
  custom: 'Custom Document',
}

function effectiveWizardContext(
  docId: OnDemandDocId,
  sanitized: Record<string, string>,
  legacy: {
    industry: string
    jurisdiction: string
    companyName: string
    website: string
    description: string
    additionalRequirements: string
  }
): Record<string, string> {
  if (Object.keys(sanitized).length > 0) return sanitized
  return {
    industry: legacy.industry,
    jurisdiction: legacy.jurisdiction,
    company_name: legacy.companyName,
    website: legacy.website,
    business_summary: legacy.description,
    additional_requirements: legacy.additionalRequirements,
  }
}

export type SynthesizeOnDemandOptions = {
  /** Skip Firecrawl for scheduled/cost-controlled runs */
  skipWebResearch?: boolean
}

export async function synthesizeOnDemandDocument(
  input: {
    documentType: OnDemandDocId
    wizardContext: Record<string, string>
    legacy: {
      industry: string
      jurisdiction: string
      companyName: string
      website: string
      description: string
      additionalRequirements: string
    }
  },
  options?: SynthesizeOnDemandOptions
): Promise<{ text: string; error?: string }> {
  const key = process.env.OPENAI_API_KEY
  const sanitized = sanitizeWizardContext(input.documentType, input.wizardContext)
  const ctx = effectiveWizardContext(input.documentType, sanitized, input.legacy)

  if (!key) {
    const preview = JSON.stringify(ctx, null, 2).slice(0, 2000)
    return {
      text: `[Draft — add OPENAI_API_KEY for live AI generation]\n\n${preview}`,
    }
  }

  const web =
    options?.skipWebResearch === true
      ? ''
      : await getOptionalWebContextForGeneration(input.documentType, ctx)
  const systemContent = systemPromptForDocumentType(input.documentType)
  const userContent = userPromptForGeneration(input.documentType, ctx, web)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
        max_tokens: 3800,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      return { text: '', error: json?.error?.message || 'OpenAI request failed' }
    }
    const text = json?.choices?.[0]?.message?.content?.trim()
    if (!text) return { text: '', error: 'Empty model response' }
    return { text }
  } catch (e) {
    return { text: '', error: e instanceof Error ? e.message : 'Generation failed' }
  }
}
