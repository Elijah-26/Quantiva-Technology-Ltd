'use client'

import { forwardRef } from 'react'
import { ArrowRight, Calendar } from 'lucide-react'

export interface HomeCTAProps {
  onStartTrial: () => void
}

export const HomeCTA = forwardRef<HTMLElement, HomeCTAProps>(function HomeCTA({ onStartTrial }, ref) {
  return (
    <section ref={ref} className="section relative bg-[#0a0a0f] z-10">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#5b4cdb]/10 rounded-full blur-[150px]" />
      </div>

      <div className="cta-content container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">
            14-Day Free Trial • No Credit Card Required
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Document Creation?
          </h2>

          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
            Join 10,000+ users who trust Quantiva for academic research, business documents, and everything in between.
            Your Infinity Library awaits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button type="button" className="btn btn-primary px-8" onClick={onStartTrial}>
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="mailto:info@quantiva.world?subject=Schedule%20a%20demo"
              className="btn btn-secondary px-8"
            >
              <Calendar className="w-4 h-4" />
              Schedule Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  )
})
