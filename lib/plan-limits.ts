// Plan-based feature limits
// Used for restricting user actions based on subscription tier

export type SubscriptionPlan = 'starter' | 'professional' | 'enterprise'

export interface PlanLimits {
  reportsPerMonth: number
  reportHistoryDays: number
  recurringEnabled: boolean
  pptExport: boolean
  apiAccess: boolean
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  starter: {
    reportsPerMonth: 5,
    reportHistoryDays: 7,
    recurringEnabled: true, // Available on all plans; limits apply to total reports/month
    pptExport: false,
    apiAccess: false,
  },
  professional: {
    reportsPerMonth: 25,
    reportHistoryDays: 90,
    recurringEnabled: true,
    pptExport: true,
    apiAccess: false, // Enterprise only (placeholder)
  },
  enterprise: {
    reportsPerMonth: Infinity,
    reportHistoryDays: Infinity,
    recurringEnabled: true,
    pptExport: true,
    apiAccess: true,
  },
}

/** Get limits for a plan. Null/undefined defaults to Starter (restrictive). */
export function getPlanLimits(plan: SubscriptionPlan | null | undefined): PlanLimits {
  if (plan && plan in PLAN_LIMITS) {
    return PLAN_LIMITS[plan]
  }
  return PLAN_LIMITS.starter
}
