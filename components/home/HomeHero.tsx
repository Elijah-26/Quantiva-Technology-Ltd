'use client'

import { forwardRef } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'

export interface HomeHeroProps {
  onStartTrial: () => void
  onExploreDashboard: () => void
}

export const HomeHero = forwardRef<HTMLElement, HomeHeroProps>(function HomeHero(
  { onStartTrial, onExploreDashboard },
  ref
) {
  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden z-10"
    >
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#5b4cdb]/20 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#00d4ff]/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-coin relative w-48 h-48 mx-auto mb-12 [perspective:1000px]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5b4cdb]/30 to-[#00d4ff]/20 rounded-full blur-xl" />
            <div className="relative w-full h-full">
              <svg viewBox="0 0 200 200" className="w-full h-full animate-float">
                <defs>
                  <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5b4cdb" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="90" fill="none" stroke="url(#globeGradient)" strokeWidth="1" opacity="0.3" />
                <circle cx="100" cy="100" r="85" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.2" />
                <circle cx="100" cy="100" r="70" fill="url(#globeGradient)" opacity="0.1" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#globeGradient)" strokeWidth="2" filter="url(#glow)" />
                <ellipse cx="100" cy="100" rx="70" ry="20" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.4" />
                <ellipse cx="100" cy="100" rx="70" ry="40" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.4" />
                <ellipse cx="100" cy="100" rx="70" ry="60" fill="none" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.4" />
                <line x1="30" y1="100" x2="170" y2="100" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.4" />
                <line x1="100" y1="30" x2="100" y2="170" stroke="url(#globeGradient)" strokeWidth="0.5" opacity="0.4" />
                <circle cx="100" cy="100" r="15" fill="url(#globeGradient)" opacity="0.8" />
                <circle cx="100" cy="100" r="8" fill="#0a0a0f" />
              </svg>
            </div>
          </div>

          <h1 className="hero-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            The Infinity Library
            <br />
            of AI‑Powered Documents
          </h1>

          <p className="hero-subheadline text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            From academic research to enterprise compliance — generate any document with AI. One platform for
            individuals, businesses, and every department.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <button type="button" className="btn btn-primary px-6" onClick={onStartTrial}>
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </button>
            <button type="button" className="btn btn-secondary px-6" onClick={onExploreDashboard}>
              View Live Dashboard
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
})
