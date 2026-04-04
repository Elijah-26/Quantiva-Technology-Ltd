'use client'

import type { ReactNode } from 'react'
import { forwardRef } from 'react'

export const HomePricingSection = forwardRef<HTMLElement, { children: ReactNode }>(function HomePricingSection(
  { children },
  ref
) {
  return (
    <section ref={ref} id="pricing" className="section relative bg-[#0a0a0f] z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your team. All plans include a 14-day free trial.
          </p>
        </div>
        {children}
      </div>
    </section>
  )
})
