'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, Shield } from 'lucide-react'
import { PricingSection } from '@/components/pricing/PricingSection'
import type { MarketingPlanKey } from '@/lib/marketing-plans'

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Pricing', href: '/#pricing' },
]

export default function PricingPage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSelectPlan = async (planKey: string) => {
    setLoadingPlan(planKey)

    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planKey as MarketingPlanKey,
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
    <div className="relative min-h-screen bg-navy-900 text-white overflow-x-hidden">
      {/* Background layers from root layout (starfield, aurora, noise) */}

      {/* Header - matches homepage nav style */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 bg-navy-900/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-xl font-heading font-bold text-white">
            <img src="/quantiva.png" alt="Quantiva" className="w-8 h-8 object-contain" width={32} height={32} />
            Quantiva
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <button type="button" className="btn-primary text-sm" onClick={() => router.push('/pricing')}>
              Get Started
            </button>
          </div>

          <button
            type="button"
            className="md:hidden text-white"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass-card-strong m-4 p-6">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg text-gray-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="text-lg text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <button
                type="button"
                className="btn-primary text-sm mt-2"
                onClick={() => {
                  setMobileMenuOpen(false)
                  router.push('/pricing')
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="relative pt-24 pb-16 px-6 lg:px-12">
        <PricingSection onSelectPlan={handleSelectPlan} isLoadingPlan={loadingPlan} />

        {/* Trust section - standalone page only */}
        <div className="mt-20 text-center max-w-6xl mx-auto">
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
      </main>
    </div>
  )
}
