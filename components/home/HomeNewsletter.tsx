'use client'

import { ArrowRight } from 'lucide-react'

export interface HomeNewsletterProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function HomeNewsletter({ onSubmit }: HomeNewsletterProps) {
  return (
    <section className="section relative bg-[#0a0a0f] z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Stay ahead of the curve</h3>
          <p className="text-gray-400 mb-6">Get market insights and product updates delivered to your inbox</p>

          <form className="flex flex-col sm:flex-row gap-3" onSubmit={onSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5b4cdb]/50 transition-colors"
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-gray-600 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}
