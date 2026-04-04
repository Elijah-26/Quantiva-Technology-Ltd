'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export interface HomeNavigationProps {
  scrolled: boolean
  onGetStarted: () => void
}

const navLinks = [
  { name: 'Library', href: '#infinity-library' },
  { name: 'Academic', href: '#academic-research' },
  { name: 'Business', href: '#business-solutions' },
  { name: 'Departments', href: '#departments' },
  { name: 'Pricing', href: '#pricing' },
]

export function HomeNavigation({ scrolled, onGetStarted }: HomeNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/quantiva.png" alt="" className="w-8 h-8 object-contain rounded-lg" width={32} height={32} />
            <span className="font-semibold text-xl text-white">Quantiva</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <button type="button" className="btn btn-primary text-sm" onClick={onGetStarted}>
              Get Started
            </button>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-4 space-y-1 border-t border-white/5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-4 py-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 px-4 space-y-3">
              <Link
                href="/login"
                className="block text-gray-400 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <button
                type="button"
                className="btn btn-primary w-full text-center"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onGetStarted()
                }}
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
