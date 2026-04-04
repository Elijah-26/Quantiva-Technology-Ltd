import { Brain, Shield, Zap, Check, ArrowRight } from 'lucide-react';

export function Features() {
  const mainFeatures = [
    {
      icon: Brain,
      title: 'AI Document Generation',
      description: 'Generate compliant policies, procedures, and reports in minutes using advanced AI trained on regulatory frameworks.',
      features: [
        '50+ pre-built templates',
        'FCA/PRA compliant outputs',
        'Custom document training',
        'Multi-language support',
      ],
    },
    {
      icon: Shield,
      title: 'Regulatory Guardrails',
      description: 'Built-in compliance checks ensure every document meets current regulatory standards before publication.',
      features: [
        'Real-time compliance scoring',
        'Automatic regulation updates',
        'Risk assessment integration',
        'Audit trail logging',
      ],
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Automate repetitive compliance tasks and streamline document workflows across your organization.',
      features: [
        'Workflow automation',
        'Approval routing',
        'Version control',
        'Deadline reminders',
      ],
    },
  ];

  return (
    <section id="features" className="section relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need for Compliance
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Quantiva combines AI-powered document generation with built-in regulatory 
            guardrails to transform your compliance operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="card group hover:border-[#5b4cdb]/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-[#5b4cdb]" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-3">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="card">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                More Powerful Capabilities
              </h3>
              <p className="text-gray-400 mb-6">
                Quantiva is packed with features designed to make compliance 
                management effortless and efficient.
              </p>
              <a
                href="/features"
                className="inline-flex items-center gap-2 text-[#5b4cdb] hover:text-[#7c6ae6] transition-colors"
              >
                Explore all features
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: '500+ Templates', desc: 'Pre-built templates' },
                { title: 'Multi-Language', desc: '50+ languages' },
                { title: 'Enterprise Security', desc: 'SOC 2, GDPR, ISO' },
              ].map((item, index) => (
                <div key={index} className="card bg-white/5 text-center">
                  <p className="text-white font-semibold mb-1">{item.title}</p>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
