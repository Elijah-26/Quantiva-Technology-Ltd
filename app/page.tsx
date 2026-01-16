'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Target, RefreshCw, Search, TrendingUp, FileText, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

export default function ModernLandingPage() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            top: '60%',
            right: '10%',
            animationDelay: '1s',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
          }}
        />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  MarketIQ
                </span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <a href="#home" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
                <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  How It Works
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => router.push('/signup')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section id="home" className="relative py-20 md:py-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Floating Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8 animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">AI-Powered Market Intelligence</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  Automated Market Research
                </span>
                <br />
                <span className="text-white">
                  That Never Sleeps
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
                Transform your business strategy with <span className="text-blue-400 font-semibold">automated, recurring market insights</span>. 
                Get data-backed competitive intelligence delivered on your schedule.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <button 
                  onClick={() => router.push('/signup')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/50"
                >
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    10K+
                  </div>
                  <div className="text-sm text-gray-400">Reports Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    500+
                  </div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Powerful Intelligence Tools
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to dominate your market
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Search,
                  title: "Automated Research",
                  description: "AI-powered market analysis that runs on autopilot. Get comprehensive insights without lifting a finger.",
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-500/10 to-cyan-500/10"
                },
                {
                  icon: Target,
                  title: "Competitive Intelligence",
                  description: "Track competitors in real-time. Monitor pricing, strategies, and market positioning automatically.",
                  gradient: "from-purple-500 to-pink-500",
                  bgGradient: "from-purple-500/10 to-pink-500/10"
                },
                {
                  icon: Zap,
                  title: "Real-Time Alerts",
                  description: "Instant notifications on market shifts. Never miss a critical opportunity or threat.",
                  gradient: "from-green-500 to-emerald-500",
                  bgGradient: "from-green-500/10 to-emerald-500/10"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all transform hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform`}>
                      <feature.icon className="w-7 h-7" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative py-20 md:py-32 bg-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Three Steps to Market Mastery
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Get started in minutes, not hours
              </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-12">
              {[
                {
                  step: "01",
                  title: "Select Your Market",
                  description: "Choose your target industry and define research parameters with our intuitive interface.",
                  icon: BarChart3,
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  step: "02",
                  title: "Set Your Schedule",
                  description: "Run on-demand or automate with daily, weekly, or monthly research cycles.",
                  icon: RefreshCw,
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  step: "03",
                  title: "Receive Insights",
                  description: "Get actionable intelligence delivered to your dashboard with beautiful visualizations.",
                  icon: TrendingUp,
                  gradient: "from-green-500 to-emerald-500"
                }
              ].map((step, index) => (
                <div key={index} className="group flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:border-white/40 transition-all transform group-hover:scale-110">
                      <span className={`text-3xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                        {step.step}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-3">{step.title}</h3>
                    <p className="text-xl text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                  
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform`}>
                    <step.icon className="w-10 h-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-3xl" />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium">Free 14-day trial • No credit card required</span>
              </div>

              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transform</span> Your Market Research?
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                Join hundreds of businesses making smarter decisions with automated intelligence.
              </p>

              <button 
                onClick={() => router.push('/signup')}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-xl hover:from-blue-500 hover:to-purple-500 transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/50"
              >
                <span className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
        </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MarketIQ
              </span>
            </div>
            <p className="text-gray-400">
              © 2026 MarketIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}