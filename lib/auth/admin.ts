import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

/** Matches admin checks used across API routes (metadata + legacy emails). */
export function isPlatformAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  const um = user.user_metadata as { role?: string } | undefined
  const am = user.app_metadata as { role?: string } | undefined
  return (
    um?.role === 'admin' ||
    am?.role === 'admin' ||
    user.email === 'admin@quantitva.com' ||
    user.email === 'pat2echo@gmail.com'
  )
}

/**
 * Platform admin from JWT/metadata OR `public.users.role === 'admin'`.
 * Use in API routes so admins granted via DB (without synced auth metadata) still pass.
 */
export async function isUserPlatformAdmin(
  user: User | null | undefined,
  admin: SupabaseClient
): Promise<boolean> {
  if (!user) return false
  if (isPlatformAdmin(user)) return true
  const { data, error } = await admin.from('users').select('role').eq('id', user.id).maybeSingle()
  if (error || !data) return false
  return data.role === 'admin'
}
