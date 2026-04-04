import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'FCA Registered',
      description: 'Fully compliant with FCA regulations',
    },
    {
      icon: Lock,
      title: 'SOC 2 Type II',
      description: 'Enterprise-grade security',
    },
    {
      icon: Award,
      title: 'GDPR Compliant',
      description: 'EU data protection standards',
    },
    {
      icon: CheckCircle,
      title: 'ISO 27001',
      description: 'Information security certified',
    },
  ];

  const clients = [
    'Barclays',
    'HSBC',
    'Lloyds',
    'NatWest',
    'Santander',
    'Standard Chartered',
  ];

  return (
    <section className="relative py-16 bg-[#0a0a0f] border-y border-white/5">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Compliance Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group relative glass rounded-2xl p-6 border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all">
                  <badge.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{badge.title}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Client Logos */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest font-medium">
            Trusted by leading financial institutions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {clients.map((client, index) => (
              <div
                key={index}
                className="text-xl md:text-2xl font-bold text-gray-700 hover:text-cyan-400 transition-colors cursor-default"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
