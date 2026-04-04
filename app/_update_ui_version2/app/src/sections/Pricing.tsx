import { Check } from 'lucide-react';

export function Pricing() {
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      price: '49',
      period: '/month',
      features: [
        '5 document generations/month',
        '10 templates',
        'Basic compliance checks',
        'Email support',
        '7-day report history',
      ],
      cta: 'Get Started',
      ctaStyle: 'btn-dark',
      popular: false,
    },
    {
      name: 'Professional',
      description: 'For growing compliance teams',
      price: '149',
      period: '/month',
      features: [
        'Unlimited document generations',
        'All 50+ templates',
        'Advanced compliance scoring',
        'Priority support',
        'API access',
        '5 custom templates',
        '90-day report history',
      ],
      cta: 'Get Started',
      ctaStyle: 'btn-primary',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited everything',
        'All templates + custom',
        'Enterprise compliance suite',
        '24/7 phone & email support',
        'Full API access',
        'Unlimited custom templates',
        'Dedicated account manager',
        'SSO & advanced security',
      ],
      cta: 'Contact Sales',
      ctaStyle: 'btn-dark',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="section relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your team. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card relative ${plan.popular ? 'border-[#5b4cdb]/30' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-[#5b4cdb] text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">£{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="/signup"
                className={`btn w-full ${plan.ctaStyle}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
