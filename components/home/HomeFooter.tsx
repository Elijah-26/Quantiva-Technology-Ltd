'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { Twitter, Linkedin, Github } from 'lucide-react'

const footerLinks = {
  Solutions: [
    { name: 'Infinity Library', href: '#infinity-library' },
    { name: 'Academic Research', href: '#academic-research' },
    { name: 'Business Solutions', href: '#business-solutions' },
    { name: 'Department Templates', href: '#departments' },
    { name: 'Pricing', href: '#pricing' },
  ],
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Templates', href: null },
    { name: 'Integrations', href: null },
    { name: 'API', href: null },
    { name: 'Security', href: null },
  ],
  Company: [
    { name: 'About', href: null },
    { name: 'Blog', href: null },
    { name: 'Careers', href: null },
    { name: 'Contact', href: 'mailto:info@quantiva.world' as const },
  ],
  Legal: [
    { name: 'Privacy', href: '/privacy' as const },
    { name: 'Terms', href: '/terms' as const },
    { name: 'Security', href: null },
  ],
}

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
]

export const HomeFooter = forwardRef<HTMLElement>(function HomeFooter(_, ref) {
  return (
    <footer ref={ref} className="relative bg-[#0a0a0f] border-t border-white/5 z-10">
      <div className="footer-content container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/quantiva.png" alt="" className="w-8 h-8 object-contain rounded-lg" width={32} height={32} />
              <span className="font-semibold text-lg text-white">Quantiva</span>
            </Link>

            <p className="text-gray-500 text-sm mb-6">
              The Infinity Library of AI-powered documents. From academic research to enterprise compliance — generate
              any document with AI.
            </p>

            <p className="text-sm text-gray-400 mb-6">
              <a
                href="mailto:info@quantiva.world"
                className="text-gray-300 hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                info@quantiva.world
              </a>
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-medium text-white mb-4 text-sm">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    {link.href ? (
                      link.href.startsWith('#') ? (
                        <a href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                          {link.name}
                        </a>
                      ) : link.href.startsWith('mailto:') ? (
                        <a href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                          {link.name}
                        </a>
                      ) : (
                        <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                          {link.name}
                        </Link>
                      )
                    ) : (
                      <span className="text-sm text-gray-600">{link.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Quantiva. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
})
