// Shared marketing/display pricing data for homepage and standalone pricing page.
// Used for UI display; Stripe price IDs are configured in env and checkout API.

export type MarketingPlanKey = 'starter' | 'professional' | 'enterprise'

export interface MarketingPlan {
  id: MarketingPlanKey
  name: string
  description: string
  priceDisplay: string // e.g. "£0", "£49", "Custom"
  showMonthly: boolean // false for "Custom"
  features: string[]
  popular: boolean
}

export const MARKETING_PLANS: MarketingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started',
    priceDisplay: '£0',
    showMonthly: true,
    features: [
      'Up to 5 market reports per month',
      'Basic competitive intelligence',
      'Email report delivery',
      '7-day report history',
      'Standard support',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams that need deeper insights',
    priceDisplay: '£49',
    showMonthly: true,
    features: [
      'Up to 25 market reports per month',
      'Advanced competitive intelligence',
      'Scheduled recurring reports',
      '90-day report history',
      'Custom report templates',
      'Priority support',
      'API access',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited power for large organizations',
    priceDisplay: 'Custom',
    showMonthly: false,
    features: [
      'Unlimited market reports',
      'Full competitive intelligence suite',
      'Custom schedules & workflows',
      'Unlimited report history',
      'Dedicated account manager',
      'Custom integrations',
      'SSO & advanced security',
      'SLA guarantee',
    ],
    popular: false,
  },
]
