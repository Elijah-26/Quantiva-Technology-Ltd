import { Search, FileEdit, CheckCircle, Download } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Choose Template',
      description: 'Select from 50+ pre-built templates or create custom documents. Our AI understands FCA, PRA, GDPR, and other major frameworks.',
    },
    {
      number: '02',
      icon: FileEdit,
      title: 'AI Generation',
      description: 'Answer a few simple questions and our AI generates a fully compliant document in minutes, not hours.',
    },
    {
      number: '03',
      icon: CheckCircle,
      title: 'Compliance Check',
      description: 'Built-in guardrails check your document against current regulations and highlight any potential issues.',
    },
    {
      number: '04',
      icon: Download,
      title: 'Export & Deploy',
      description: 'Download in multiple formats or publish directly to your document management system.',
    },
  ];

  return (
    <section className="section relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From Template to Compliance in 4 Steps
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            No complex setup. No steep learning curve. Start generating compliant documents in minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <span className="text-6xl font-bold text-white/5 absolute -top-4 -left-2">
                {step.number}
              </span>
              
              <div className="relative pt-8">
                <div className="w-10 h-10 rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center mb-4 border border-white/10">
                  <step.icon className="w-5 h-5 text-[#5b4cdb]" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { value: '5', unit: 'min', label: 'Average generation time' },
            { value: '99.2', unit: '%', label: 'Compliance accuracy rate' },
            { value: '40', unit: 'h+', label: 'Saved per month' },
          ].map((stat, index) => (
            <div key={index} className="card text-center hover:border-[#5b4cdb]/30 transition-all">
              <p className="text-4xl font-bold text-white mb-1">
                {stat.value}<span className="text-2xl text-[#5b4cdb]">{stat.unit}</span>
              </p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
