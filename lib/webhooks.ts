// Webhook resolution from Supabase via authenticated API (see app/api/webhooks/route.ts)

export type WebhookType = 'on-demand' | 'recurring'

export interface WebhookConfig {
  id: string
  name: string
  url: string
  type: WebhookType
  description?: string
  active: boolean
  created_at: string
  updated_at?: string
}

function mapRow(row: Record<string, unknown>): WebhookConfig {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    url: String(row.url ?? ''),
    type: (row.type === 'recurring' ? 'recurring' : 'on-demand') as WebhookType,
    description: row.description != null ? String(row.description) : undefined,
    active: Boolean(row.active),
    created_at: String(row.created_at ?? ''),
    updated_at: row.updated_at != null ? String(row.updated_at) : undefined,
  }
}

/** Load all webhooks the current user may read (RLS / API enforced). */
export async function fetchWebhooksFromApi(): Promise<WebhookConfig[]> {
  const res = await fetch('/api/webhooks', { credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.error === 'string' ? err.error : 'Failed to load webhooks')
  }
  const data = await res.json()
  const list = Array.isArray(data.webhooks) ? data.webhooks : []
  return list.map((row: Record<string, unknown>) => mapRow(row))
}

export const getWebhooks = fetchWebhooksFromApi

export async function getActiveWebhooks(): Promise<WebhookConfig[]> {
  const all = await fetchWebhooksFromApi()
  return all.filter((w) => w.active)
}

export async function getActiveWebhooksByType(type: WebhookType): Promise<WebhookConfig[]> {
  const all = await fetchWebhooksFromApi()
  return all.filter((w) => w.active && w.type === type)
}

export async function getWebhooksByType(type: WebhookType): Promise<WebhookConfig[]> {
  const all = await fetchWebhooksFromApi()
  return all.filter((w) => w.type === type)
}
