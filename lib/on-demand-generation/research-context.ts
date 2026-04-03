import {
  getResearchMode,
  JURISDICTION_OPTIONS,
  type OnDemandDocId,
} from './wizard-flows'

const DEFAULT_API_BASE = 'https://api.firecrawl.dev'

function jurisdictionLabel(value: string): string {
  return JURISDICTION_OPTIONS.find((j) => j.value === value)?.label || value || ''
}

function buildSearchQuery(documentType: OnDemandDocId, ctx: Record<string, string>): string {
  const jur = jurisdictionLabel(ctx.jurisdiction || '')
  const snippets = [
    ctx.business_summary,
    ctx.hr_topic,
    ctx.assets_topics,
    ctx.contract_purpose,
    ctx.priorities,
    ctx.confidential_scope,
    ctx.main_instructions,
    ctx.purpose,
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 600)

  const typePhrase = documentType.replace(/_/g, ' ')
  return `${typePhrase} law guidance ${jur} ${snippets}`.replace(/\s+/g, ' ').trim().slice(0, 480)
}

function clipMd(md: string, max: number): string {
  const t = (md || '').trim().replace(/\s+/g, ' ')
  return t.length <= max ? t : `${t.slice(0, max)}…`
}

/**
 * Optional Firecrawl search for document types configured with researchMode firecrawl.
 * Returns empty string if key missing, wrong mode, or failure.
 */
export async function getOptionalWebContextForGeneration(
  documentType: OnDemandDocId,
  wizardContext: Record<string, string>
): Promise<string> {
  if (getResearchMode(documentType) !== 'firecrawl') return ''

  const key = process.env.FIRECRAWL_API_KEY?.trim()
  if (!key) return ''

  const base = (process.env.FIRECRAWL_API_URL || DEFAULT_API_BASE).replace(/\/$/, '')
  const query = buildSearchQuery(documentType, wizardContext)
  if (!query) return ''

  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 25_000)
    const res = await fetch(`${base}/v1/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        query,
        limit: 3,
        scrapeOptions: { formats: ['markdown'] },
      }),
    })
    clearTimeout(t)

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) return ''

    const data = json.data
    const rows: unknown[] = Array.isArray(data) ? data : []
    const parts: string[] = []
    for (const row of rows.slice(0, 3)) {
      const r = row as Record<string, unknown>
      const url = String(r.url || r.link || '')
      const title = String(r.title || r.name || 'Source')
      const md = clipMd(String(r.markdown || r.content || r.description || ''), 900)
      if (md) parts.push(`- ${title}${url ? ` (${url})` : ''}\n  ${md}`)
    }
    return parts.join('\n\n')
  } catch {
    return ''
  }
}
