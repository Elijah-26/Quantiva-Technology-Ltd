import type { SupabaseClient } from '@supabase/supabase-js'

export type AuditMetadata = Record<string, unknown>

export async function recordAuditEvent(
  admin: SupabaseClient,
  params: {
    actorUserId: string
    organizationId?: string | null
    action: string
    entityType: string
    entityId?: string | null
    metadata?: AuditMetadata
  }
): Promise<void> {
  const { error } = await admin.from('audit_events').insert({
    actor_user_id: params.actorUserId,
    organization_id: params.organizationId ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? {},
  })
  if (error) {
    console.error('recordAuditEvent', error)
  }
}
