import { Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
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
      { name: 'Templates', href: '/templates' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'API', href: '/api' },
      { name: 'Security', href: '/security' },
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    Legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Security', href: '/security' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/quantiva', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/quantiva', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/quantiva', label: 'GitHub' },
  ];

  return (
    <footer className="relative bg-[#0a0a0f] border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5b4cdb] to-[#7c6ae6] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                  <path d="M12 22a10 10 0 0 0 10-10" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <span className="font-semibold text-lg text-white">Quantiva</span>
            </a>

            <p className="text-gray-500 text-sm mb-6">
              The Infinity Library of AI-powered documents. From academic research 
              to enterprise compliance — generate any document with AI.
            </p>

            {/* Social Links */}
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

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-medium text-white mb-4 text-sm">{category}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Quantiva. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
