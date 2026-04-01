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
