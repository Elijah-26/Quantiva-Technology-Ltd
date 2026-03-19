// Server-side helper to fetch user plan and limits
// Used by API routes for plan-based access control

import { supabaseAdmin } from '@/lib/supabase/server'
import {
  type SubscriptionPlan,
  type PlanLimits,
  getPlanLimits,
} from './plan-limits'

export interface UserPlanAndLimits {
  plan: SubscriptionPlan | null
  limits: PlanLimits
}

/**
 * Fetch user's subscription plan from users table and return limits.
 * Null plan defaults to Starter limits.
 */
export async function getUserPlanAndLimits(
  userId: string
): Promise<UserPlanAndLimits> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()

  if (error || !user) {
    return { plan: null, limits: getPlanLimits(null) }
  }

  const plan = (user.plan as SubscriptionPlan | null) ?? null
  return {
    plan,
    limits: getPlanLimits(plan),
  }
}
