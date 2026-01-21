// Webhook management utilities - Now using Supabase instead of localStorage

import { supabase } from './supabase/client'

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

// Fetch all webhooks from Supabase
export const getWebhooks = async (): Promise<WebhookConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('type', { ascending: true })

    if (error) {
      console.error('Error fetching webhooks:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getWebhooks:', error)
    return []
  }
}

// Get active webhooks only
export const getActiveWebhooks = async (): Promise<WebhookConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .order('type', { ascending: true })

    if (error) {
      console.error('Error fetching active webhooks:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveWebhooks:', error)
    return []
  }
}

// Get active webhooks by type
export const getActiveWebhooksByType = async (type: WebhookType): Promise<WebhookConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .eq('type', type)

    if (error) {
      console.error('Error fetching webhooks by type:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveWebhooksByType:', error)
    return []
  }
}

// Get webhooks by type (active or inactive)
export const getWebhooksByType = async (type: WebhookType): Promise<WebhookConfig[]> => {
  try {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('type', type)

    if (error) {
      console.error('Error fetching webhooks by type:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getWebhooksByType:', error)
    return []
  }
}

// Admin-only: Create webhook (use API route)
export const createWebhook = async (webhook: Omit<WebhookConfig, 'id' | 'created_at' | 'updated_at'>): Promise<{ data?: WebhookConfig; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { error: 'Not authenticated' }
    }

    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(webhook),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Failed to create webhook' }
    }

    return { data: result.webhook }
  } catch (error) {
    console.error('Error creating webhook:', error)
    return { error: 'Failed to create webhook' }
  }
}

// Admin-only: Update webhook (use API route)
export const updateWebhook = async (id: string, updates: Partial<WebhookConfig>): Promise<{ data?: WebhookConfig; error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { error: 'Not authenticated' }
    }

    const response = await fetch(`/api/webhooks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(updates),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || 'Failed to update webhook' }
    }

    return { data: result.webhook }
  } catch (error) {
    console.error('Error updating webhook:', error)
    return { error: 'Failed to update webhook' }
  }
}

// Admin-only: Delete webhook (use API route)
export const deleteWebhook = async (id: string): Promise<{ error?: string }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { error: 'Not authenticated' }
    }

    const response = await fetch(`/api/webhooks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const result = await response.json()
      return { error: result.error || 'Failed to delete webhook' }
    }

    return {}
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return { error: 'Failed to delete webhook' }
  }
}

