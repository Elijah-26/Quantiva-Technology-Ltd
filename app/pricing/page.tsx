'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Check,
  Zap,
  Sparkles,
  Building2,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

const PLANS = {
  starter: {
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started',
    icon: Zap,
    price: 49,
    features: [
      'Up to 5 market reports per month',
      'Basic competitive intelligence',
      'Email report delivery',
      '7-day report history',
      'Standard support',
    ],
    popular: false,
  },
  professional: {
    name: 'Professional',
    description: 'For growing teams that need deeper insights',
    icon: Sparkles,
    price: 149,
    popular: true,
    features: [
      'Up to 25 market reports per month',
      'Advanced competitive intelligence',
      'Scheduled recurring reports',
      '90-day report history',
      'Custom report templates',
      'Priority support',
      'API access',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Unlimited power for large organizations',
    icon: Building2,
    price: 499,
    popular: false,
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
  },
} as const

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planKey: keyof typeof PLANS) => {
    setLoadingPlan(planKey)

    try {
      const baseUrl =
        typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey,
          successUrl: `${baseUrl}/signup?checkout=success&plan=${planKey}`,
          cancelUrl: `${baseUrl}/pricing`,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      console.error(err)
      setLoadingPlan(null)
      alert(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl top-0 left-1/4 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl bottom-1/4 right-0 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/quantiva.png" alt="Quantiva" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Quantiva
              </span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/#features"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:inline"
              >
                Features
              </Link>
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Simple, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">transparent</span> pricing
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {(Object.entries(PLANS) as [keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]][]).map(
              ([key, plan]) => {
                const Icon = plan.icon
                const isLoading = loadingPlan === key

                return (
                  <div
                    key={key}
                    className={`relative transition-all duration-300 ${
                      plan.popular
                        ? 'glass-card-strong scale-[1.02]'
                        : 'glass-card hover:translate-y-[-2px]'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}

                    <div className="p-8 h-full flex flex-col">
                      <div className="mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                        <p className="text-gray-400 text-sm">{plan.description}</p>
                      </div>

                      <div className="mb-6">
                        <span className="text-4xl font-bold">£{plan.price}</span>
                        <span className="text-gray-400 ml-1">/month</span>
                      </div>

                      <ul className="space-y-4 flex-1 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSelectPlan(key)}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/30'
                            : 'bg-white/10 hover:bg-white/20 border border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading ? (
                          <>
                            <Spinner className="size-4 text-white" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              }
            )}
          </div>

          {/* Trust Section */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Secure payments via Stripe • Cancel anytime
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Questions?{' '}
              <a href="mailto:support@quantiva.world" className="text-blue-400 hover:underline">
                Contact us
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
