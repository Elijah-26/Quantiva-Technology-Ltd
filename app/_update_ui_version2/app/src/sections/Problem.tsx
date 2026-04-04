import { AlertTriangle, Clock, FileX, TrendingDown } from 'lucide-react';
import { AnimatedCounter } from '../components/AnimatedCounter';

export function Problem() {
  const problems = [
    {
      icon: Clock,
      title: 'Time-Consuming',
      description: 'Compliance teams spend countless hours on manual document creation and reviews.',
      stat: 40,
      suffix: '+',
      statLabel: 'Hours/Month',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: FileX,
      title: 'Inconsistent',
      description: 'Documents vary in quality and compliance adherence across departments.',
      stat: 67,
      suffix: '%',
      statLabel: 'Have Issues',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: AlertTriangle,
      title: 'Ever-Changing',
      description: 'Keeping up with evolving regulations is overwhelming and error-prone.',
      stat: 300,
      suffix: '+',
      statLabel: 'Changes/Year',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: TrendingDown,
      title: 'Expensive',
      description: 'Manual processes and consultants drive compliance costs sky-high.',
      stat: 150,
      prefix: '£',
      suffix: 'K',
      statLabel: 'Annual Cost',
      color: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <section id="problem" className="section relative bg-[#0a0a0f]">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">The Challenge</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Regulatory Compliance is{' '}
            <span className="text-red-400">Broken</span>
          </h2>
          <p className="text-lg text-gray-400">
            Financial institutions face mounting pressure to maintain compliance while controlling costs. 
            Traditional approaches are no longer sustainable.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group relative glass rounded-3xl p-8 border border-white/10 hover:border-red-500/30 transition-all duration-500 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${problem.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${problem.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <problem.icon className="w-8 h-8 text-white" />
              </div>

              {/* Stat */}
              <div className="relative mb-6">
                <span className="text-5xl font-bold text-white">
                  <AnimatedCounter 
                    end={problem.stat} 
                    prefix={problem.prefix}
                    suffix={problem.suffix}
                  />
                </span>
                <p className="text-sm text-gray-500 mt-1">{problem.statLabel}</p>
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-bold text-white mb-3">
                {problem.title}
              </h3>
              <p className="relative text-gray-400 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Sound familiar? You are not alone.
          </p>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors group"
          >
            See how Quantiva solves these challenges
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
