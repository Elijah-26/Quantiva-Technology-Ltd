"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, 
  Users, 
  Target, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Briefcase,
  Globe,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const industries = [
  { id: "technology", name: "Technology", icon: "💻" },
  { id: "healthcare", name: "Healthcare", icon: "🏥" },
  { id: "finance", name: "Finance & Banking", icon: "🏦" },
  { id: "retail", name: "Retail & E-commerce", icon: "🛍️" },
  { id: "manufacturing", name: "Manufacturing", icon: "🏭" },
  { id: "education", name: "Education", icon: "🎓" },
  { id: "legal", name: "Legal Services", icon: "⚖️" },
  { id: "consulting", name: "Consulting", icon: "💼" },
  { id: "real-estate", name: "Real Estate", icon: "🏢" },
  { id: "other", name: "Other", icon: "📋" },
]

const companySizes = [
  { id: "1-10", label: "1-10 employees" },
  { id: "11-50", label: "11-50 employees" },
  { id: "51-200", label: "51-200 employees" },
  { id: "201-500", label: "201-500 employees" },
  { id: "501+", label: "501+ employees" },
]

const jurisdictions = [
  { id: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { id: "us", name: "United States", flag: "🇺🇸" },
  { id: "eu", name: "European Union", flag: "🇪🇺" },
  { id: "ca", name: "Canada", flag: "🇨🇦" },
  { id: "au", name: "Australia", flag: "🇦🇺" },
  { id: "sg", name: "Singapore", flag: "🇸🇬" },
]

const useCases = [
  { id: "gdpr", label: "GDPR Compliance" },
  { id: "privacy", label: "Privacy Policies" },
  { id: "terms", label: "Terms of Service" },
  { id: "contracts", label: "Contract Templates" },
  { id: "hr", label: "HR Documents" },
  { id: "security", label: "Security Policies" },
  { id: "research", label: "Academic Research" },
  { id: "other", label: "Other" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    industry: "",
    companySize: "",
    jurisdictions: [] as string[],
    useCases: [] as string[],
    companyName: "",
    website: "",
  })

  const totalSteps = 4

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleJurisdiction = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      jurisdictions: prev.jurisdictions.includes(id)
        ? prev.jurisdictions.filter((j) => j !== id)
        : [...prev.jurisdictions, id],
    }))
  }

  const toggleUseCase = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter((u) => u !== id)
        : [...prev.useCases, id],
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.industry && formData.companySize
      case 2:
        return formData.jurisdictions.length > 0
      case 3:
        return formData.useCases.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="glass-card-strong p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-white font-heading">
                Quantiva
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Let's personalize your experience
            </h1>
            <p className="text-white/60">
              Tell us a bit about your business so we can tailor Quantiva to your needs
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">
                Step {step} of {totalSteps}
              </span>
              <span className="text-sm text-white/50">
                {Math.round((step / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70 mb-3 block flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      What industry are you in?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {industries.map((industry) => (
                        <button
                          key={industry.id}
                          onClick={() => setFormData({ ...formData, industry: industry.id })}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all duration-200",
                            formData.industry === industry.id
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <span className="text-2xl mb-2 block">{industry.icon}</span>
                          <span className="text-white text-sm">{industry.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/70 mb-3 block flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      How many employees does your company have?
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {companySizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setFormData({ ...formData, companySize: size.id })}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all duration-200",
                            formData.companySize === size.id
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <span className="text-white text-sm">{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70 mb-3 block flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Which jurisdictions do you operate in?
                      <span className="text-white/40 text-xs">(Select all that apply)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {jurisdictions.map((jurisdiction) => (
                        <button
                          key={jurisdiction.id}
                          onClick={() => toggleJurisdiction(jurisdiction.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3",
                            formData.jurisdictions.includes(jurisdiction.id)
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <span className="text-2xl">{jurisdiction.flag}</span>
                          <span className="text-white text-sm">{jurisdiction.name}</span>
                          {formData.jurisdictions.includes(jurisdiction.id) && (
                            <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70 mb-3 block flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      What will you use Quantiva for?
                      <span className="text-white/40 text-xs">(Select all that apply)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {useCases.map((useCase) => (
                        <button
                          key={useCase.id}
                          onClick={() => toggleUseCase(useCase.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-3",
                            formData.useCases.includes(useCase.id)
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <span className="text-white text-sm">{useCase.label}</span>
                          {formData.useCases.includes(useCase.id) && (
                            <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70 mb-3 block flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company details
                    </Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="companyName" className="text-white/50 text-sm mb-2 block">
                          Company name (optional)
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Acme Inc."
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-white/50 text-sm mb-2 block">
                          Company website (optional)
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <h4 className="text-white font-medium mb-2">You're all set!</h4>
                    <p className="text-white/60 text-sm">
                      Based on your selections, we'll customize your dashboard with relevant 
                      document templates and compliance resources for your industry.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="glass"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              variant="gradient"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === totalSteps ? (
                <>
                  Complete Setup
                  <Check className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
