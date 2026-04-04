import { Search, FileText, Quote, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';

export function AcademicResearch() {
  const features = [
    {
      icon: Search,
      title: 'Literature Review Assistant',
      description: 'AI-powered analysis of research papers with automatic summarization and citation management.',
    },
    {
      icon: FileText,
      title: 'Research Paper Generator',
      description: 'Generate well-structured academic papers with proper formatting and references.',
    },
    {
      icon: Quote,
      title: 'Citation & Referencing',
      description: 'Automatic APA, MLA, Chicago, and Harvard style citations and bibliographies.',
    },
    {
      icon: Lightbulb,
      title: 'Research Ideation',
      description: 'Get AI-suggested research topics, hypotheses, and methodology recommendations.',
    },
  ];

  const benefits = [
    'Save 40+ hours on research documentation',
    'Ensure academic integrity with proper citations',
    'Generate plagiarism-free original content',
    'Access 2,400+ academic templates',
    'Get AI feedback on research quality',
    'Export in multiple academic formats',
  ];

  return (
    <section id="academic-research" className="section relative bg-[#0a0a0f]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-4">Academic Research AI</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Supercharge Your Research
            </h2>
            <p className="text-gray-400 mb-8">
              From literature reviews to thesis writing — Quantiva's Academic Research AI 
              helps students, researchers, and academics produce high-quality work faster.
            </p>
            <a href="/academic" className="btn btn-primary">
              Try Academic AI
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="card group hover:border-[#5b4cdb]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#5b4cdb]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#5b4cdb]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 card">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Why Researchers Choose Quantiva
              </h3>
              <p className="text-gray-400 mb-6">
                Join thousands of students, PhD candidates, and research professionals 
                who trust Quantiva for their academic documentation needs.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card bg-white/5">
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">
                "Quantiva's Academic Research AI helped me complete my literature review in 
                days instead of weeks. The citation management alone saved me countless hours."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#5b4cdb]/20 flex items-center justify-center">
                  <span className="text-white font-bold">DR</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Dr. Rebecca Chen</p>
                  <p className="text-sm text-gray-500">PhD Candidate, Oxford University</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
