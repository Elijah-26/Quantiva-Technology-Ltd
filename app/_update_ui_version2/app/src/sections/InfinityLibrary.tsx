import { Search, Briefcase, GraduationCap, Shield, BarChart3, Users, Code, Megaphone, Scale, ArrowRight } from 'lucide-react';

export function InfinityLibrary() {
  const categories = [
    {
      icon: GraduationCap,
      name: 'Academic Research',
      count: '2,400+',
      description: 'Research papers, literature reviews, thesis documents',
    },
    {
      icon: Briefcase,
      name: 'Business',
      count: '1,800+',
      description: 'Proposals, plans, reports, executive summaries',
    },
    {
      icon: Shield,
      name: 'Compliance',
      count: '3,200+',
      description: 'Policies, procedures, regulatory documents',
    },
    {
      icon: Megaphone,
      name: 'Marketing',
      count: '1,500+',
      description: 'Campaigns, content, social media, emails',
    },
    {
      icon: Users,
      name: 'HR & People',
      count: '1,200+',
      description: 'Job descriptions, handbooks, onboarding',
    },
    {
      icon: BarChart3,
      name: 'Finance',
      count: '900+',
      description: 'Budgets, forecasts, financial reports',
    },
    {
      icon: Code,
      name: 'Technical',
      count: '1,100+',
      description: 'Documentation, specs, API guides',
    },
    {
      icon: Scale,
      name: 'Legal',
      count: '800+',
      description: 'Contracts, agreements, legal notices',
    },
  ];

  return (
    <section id="infinity-library" className="section relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Infinity Library</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            One Library. Infinite Possibilities.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Access 500+ AI-powered document templates across 8 categories. 
            From academic research to enterprise compliance — find exactly what you need.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search templates, documents, categories..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5b4cdb]/50 transition-colors"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <div
              key={index}
              className="card group hover:border-[#5b4cdb]/30 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-[#5b4cdb]" />
                </div>
                <span className="text-xs px-2 py-1 bg-white/5 text-gray-400 rounded-full">
                  {category.count}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{category.description}</p>

              <div className="flex items-center gap-1 text-sm text-[#5b4cdb] opacity-0 group-hover:opacity-100 transition-opacity">
                Explore
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
