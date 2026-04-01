"use client"

import { useState } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Sparkles,
  FileText,
  Globe,
  Building2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Download,
  Copy,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const documentTypes = [
  { id: "privacy", name: "Privacy Policy", icon: "🔒", description: "GDPR, CCPA compliant privacy policies" },
  { id: "terms", name: "Terms of Service", icon: "📋", description: "Terms and conditions for your business" },
  { id: "contract", name: "Contract", icon: "✍️", description: "Employment, service, and partnership contracts" },
  { id: "compliance", name: "Compliance Doc", icon: "✅", description: "Regulatory compliance documentation" },
  { id: "hr", name: "HR Document", icon: "👥", description: "Employee handbooks and HR policies" },
  { id: "custom", name: "Custom Document", icon: "⚡", description: "AI-generated custom document" },
]

const industries = [
  { id: "saas", name: "SaaS / Technology" },
  { id: "ecommerce", name: "E-commerce" },
  { id: "healthcare", name: "Healthcare" },
  { id: "finance", name: "Finance / Fintech" },
  { id: "education", name: "Education" },
  { id: "consulting", name: "Consulting" },
  { id: "retail", name: "Retail" },
  { id: "other", name: "Other" },
]

const jurisdictions = [
  { id: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { id: "us", name: "United States", flag: "🇺🇸" },
  { id: "eu", name: "European Union", flag: "🇪🇺" },
  { id: "ca", name: "Canada", flag: "🇨🇦" },
  { id: "au", name: "Australia", flag: "🇦🇺" },
  { id: "global", name: "Global / Multi-jurisdiction", flag: "🌍" },
]

export default function GeneratePage() {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [formData, setFormData] = useState({
    documentType: "",
    industry: "",
    jurisdiction: "",
    companyName: "",
    website: "",
    description: "",
    additionalRequirements: "",
  })

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleGenerate()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGeneratedText("")
    try {
      const res = await fetch("/api/generation-jobs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: formData.documentType,
          industry: formData.industry,
          jurisdiction: formData.jurisdiction,
          companyName: formData.companyName,
          website: formData.website,
          description: formData.description,
          additionalRequirements: formData.additionalRequirements,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 403 && data.code === "GEN_LIMIT") {
          toast.error(data.error || "Plan limit reached")
        } else {
          toast.error(data.error || "Generation failed")
        }
        setIsGenerating(false)
        return
      }
      const text = data.job?.result_text || data.job?.error_message || ""
      if (data.job?.status === "failed") {
        toast.error(text || "Generation failed")
        setIsGenerating(false)
        return
      }
      setGeneratedText(text)
      setIsComplete(true)
    } catch {
      toast.error("Network error")
    } finally {
      setIsGenerating(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.documentType
      case 2:
        return formData.industry && formData.jurisdiction
      case 3:
        return formData.companyName
      case 4:
        return true
      default:
        return false
    }
  }

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Document Generated!</h1>
          <p className="text-white/60">
            Your document has been successfully generated and saved to your workspace.
          </p>
        </motion.div>

        <Card className="glass-card border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {documentTypes.find((t) => t.id === formData.documentType)?.name}
                </h3>
                <p className="text-white/50 text-sm">Generated just now</p>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="p-4 rounded-xl bg-white/5 mb-4 max-h-64 overflow-y-auto">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {generatedText ||
                  `${formData.companyName} — draft will appear here after generation (stored in Supabase).`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="gradient" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="glass">
                <Copy className="w-4 h-4 mr-2" />
                Copy Text
              </Button>
              <Button variant="glass" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Generating your document...</h2>
          <p className="text-white/60">
            Our AI is crafting a customized document tailored to your requirements.
            This usually takes about 30 seconds.
          </p>
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">AI Document Generator</h1>
        <p className="text-white/60">
          Answer a few questions and let our AI create a customized document for you.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
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
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white/70 mb-4 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    What type of document do you need?
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {documentTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, documentType: type.id })}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all duration-200",
                          formData.documentType === type.id
                            ? "border-indigo-500 bg-indigo-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <span className="text-2xl mb-2 block">{type.icon}</span>
                        <span className="text-white font-medium block">{type.name}</span>
                        <span className="text-white/50 text-sm">{type.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white/70 mb-4 block flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    What industry are you in?
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry.id}
                        onClick={() => setFormData({ ...formData, industry: industry.id })}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-200",
                          formData.industry === industry.id
                            ? "border-indigo-500 bg-indigo-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <span className="text-white text-sm">{industry.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white/70 mb-4 block flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Which jurisdiction applies?
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {jurisdictions.map((jurisdiction) => (
                      <button
                        key={jurisdiction.id}
                        onClick={() => setFormData({ ...formData, jurisdiction: jurisdiction.id })}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3",
                          formData.jurisdiction === jurisdiction.id
                            ? "border-indigo-500 bg-indigo-500/20"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <span className="text-xl">{jurisdiction.flag}</span>
                        <span className="text-white text-sm">{jurisdiction.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="companyName" className="text-white/70 mb-2 block">
                    Company Name
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
                  <Label htmlFor="website" className="text-white/70 mb-2 block">
                    Website (optional)
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

                <div>
                  <Label htmlFor="description" className="text-white/70 mb-2 block">
                    Briefly describe your business (optional)
                  </Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder="We provide cloud-based project management software for small businesses..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="requirements" className="text-white/70 mb-2 block">
                    Any specific requirements? (optional)
                  </Label>
                  <textarea
                    id="requirements"
                    rows={4}
                    placeholder="e.g., Include specific clauses, mention particular services, comply with specific regulations..."
                    value={formData.additionalRequirements}
                    onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <h4 className="text-white font-medium mb-2">Ready to generate!</h4>
                  <p className="text-white/60 text-sm">
                    Our AI will create a customized{" "}
                    {documentTypes.find((t) => t.id === formData.documentType)?.name.toLowerCase()} for{" "}
                    {formData.companyName} based on your inputs. The document will be tailored for the{" "}
                    {industries.find((i) => i.id === formData.industry)?.name.toLowerCase()} industry and compliant with{" "}
                    {jurisdictions.find((j) => j.id === formData.jurisdiction)?.name} regulations.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
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
                disabled={!canProceed()}
              >
                {step === totalSteps ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Document
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
