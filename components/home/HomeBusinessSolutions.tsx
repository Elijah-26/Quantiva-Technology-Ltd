'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { Building2, Rocket, TrendingUp, Target, Users, BarChart3, Shield, ArrowRight } from 'lucide-react'

const solutions = [
  {
    icon: Rocket,
    title: 'Startups',
    description: 'Launch faster with pitch decks, business plans, and investor materials.',
    features: ['Pitch Decks', 'Business Plans', 'Investor Updates', 'Financial Models'],
  },
  {
    icon: TrendingUp,
    title: 'Scale-ups',
    description: 'Streamline operations with SOPs, policies, and process documentation.',
    features: ['SOPs', 'Process Docs', 'Training Materials', 'HR Policies'],
  },
  {
    icon: Building2,
    title: 'Enterprise',
    description: 'Maintain compliance with regulatory documents and governance.',
    features: ['Compliance Docs', 'Risk Assessments', 'Audit Reports', 'Governance'],
  },
]

const stats = [
  { icon: Target, stat: '70%', label: 'Faster Document Creation' },
  { icon: Users, stat: '500+', label: 'Teams Empowered' },
  { icon: BarChart3, stat: '99.2%', label: 'Accuracy Rate' },
  { icon: Shield, stat: '100%', label: 'Compliance Ready' },
]

export const HomeBusinessSolutions = forwardRef<HTMLElement>(function HomeBusinessSolutions(_, ref) {
  return (
    <section ref={ref} id="business-solutions" className="section relative bg-[#0a0a0f] z-10">
      <div className="business-content container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Business Solutions</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Build & Scale Your Business</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From startup pitch decks to enterprise compliance — Quantiva provides the documents you need to grow,
            scale, and succeed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {solutions.map((solution, index) => (
            <div key={index} className="card group hover:border-[#5b4cdb]/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center mb-6">
                <solution.icon className="w-6 h-6 text-[#5b4cdb]" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{solution.title}</h3>
              <p className="text-gray-400 mb-6 text-sm">{solution.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {solution.features.map((feature, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-500">
                    {feature}
                  </span>
                ))}
              </div>

              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-sm text-[#5b4cdb] hover:text-[#7c6ae6] transition-colors"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="card text-center hover:border-[#5b4cdb]/30 transition-all">
              <div className="w-10 h-10 mx-auto rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center mb-4">
                <stat.icon className="w-5 h-5 text-[#5b4cdb]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.stat}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
