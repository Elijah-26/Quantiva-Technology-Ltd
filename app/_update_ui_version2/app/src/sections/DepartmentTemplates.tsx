import { Users, Megaphone, Code, BarChart3, Shield, Scale, HeadphonesIcon, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export function DepartmentTemplates() {
  const departments = [
    {
      icon: Users,
      name: 'Human Resources',
      description: 'Streamline hiring, onboarding, and people management.',
      templates: ['Job Descriptions', 'Offer Letters', 'Employee Handbooks', 'Performance Reviews'],
      docCount: '180+',
    },
    {
      icon: Megaphone,
      name: 'Marketing',
      description: 'Create compelling campaigns and brand materials.',
      templates: ['Marketing Plans', 'Content Calendars', 'Email Campaigns', 'Press Releases'],
      docCount: '220+',
    },
    {
      icon: Code,
      name: 'Engineering',
      description: 'Document technical specs and product requirements.',
      templates: ['Technical Specs', 'API Documentation', 'Product Requirements', 'Release Notes'],
      docCount: '150+',
    },
    {
      icon: BarChart3,
      name: 'Finance',
      description: 'Manage budgets, forecasts, and financial reports.',
      templates: ['Budget Proposals', 'Financial Reports', 'Invoices', 'Cash Flow Analysis'],
      docCount: '120+',
    },
    {
      icon: Shield,
      name: 'Compliance',
      description: 'Maintain regulatory compliance with audit-ready docs.',
      templates: ['Compliance Policies', 'Risk Assessments', 'Audit Reports', 'Training Materials'],
      docCount: '200+',
    },
    {
      icon: Scale,
      name: 'Legal',
      description: 'Generate contracts, agreements, and legal notices.',
      templates: ['Employment Contracts', 'NDAs', 'Terms of Service', 'Privacy Policies'],
      docCount: '90+',
    },
    {
      icon: HeadphonesIcon,
      name: 'Customer Success',
      description: 'Support customers with professional documentation.',
      templates: ['Help Center Articles', 'User Guides', 'FAQ Documents', 'Success Plans'],
      docCount: '110+',
    },
    {
      icon: FileText,
      name: 'Sales',
      description: 'Close more deals with professional proposals.',
      templates: ['Sales Proposals', 'Quote Templates', 'Pitch Decks', 'Case Studies'],
      docCount: '140+',
    },
  ];

  const benefits = [
    'Consistent branding across all departments',
    'Faster document creation with AI assistance',
    'Reduced errors and improved quality',
    'Centralized template management',
    'Version control and audit trails',
    'Collaboration and approval workflows',
  ];

  return (
    <section id="departments" className="section relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Department Solutions</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Empower Every Department
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From HR to Engineering, Marketing to Legal — Quantiva provides tailored 
            templates and AI tools for every team in your organization.
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {departments.map((dept, index) => (
            <div key={index} className="card group hover:border-[#5b4cdb]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center">
                  <dept.icon className="w-5 h-5 text-[#5b4cdb]" />
                </div>
                <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-full">
                  {dept.docCount}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{dept.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{dept.description}</p>

              <div className="space-y-1 mb-4">
                {dept.templates.slice(0, 3).map((template, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {template}
                  </div>
                ))}
                {dept.templates.length > 3 && (
                  <p className="text-xs text-gray-600 pl-5">
                    +{dept.templates.length - 3} more
                  </p>
                )}
              </div>

              <a
                href={`/departments/${dept.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                className="inline-flex items-center gap-1 text-sm text-[#5b4cdb] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                View Templates
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="card">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Unify Your Organization
              </h3>
              <p className="text-gray-400 mb-6">
                Give every department the tools they need to create professional, 
                on-brand documents — all from one centralized platform.
              </p>
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/enterprise" className="btn btn-primary">
                  Contact Sales
                </a>
                <a href="/pricing" className="btn btn-secondary">
                  View Pricing
                </a>
              </div>
            </div>

            <div className="card bg-white/5 text-center">
              <div className="w-16 h-16 mx-auto rounded-lg bg-[#5b4cdb]/20 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-[#5b4cdb]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                Enterprise Plans Available
              </h4>
              <p className="text-gray-400 mb-6">
                Get unlimited access for your entire organization with 
                SSO, advanced security, and dedicated support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
