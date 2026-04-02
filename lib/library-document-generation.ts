import type { SupabaseClient } from '@supabase/supabase-js'
import { docTypeLabel } from '@/lib/library-document-taxonomy'

export type LibraryDocSource = 'curated' | 'scheduled' | 'on_demand'

export interface GenerateLibraryDocumentInput {
  marketCategoryValue: string
  marketCategoryLabel: string
  documentTypeId: string
  geographyValue: string
  geographyLabel: string
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function previewFromBody(body: string, maxLen = 600): string {
  const t = body.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen)}…`
}

export async function synthesizeLibraryDocument(
  input: GenerateLibraryDocumentInput
): Promise<{ text: string; error?: string }> {
  const docLabel = docTypeLabel(input.marketCategoryValue, input.documentTypeId)
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    const placeholder = `[Auto-generated draft — set OPENAI_API_KEY for live output]\n\n${docLabel}\nIndustry context: ${input.marketCategoryLabel}\nJurisdiction: ${input.geographyLabel}\n\nUse [Company Name] and [Date] as placeholders.`
    return { text: placeholder }
  }

  const userContent = `Write a professional ${docLabel} suitable for organizations in the "${input.marketCategoryLabel}" sector.
Regulatory / geographic context to reflect: ${input.geographyLabel} (${input.geographyValue}).
Use clear headings and bullet points where appropriate.
Use placeholders such as [Company Name], [Address], [Effective Date], [Contact Email] where specific details are needed.
Do not claim to be legal advice; this is a draft template only.
Length: substantial but concise (roughly 800–1500 words of usable policy text if appropriate for the document type).`

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
          {
            role: 'system',
            content:
              'You produce compliance- and business-oriented document drafts (policies, terms, notices). Clear structure, neutral professional tone.',
          },
          { role: 'user', content: userContent },
        ],
        max_tokens: 4000,
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

export function buildLibraryDocumentTitle(input: GenerateLibraryDocumentInput, suffix?: string): string {
  const docLabel = docTypeLabel(input.marketCategoryValue, input.documentTypeId)
  const base = `${docLabel} — ${input.marketCategoryLabel}`
  return suffix ? `${base} (${suffix})` : base
}

export async function insertGeneratedLibraryRow(
  admin: SupabaseClient,
  params: {
    title: string
    fullContent: string
    preview: string
    marketCategoryValue: string
    geographyValue: string
    source: LibraryDocSource
    createdByUserId: string | null
    /** When set, monthly quota counts the job only (not this row as extra on_demand). */
    generationJobId?: string | null
    description?: string
  }
): Promise<{ id: string } | { error: string }> {
  const wc = wordCount(params.fullContent)
  const now = new Date().toISOString().slice(0, 10)
  const description =
    params.description ??
    `Generated ${params.source} document for category ${params.marketCategoryValue}.`
  const row: Record<string, unknown> = {
    title: params.title,
    description,
    category: params.marketCategoryValue,
    jurisdiction: params.geographyValue,
    access_level: 'free',
    word_count: wc,
    download_count: 0,
    rating: 0,
    last_updated: now,
    preview: params.preview,
    full_content: params.fullContent,
    read_minutes: Math.max(1, Math.ceil(wc / 200)),
    complexity: 'Moderate',
    versions: [{ version: '1.0', date: now, note: `Auto-generated (${params.source})` }],
    related_ids: [],
    source: params.source,
    created_by_user_id: params.createdByUserId,
  }
  if (params.generationJobId) {
    row.generation_job_id = params.generationJobId
  }
  const { data, error } = await admin.from('library_documents').insert(row)
    .select('id')
    .single()

  if (error || !data) {
    return { error: error?.message || 'Insert failed' }
  }
  return { id: data.id as string }
}
