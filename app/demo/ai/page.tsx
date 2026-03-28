"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  Shield, 
  FileText, 
  Zap, 
  Globe, 
  Lock, 
  Sparkles,
  ArrowRight,
  Check,
  Menu,
  X,
  ChevronRight,
  Building2,
  GraduationCap,
  Chrome,
  Search,
  Download,
  Edit3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Research", href: "#research" },
  ]

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-navy-900/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/demo/ai" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white font-heading">
              Quantiva
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="/demo/ai/auth/signin"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <Button variant="gradient" size="sm" asChild>
              <a href="/demo/ai/auth/signup">Get Started</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="lg:hidden bg-navy-900/95 backdrop-blur-xl border-b border-white/5"
        >
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-white/70 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <a
                href="/demo/ai/auth/signin"
                className="block text-white/70 hover:text-white transition-colors py-2"
              >
                Sign In
              </a>
              <Button variant="gradient" className="w-full" asChild>
                <a href="/demo/ai/auth/signup">Get Started</a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="info" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Regulatory Intelligence
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 font-heading leading-tight"
        >
          Regulatory Documents
          <br />
          <span className="text-gradient">Powered by AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
        >
          Generate, customize, and manage regulatory documents with cutting-edge AI. 
          Stay compliant across jurisdictions with intelligent document templates.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="gradient" size="lg" className="w-full sm:w-auto" asChild>
            <a href="/demo/ai/auth/signup">
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
          <Button variant="glass" size="lg" className="w-full sm:w-auto" asChild>
            <a href="#features">
              Explore Features
            </a>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { value: "10,000+", label: "Document Templates" },
            { value: "50+", label: "Jurisdictions" },
            { value: "20+", label: "Industries" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "AI Document Generation",
      description: "Generate customized regulatory documents in minutes using advanced AI. Tailored to your industry, jurisdiction, and specific requirements.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Globe,
      title: "Multi-Jurisdiction Support",
      description: "Access document templates compliant with regulations across 50+ jurisdictions. From GDPR to CCPA, we've got you covered.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Zap,
      title: "Real-Time Updates",
      description: "Stay ahead of regulatory changes with AI-powered monitoring. Get instant notifications when regulations affecting your business change.",
      color: "from-amber-500 to-amber-600",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-grade encryption and security measures protect your sensitive documents. SOC 2 Type II certified infrastructure.",
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find the exact document you need with AI-powered semantic search. Natural language queries deliver precise results.",
      color: "from-violet-500 to-violet-600",
    },
    {
      icon: Edit3,
      title: "Collaborative Editing",
      description: "Work together with your team on documents in real-time. Track changes, add comments, and maintain version control.",
      color: "from-cyan-500 to-cyan-600",
    },
  ]

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Everything You Need for
            <br />
            <span className="text-gradient">Regulatory Compliance</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Powerful tools designed to streamline your compliance workflow and keep your business protected.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="glass-card p-6 h-full hover:bg-white/[0.06] transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Select Your Industry",
      description: "Choose from 20+ industries and 100+ subcategories. Our AI understands the specific regulatory requirements for your sector.",
      icon: Building2,
    },
    {
      number: "02",
      title: "Pick Your Jurisdiction",
      description: "Select the jurisdictions where you operate. We support 50+ regions with localized compliance requirements.",
      icon: Globe,
    },
    {
      number: "03",
      title: "Generate Documents",
      description: "Our AI generates customized documents tailored to your specific needs. Edit, download, and deploy in minutes.",
      icon: Zap,
    },
  ]

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label">How It Works</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Three Steps to
            <br />
            <span className="text-gradient">Compliance Mastery</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="glass-card-strong p-8 h-full">
                <div className="text-6xl font-bold text-white/5 absolute top-4 right-4 font-heading">
                  {step.number}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ChevronRight className="w-8 h-8 text-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pricing Section
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small projects",
      price: { monthly: 0, annual: 0 },
      features: [
        "5 AI generations/month",
        "10 downloads/month",
        "Access to free templates",
        "Basic search",
        "Email support",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Professional",
      description: "For growing businesses and teams",
      price: { monthly: 49, annual: 39 },
      features: [
        "50 AI generations/month",
        "100 downloads/month",
        "All Pro templates",
        "Advanced search & filters",
        "Priority support",
        "API access",
        "Team collaboration",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Business",
      description: "For organizations with advanced needs",
      price: { monthly: 149, annual: 119 },
      features: [
        "Unlimited AI generations",
        "Unlimited downloads",
        "All Business templates",
        "Custom document requests",
        "Dedicated account manager",
        "SSO & advanced security",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom requirements",
      price: { monthly: null, annual: null },
      features: [
        "Everything in Business",
        "Custom AI model training",
        "On-premise deployment option",
        "SLA guarantees",
        "24/7 phone support",
        "Custom contract terms",
        "White-label options",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ]

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="section-label">Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Simple, Transparent
            <br />
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn(
              "text-sm transition-colors",
              billingCycle === "monthly" ? "text-white" : "text-white/50"
            )}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative w-14 h-7 rounded-full bg-white/10 transition-colors"
            >
              <div className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-indigo-500 transition-all duration-300",
                billingCycle === "annual" ? "left-8" : "left-1"
              )} />
            </button>
            <span className={cn(
              "text-sm transition-colors",
              billingCycle === "annual" ? "text-white" : "text-white/50"
            )}>
              Annual
              <span className="ml-2 text-xs text-emerald-400">Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={cn(
                "h-full rounded-2xl p-6 transition-all duration-300",
                plan.highlighted
                  ? "bg-gradient-to-b from-indigo-500/20 to-indigo-600/10 border-2 border-indigo-500/50"
                  : "glass-card hover:bg-white/[0.06]"
              )}>
                {plan.highlighted && (
                  <Badge className="mb-4 bg-indigo-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-xl font-semibold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="mb-6">
                  {plan.price.monthly !== null ? (
                    <>
                      <span className="text-4xl font-bold text-white">
                        £{billingCycle === "monthly" ? plan.price.monthly : plan.price.annual}
                      </span>
                      <span className="text-white/50">/month</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-white">Custom</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlighted ? "gradient" : "glass"}
                  className="w-full"
                  asChild
                >
                  <a href="/demo/ai/auth/signup">{plan.cta}</a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Research Section
function ResearchSection() {
  return (
    <section id="research" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-label">Academic Research</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
              Research Template
              <br />
              <span className="text-gradient">Module</span>
            </h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Accelerate your academic research with AI-powered templates for dissertations, 
              theses, and research papers. Structured guidance for every stage of your research journey.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Dissertation & thesis templates",
                "Research proposal frameworks",
                "Literature review structures",
                "Methodology guidance",
                "Citation management",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-white/70">{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="gradient" asChild>
              <a href="/demo/ai/auth/signup">
                <GraduationCap className="mr-2 w-4 h-4" />
                Start Researching
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="glass-card-strong p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Research Assistant</h3>
                  <p className="text-white/50 text-sm">AI-powered academic guidance</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Template Selected", value: "PhD Dissertation - Computer Science" },
                  { label: "Research Field", value: "Artificial Intelligence & Machine Learning" },
                  { label: "Current Section", value: "Literature Review" },
                  { label: "Progress", value: "45% Complete" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/50 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-white/5">
                <p className="text-white/70 text-sm italic">
                  "The AI research templates saved me weeks of work. The structured approach 
                  helped me organize my thoughts and produce a comprehensive dissertation."
                </p>
                <p className="text-white/50 text-xs mt-2">
                  — Dr. Sarah Chen, PhD Candidate
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Extension Section
function ExtensionSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-strong p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Chrome className="w-6 h-6 text-indigo-400" />
                <span className="text-indigo-400 font-medium">Browser Extension</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-heading">
                Capture & Generate
                <br />
                <span className="text-gradient">On the Go</span>
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                Our Chrome extension lets you capture web content and instantly generate 
                relevant regulatory documents. Research regulations, capture compliance 
                requirements, and create documents without leaving your browser.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gradient" asChild>
                  <a href="#">
                    <Chrome className="mr-2 w-4 h-4" />
                    Add to Chrome
                  </a>
                </Button>
                <Button variant="glass" asChild>
                  <a href="#">Learn More</a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <div className="bg-navy-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-5/6" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <div className="glass-card p-4 w-64">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-indigo-400" />
                      <span className="text-white font-medium text-sm">Quantiva AI</span>
                    </div>
                    <p className="text-white/60 text-xs mb-3">
                      Generate a GDPR compliance document based on this page?
                    </p>
                    <div className="flex gap-2">
                      <Button variant="gradient" size="sm" className="flex-1 text-xs">
                        Generate
                      </Button>
                      <Button variant="glass" size="sm" className="text-xs">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            Ready to Transform Your
            <br />
            <span className="text-gradient">Compliance Workflow?</span>
          </h2>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using Quantiva AI to streamline their 
            regulatory compliance. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gradient" size="lg" asChild>
              <a href="/demo/ai/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <a href="/demo/ai/auth/signin">Sign In</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Templates", "API", "Security"],
    Company: ["About", "Blog", "Careers", "Press", "Partners"],
    Resources: ["Documentation", "Help Center", "Community", "Templates", "Guides"],
    Legal: ["Privacy", "Terms", "Cookies", "Licenses", "Compliance"],
  }

  return (
    <footer className="border-t border-white/5 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <a href="/demo" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white font-heading">
                Quantiva
              </span>
            </a>
            <p className="text-white/50 text-sm mb-4 max-w-xs">
              AI-powered regulatory document intelligence platform. 
              Generate, customize, and manage compliance documents with ease.
            </p>
            <p className="text-white/40 text-sm">
              Contact: <a href="mailto:info@quantiva.world" className="text-indigo-400 hover:text-indigo-300">info@quantiva.world</a>
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-medium mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Quantiva AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function LandingPage() {
  return (
    <main className="relative z-10">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <ResearchSection />
      <ExtensionSection />
      <CTASection />
      <Footer />
    </main>
  )
}
