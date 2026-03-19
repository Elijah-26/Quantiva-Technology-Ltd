'use client'

import { Check } from 'lucide-react'
import { MARKETING_PLANS } from '@/lib/marketing-plans'
import { Spinner } from '@/components/ui/spinner'

interface PricingSectionProps {
  onSelectPlan?: (planKey: string) => void
  isLoadingPlan?: string | null
}

export function PricingSection({ onSelectPlan, isLoadingPlan = null }: PricingSectionProps) {
  return (
    <div className="pricing-content max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose the plan that fits your needs. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {MARKETING_PLANS.map((plan) => {
          const isLoading = isLoadingPlan === plan.id
          const isPopular = plan.popular

          return (
            <div
              key={plan.id}
              className={`pricing-card p-8 ${
                isPopular ? 'glass-card-strong relative border-indigo-500/30' : 'glass-card'
              }`}
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
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  isPopular ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => onSelectPlan?.(plan.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner className="size-4 text-white" />
                    Redirecting...
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
