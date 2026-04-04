/** JSON shape for GET /api/billing/summary */

import type { SubscriptionPlan } from '@/lib/plan-limits'

export interface BillingSummaryResponse {
  /** Commercial tier for plan cards; null for platform admins (no tier highlight). */
  planId: SubscriptionPlan | null
  planDisplayName: string
  isAdmin: boolean
  /** Main line under “Current plan” */
  renewalPrimary: string
  /** Smaller helper text (optional) */
  renewalSecondary: string | null
  currentYear: number
  usage: {
    generationsUsedThisMonth: number
    generationsLimit: number
    /** -1 means unlimited */
    reportsUsedThisMonth: number
    reportsLimit: number
  }
}
