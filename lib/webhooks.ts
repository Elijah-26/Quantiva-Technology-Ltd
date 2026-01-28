// Webhook management utilities - Hardcoded production URLs

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

// Hardcoded production webhooks (rarely change)
const PRODUCTION_WEBHOOKS: WebhookConfig[] = [
  {
    id: '1',
    name: 'On-Demand Research Handler',
    url: 'https://elijahakinola26.app.n8n.cloud/webhook/on_demand',
    type: 'on-demand',
    description: 'Handles immediate market research requests',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Recurring Research Handler',
    url: 'https://elijahakinola26.app.n8n.cloud/webhook/recurring',
    type: 'recurring',
    description: 'Handles scheduled recurring research requests',
    active: true,
    created_at: new Date().toISOString(),
  },
]

// Fetch all webhooks (returns hardcoded production URLs)
export const getWebhooks = async (): Promise<WebhookConfig[]> => {
  return PRODUCTION_WEBHOOKS
}

// Get active webhooks only
export const getActiveWebhooks = async (): Promise<WebhookConfig[]> => {
  return PRODUCTION_WEBHOOKS.filter(w => w.active)
}

// Get active webhooks by type
export const getActiveWebhooksByType = async (type: WebhookType): Promise<WebhookConfig[]> => {
  return PRODUCTION_WEBHOOKS.filter(w => w.active && w.type === type)
}

// Get webhooks by type (active or inactive)
export const getWebhooksByType = async (type: WebhookType): Promise<WebhookConfig[]> => {
  return PRODUCTION_WEBHOOKS.filter(w => w.type === type)
}

// Note: Webhooks are hardcoded and rarely change.
// If webhook URLs need to be updated, contact the development team.
// The URLs are configured in production n8n and should remain static.

