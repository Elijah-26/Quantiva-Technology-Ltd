'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Bell,
  FileText,
  Check,
  ChevronRight,
  Mail,
  Twitter,
  Linkedin,
  Github,
  ExternalLink,
  Clock,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLElement>(null)
  const dashboardRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const detailsRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-coin',
        { scale: 0.75, opacity: 0, rotateY: -35 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.1, ease: 'power3.out', delay: 0.3 }
      )

      gsap.fromTo(
        '.hero-headline span',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.03, delay: 0.5 }
      )

      gsap.fromTo(
        '.hero-subheadline',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 }
      )

      gsap.fromTo(
        '.hero-cta',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 1 }
      )

      const sections = [
        { ref: statsRef, selector: '.stats-content' },
        { ref: dashboardRef, selector: '.dashboard-content' },
        { ref: featuresRef, selector: '.features-content' },
        { ref: pricingRef, selector: '.pricing-content' },
        { ref: detailsRef, selector: '.details-content' },
        { ref: ctaRef, selector: '.cta-content' },
        { ref: footerRef, selector: '.footer-content' },
      ]

      sections.forEach(({ ref, selector }) => {
        if (ref.current) {
          gsap.fromTo(
            selector,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: ref.current,
                start: 'top 80%',
                end: 'top 50%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })

      if (featuresRef.current) {
        gsap.fromTo(
          '.feature-card',
          { y: 50, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (pricingRef.current) {
        gsap.fromTo(
          '.pricing-card',
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: pricingRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      if (detailsRef.current) {
        gsap.fromTo(
          '.feature-list-item',
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.06,
            scrollTrigger: {
              trigger: detailsRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    })

    return () => ctx.revert()
  }, [])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Docs', href: '#docs' },
  ]

  return (
    <div className="relative min-h-screen bg-navy-900 text-white overflow-x-hidden">
      {/* Background layers live in root layout (starfield, aurora, noise) */}

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-4 bg-navy-900/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-xl font-heading font-bold text-white">
            <img src="/quantiva.png" alt="" className="w-8 h-8 object-contain" width={32} height={32} />
            Quantiva
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <button type="button" className="btn-primary text-sm" onClick={() => router.push('/signup')}>
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
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg text-gray-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Link
                href="/login"
                className="text-lg text-gray-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <button type="button" className="btn-primary text-sm mt-2" onClick={() => router.push('/signup')}>
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-6 lg:px-12 pt-24 pb-16"
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="hero-coin relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 mx-auto mb-6 [perspective:1000px]">
            <div className="absolute inset-0 rounded-full accent-glow opacity-60" />
            <img
              src="/hero-coin.jpg"
              alt="Quantiva"
              className="w-full h-full object-cover rounded-full animate-float relative z-[1]"
              width={240}
              height={240}
            />
          </div>

          <h1 className="hero-headline font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {'Automated Market Research That Never Sleeps'.split(' ').map((word, i) => (
              <span key={i} className="inline-block mr-[0.25em]">
                {word}
              </span>
            ))}
          </h1>

          <p className="hero-subheadline text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Transform your business strategy with automated, recurring market insights. Get data-backed
            competitive intelligence delivered on your schedule.
          </p>

          <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              className="btn-primary flex items-center gap-2 text-base"
              onClick={() => router.push('/pricing')}
            >
              Start Free Trial
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn-secondary flex items-center gap-2 text-base"
              onClick={() => router.push('/dashboard')}
            >
              View Live Dashboard
              <ExternalLink size={18} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      <section ref={statsRef} id="features" className="relative py-24 px-6 lg:px-12 z-10">
        <div className="stats-content max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-label">Capabilities</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Powerful Intelligence Tools
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Everything you need to dominate your market
            </p>
          </div>

          <div ref={featuresRef} className="features-content grid md:grid-cols-3 gap-6">
            <div className="feature-card glass-card-strong p-8 lg:p-10 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="text-indigo-400" size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">Automated Research</h3>
              <p className="text-gray-400 leading-relaxed">
                AI-powered market analysis that runs on autopilot. Get comprehensive insights without lifting a
                finger.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <a href="#features" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 text-sm font-medium">
                  Learn more <ChevronRight size={16} />
                </a>
              </div>
            </div>

            <div className="feature-card glass-card-strong p-8 lg:p-10 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Activity className="text-emerald-400" size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">Competitive Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                Track competitors in real-time. Monitor pricing, strategies, and market positioning automatically.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <a href="#features" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium">
                  Learn more <ChevronRight size={16} />
                </a>
              </div>
            </div>

            <div className="feature-card glass-card-strong p-8 lg:p-10 group hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <Bell className="text-amber-400" size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">Real-Time Alerts</h3>
              <p className="text-gray-400 leading-relaxed">
                Instant notifications on market shifts. Never miss a critical opportunity or threat.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10">
                <a href="#features" className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm font-medium">
                  Learn more <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={dashboardRef} className="relative py-24 px-6 lg:px-12 z-10">
        <div className="dashboard-content max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Market Research?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join hundreds of businesses making smarter decisions with automated intelligence.
            </p>
          </div>
        </div>
      </section>

      <section ref={detailsRef} id="docs" className="relative py-24 px-6 lg:px-12 z-10">
        <div className="details-content max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-label">Getting Started</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">
              Three Steps to Market Mastery
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">Get started in minutes, not hours</p>
          </div>

          <div className="glass-card-strong p-6 lg:p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <BarChart3 className="text-indigo-400" size={20} />
                </div>
                <div>
                  <div className="text-white font-heading font-semibold">Market Research Dashboard</div>
                  <div className="text-gray-500 text-sm">Overview & Setup</div>
                </div>
              </div>
              <button
                type="button"
                className="btn-primary text-sm flex items-center gap-2"
                onClick={() => router.push('/dashboard/new-research')}
              >
                <span className="text-lg">+</span> Create New Research
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Total Reports</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="text-blue-400" size={16} />
                  </div>
                </div>
                <div className="text-3xl font-heading font-bold text-white mb-3">0</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Zap size={12} className="text-amber-400" /> On-demand
                    </span>
                    <span className="text-gray-400">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Activity size={12} className="text-blue-400" /> Recurring
                    </span>
                    <span className="text-gray-400">0</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Active Schedules</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Bell className="text-emerald-400" size={16} />
                  </div>
                </div>
                <div className="text-3xl font-heading font-bold text-white mb-3">0</div>
                <div className="text-sm text-gray-500">No upcoming schedules</div>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Last Research Run</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Clock className="text-purple-400" size={16} />
                  </div>
                </div>
                <div className="text-lg font-heading font-semibold text-gray-400 mb-1">No reports yet</div>
                <div className="text-sm text-gray-500">Create your first research</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 lg:p-8 border border-indigo-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center">
                  <TrendingUp className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-heading font-semibold text-lg">Getting Started</h3>
                  <p className="text-gray-400 text-sm">Tips to maximize your market intelligence</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="feature-list-item flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-heading font-bold text-sm">
                    01
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-heading font-semibold mb-1">Select Your Market</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Choose your target industry and define research parameters with our intuitive interface.
                    </p>
                  </div>
                </div>

                <div className="feature-list-item flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-heading font-bold text-sm">
                    02
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-heading font-semibold mb-1">Set Your Schedule</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Run on-demand or automate with daily, weekly, or monthly research cycles.
                    </p>
                  </div>
                </div>

                <div className="feature-list-item flex gap-4 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-heading font-bold text-sm">
                    03
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-heading font-semibold mb-1">Receive Insights</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Get actionable intelligence delivered to your dashboard with clear reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={pricingRef} id="pricing" className="relative py-24 px-6 lg:px-12 z-10">
        <div className="pricing-content max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="pricing-card glass-card p-8">
              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400 text-sm">Perfect for individuals and small teams getting started</p>
              </div>
              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-white">£0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 5 market reports per month',
                  'Basic competitive intelligence',
                  'Email report delivery',
                  '7-day report history',
                  'Standard support',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-emerald-400 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-secondary w-full" onClick={() => router.push('/pricing')}>
                Get Started
              </button>
            </div>

            <div className="pricing-card glass-card-strong p-8 relative border-indigo-500/30">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-500 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">Professional</h3>
                <p className="text-gray-400 text-sm">For growing teams that need deeper insights</p>
              </div>
              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-white">£49</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 25 market reports per month',
                  'Advanced competitive intelligence',
                  'Scheduled recurring reports',
                  '90-day report history',
                  'Custom report templates',
                  'Priority support',
                  'API access',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-emerald-400 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-primary w-full" onClick={() => router.push('/pricing')}>
                Get Started
              </button>
            </div>

            <div className="pricing-card glass-card p-8">
              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-gray-400 text-sm">Unlimited power for large organizations</p>
              </div>
              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited market reports',
                  'Full competitive intelligence suite',
                  'Custom schedules & workflows',
                  'Unlimited report history',
                  'Dedicated account manager',
                  'Custom integrations',
                  'SSO & advanced security',
                  'SLA guarantee',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-gray-300 text-sm">
                    <Check size={16} className="text-emerald-400 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-secondary w-full" onClick={() => router.push('/pricing')}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="relative py-24 px-6 lg:px-12 z-10">
        <div className="cta-content max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4">Get the edge in your inbox.</h2>
          <p className="text-gray-400 text-lg mb-8">
            Weekly signals, market notes, and product updates—no noise.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4"
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <button type="submit" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>

          <p className="text-gray-500 text-xs">Unsubscribe anytime. No spam.</p>
        </div>
      </section>

      <footer ref={footerRef} className="relative py-16 px-6 lg:px-12 border-t border-white/5 z-10">
        <div className="footer-content max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="text-xl font-heading font-bold text-white mb-4 block">
                Quantiva
              </Link>
              <p className="text-gray-400 text-sm">AI-powered market intelligence for modern teams.</p>
            </div>

            <div>
              <h4 className="font-heading font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2">
                {['Features', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href={item === 'Pricing' ? '#pricing' : '#features'} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#docs" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Docs
                  </a>
                </li>
                {['API', 'Blog', 'Support'].map((item) => (
                  <li key={item}>
                    <span className="text-gray-500 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Careers', 'Contact', 'Press'].map((item) => (
                  <li key={item}>
                    <span className="text-gray-500 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <a
                  href="mailto:info@quantiva.world"
                  className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  info@quantiva.world
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500 text-sm">Cookies</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Quantiva. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
