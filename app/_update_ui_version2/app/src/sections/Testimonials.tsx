import { Quote, Star } from 'lucide-react';
import { AnimatedCounter } from '../components/AnimatedCounter';

export function Testimonials() {
  const testimonials = [
    {
      quote: "Quantiva has transformed our compliance operations. What used to take days now takes minutes, and the quality is consistently excellent.",
      author: "Sarah Mitchell",
      role: "Head of Compliance",
      company: "Metro Bank",
      rating: 5,
      image: "S",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      quote: "The regulatory guardrails give us confidence that every document meets FCA standards. It's like having a compliance expert built into the software.",
      author: "James Chen",
      role: "Risk Director",
      company: "Atom Bank",
      rating: 5,
      image: "J",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      quote: "We've reduced our compliance documentation costs by 70% while improving accuracy. Quantiva pays for itself many times over.",
      author: "Emma Thompson",
      role: "COO",
      company: "Starling Bank",
      rating: 5,
      image: "E",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const stats = [
    { value: 500, suffix: '+', label: 'Active Users' },
    { value: 50000, suffix: '+', label: 'Documents Generated' },
    { value: 99.2, suffix: '%', label: 'Compliance Rate' },
    { value: 4.9, suffix: '/5', label: 'Customer Rating' },
  ];

  return (
    <section id="testimonials" className="section relative bg-[#0a0a0f]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[200px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
            <span className="text-sm font-medium text-green-400">Testimonials</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Loved by Compliance{' '}
            <span className="text-gradient">Teams</span>
          </h2>
          <p className="text-lg text-gray-400">
            See what industry leaders say about their experience with Quantiva.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="glass rounded-2xl p-6 text-center border border-white/10 hover:border-cyan-500/30 transition-all">
              <p className="text-4xl lg:text-5xl font-bold text-gradient mb-2">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass rounded-3xl p-8 border border-white/10 hover:border-cyan-500/30 transition-all duration-500 group"
            >
              {/* Quote Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                <Quote className="w-7 h-7 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{testimonial.image}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-sm text-cyan-400">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
