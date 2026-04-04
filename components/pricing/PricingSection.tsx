'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { MARKETING_PLANS, type MarketingPlanKey } from '@/lib/marketing-plans'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

function tierRank(id: MarketingPlanKey): number {
  return { starter: 0, professional: 1, enterprise: 2 }[id]
}

interface PricingSectionProps {
  onSelectPlan?: (planKey: MarketingPlanKey) => void
  isLoadingPlan?: string | null
  /** Logged-in user's tier (omit while loading summary). */
  activePlanId?: MarketingPlanKey | null
  /** Platform admin: all plan CTAs disabled. */
  isAdmin?: boolean
  /** Dashboard: tighter heading, same grid/cards as marketing. */
  compact?: boolean
  /** For scroll targets (e.g. billing payment tab → plans). */
  gridId?: string
  /** When false, omit the marketing title block (e.g. homepage supplies its own section header). */
  showHeading?: boolean
}

export function PricingSection({
  onSelectPlan,
  isLoadingPlan = null,
  activePlanId,
  isAdmin = false,
  compact = false,
  gridId,
  showHeading = true,
}: PricingSectionProps) {
  const showTierState =
    activePlanId !== undefined && activePlanId !== null

  return (
    <div className={cn('pricing-content max-w-6xl mx-auto', compact && 'max-w-6xl')}>
      {!compact && showHeading ? (
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>
      ) : null}
      {compact ? (
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
            Plans & pricing
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Same options as{' '}
            <a href="/pricing" className="text-indigo-400 hover:underline">
              quantiva.world/pricing
            </a>
            . Paid plans include a 14-day free trial. Secure checkout via Stripe.
          </p>
        </div>
      ) : null}

      <div id={gridId} className="grid md:grid-cols-3 gap-6">
        {MARKETING_PLANS.map((plan) => {
          const isLoading = isLoadingPlan === plan.id
          const isPopular = plan.popular
          const currentRank = showTierState && activePlanId != null ? tierRank(activePlanId) : -1
          const planRank = tierRank(plan.id)
          const isCurrent = showTierState && activePlanId != null && plan.id === activePlanId
          const isLowerTier = showTierState && activePlanId != null && planRank < currentRank
          const buttonDisabled =
            isLoading ||
            isAdmin ||
            isCurrent ||
            isLowerTier ||
            !onSelectPlan

          let buttonLabel: ReactNode = 'Get Started'
          if (isLoading) {
            buttonLabel = (
              <>
                <Spinner className="size-4 text-white" />
                Redirecting...
              </>
            )
          } else if (isAdmin) {
            buttonLabel = 'Admin access'
          } else if (isCurrent) {
            buttonLabel = 'Current plan'
          } else if (isLowerTier) {
            buttonLabel = 'Lower tier'
          }

          return (
            <div
              key={plan.id}
              className={cn(
                'pricing-card p-8',
                isPopular ? 'glass-card-strong relative border-indigo-500/30' : 'glass-card',
                isCurrent && 'ring-2 ring-emerald-500/50 rounded-2xl'
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-white">{plan.priceDisplay}</span>
                {plan.showMonthly && <span className="text-gray-400">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-emerald-400 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={cn(
                  'w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                  isPopular ? 'btn-primary' : 'btn-secondary',
                  buttonDisabled && !isLoading && 'opacity-60 cursor-not-allowed'
                )}
                onClick={() => {
                  if (buttonDisabled || isLoading) return
                  onSelectPlan(plan.id)
                }}
                disabled={buttonDisabled}
              >
                {buttonLabel}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
