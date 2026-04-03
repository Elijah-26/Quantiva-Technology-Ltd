import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

function stableHash(obj: Record<string, string>): string {
  const keys = Object.keys(obj).sort()
  const payload = keys.map((k) => `${k}:${obj[k]}`).join('|')
  return createHash('sha256').update(payload, 'utf8').digest('hex')
}

/**
 * Stores sanitized custom wizard answers for scheduled generation variety.
 * Dedupes by context_hash. Privacy-sensitive — admin / service role only.
 */
export async function insertCustomGenerationSeedIfNew(
  admin: SupabaseClient,
  input: {
    wizardContext: Record<string, string>
    sourceUserId: string
    documentTitle: string
  }
): Promise<void> {
  const contextHash = stableHash(input.wizardContext)
  const { error } = await admin.from('custom_generation_seeds').insert({
    wizard_context: input.wizardContext,
    source_user_id: input.sourceUserId,
    document_title: input.documentTitle || null,
    context_hash: contextHash,
  })
  if (error) {
    if (error.code === '23505') return
    console.warn('[custom_generation_seeds] insert skipped:', error.message)
  }
}

export async function fetchRandomCustomSeed(
  admin: SupabaseClient
): Promise<{ id: string; wizard_context: Record<string, string> } | null> {
  const { data, error } = await admin
    .from('custom_generation_seeds')
    .select('id, wizard_context')
    .limit(200)
  if (error || !data?.length) return null
  const row = data[Math.floor(Math.random() * data.length)] as {
    id: string
    wizard_context: Record<string, string>
  }
  const ctx = row.wizard_context
  if (!ctx || typeof ctx !== 'object') return null
  return { id: row.id, wizard_context: ctx as Record<string, string> }
}
