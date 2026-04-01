"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
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
  { id: "privacy", name: "Privacy Policy", icon: "🔒", description: "GDPR, CCPA-oriented privacy policies (draft)" },
  { id: "dpa", name: "Data Processing Agreement (DPA)", icon: "📑", description: "Processor / controller data processing terms" },
  { id: "terms", name: "Terms of Service", icon: "📋", description: "Terms and conditions for your business" },
  { id: "contract", name: "Contract", icon: "✍️", description: "Employment, service, and partnership contracts" },
  { id: "compliance", name: "Compliance Doc", icon: "✅", description: "Regulatory compliance documentation" },
  { id: "hr", name: "HR Document", icon: "👥", description: "Employee handbooks and HR policies" },
  { id: "research_proposal", name: "Research proposal", icon: "🎓", description: "Academic / PhD proposal structure" },
  { id: "dissertation_outline", name: "Dissertation outline", icon: "📚", description: "Thesis chapter scaffolding" },
  { id: "research_ethics", name: "Research ethics statement", icon: "⚖️", description: "Ethics and compliance for human subjects" },
  { id: "academic_paper", name: "Academic paper scaffold", icon: "📄", description: "IMRaD-style outline and headings" },
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

const ACADEMIC_IDS = new Set(["research_proposal", "dissertation_outline", "research_ethics", "academic_paper"])

export function GenerateWizard() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [workspaceItemId, setWorkspaceItemId] = useState<string | null>(null)
  const [appliedQuery, setAppliedQuery] = useState(false)
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

  const applySearchParams = useCallback(() => {
    const type = searchParams.get("type") || searchParams.get("documentType") || ""
    const jurisdiction = searchParams.get("jurisdiction") || ""
    const industry = searchParams.get("industry") || ""
    if (!type && !jurisdiction && !industry) return
    setFormData((prev) => ({
      ...prev,
      documentType: documentTypes.some((t) => t.id === type) ? type : prev.documentType,
      jurisdiction: jurisdictions.some((j) => j.id === jurisdiction) ? jurisdiction : prev.jurisdiction,
      industry: industries.some((i) => i.id === industry) ? industry : prev.industry,
    }))
    if (documentTypes.some((t) => t.id === type)) {
      setStep(2)
    }
  }, [searchParams])

  useEffect(() => {
    if (appliedQuery) return
    applySearchParams()
    setAppliedQuery(true)
  }, [appliedQuery, applySearchParams])

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
    setWorkspaceItemId(null)
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
      setWorkspaceItemId(typeof data.workspaceItemId === "string" ? data.workspaceItemId : null)
      setIsComplete(true)
      if (data.workspaceItemId) {
        toast.success("Saved a copy to your workspace")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFile = (ext: "md" | "txt") => {
    if (!generatedText) return
    const typeName = documentTypes.find((t) => t.id === formData.documentType)?.name || "document"
    const base = `${typeName}-${formData.companyName}`.replace(/[^\w\-]+/g, "_").slice(0, 80)
    const blob = new Blob([generatedText], { type: ext === "md" ? "text/markdown" : "text/plain" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${base || "quantiva-draft"}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copyText = async () => {
    if (!generatedText) return
    try {
      await navigator.clipboard.writeText(generatedText)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Could not copy")
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
    const wsPath =
      typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")
        ? "/dashboard/workspace"
        : "/demo/ai/dashboard/workspace"
    const itemPath = workspaceItemId ? `${wsPath}/${workspaceItemId}` : wsPath

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
          <h1 className="text-3xl font-bold text-white mb-2">Document generated</h1>
          <p className="text-white/60">
            {workspaceItemId
              ? "A draft was saved to your workspace. Download or copy below. This is not legal advice—have counsel review before use."
              : "Download or copy your draft below. If workspace save failed, your job is still stored under AI Generate history."}
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
            <div className="flex flex-wrap gap-2">
              <Button variant="gradient" className="flex-1 min-w-[120px]" type="button" onClick={() => downloadFile("md")}>
                <Download className="w-4 h-4 mr-2" />
                Download .md
              </Button>
              <Button variant="glass" className="flex-1 min-w-[120px]" type="button" onClick={() => downloadFile("txt")}>
                <Download className="w-4 h-4 mr-2" />
                Download .txt
              </Button>
              <Button variant="glass" type="button" onClick={copyText}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="glass" type="button" asChild>
                <a href={itemPath}>Workspace</a>
              </Button>
              <Button variant="glass" type="button" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Start over
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

  const isAcademic = ACADEMIC_IDS.has(formData.documentType)

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">AI Document Generator</h1>
        <p className="text-white/60">
          {isAcademic
            ? "Structure academic drafts and outlines. Verify requirements with your institution."
            : "Answer a few questions and let our AI create a customized compliance-oriented draft."}
        </p>
      </motion.div>

      <p className="text-amber-200/80 text-xs text-center mb-6 px-2">
        Outputs are AI drafts only—not legal advice. Review with qualified counsel before reliance, especially for GDPR,
        DORA, or regulated industries.
      </p>

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
                        type="button"
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
                    {isAcademic ? "Field or programme" : "What industry are you in?"}
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry.id}
                        type="button"
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
                    {isAcademic ? "Regulatory or ethics context" : "Which jurisdiction applies?"}
                  </Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {jurisdictions.map((jurisdiction) => (
                      <button
                        key={jurisdiction.id}
                        type="button"
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
                    {isAcademic ? "Institution or project name" : "Company Name"}
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={isAcademic ? "University of … / Project title" : "Acme Inc."}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-white/70 mb-2 block">
                    {isAcademic ? "Lab or project URL (optional)" : "Website (optional)"}
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
                    {isAcademic ? "Research topic summary" : "Briefly describe your business (optional)"}
                  </Label>
                  <textarea
                    id="description"
                    rows={3}
                    placeholder={
                      isAcademic
                        ? "Research question, methods, population…"
                        : "We provide cloud-based project management software for small businesses..."
                    }
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
                    {isAcademic
                      ? "Supervisor or committee requirements (optional)"
                      : "Any specific requirements? (optional)"}
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
                    Our AI will create a structured draft for{" "}
                    {documentTypes.find((t) => t.id === formData.documentType)?.name.toLowerCase()} for{" "}
                    {formData.companyName}
                    {!isAcademic && (
                      <>
                        {" "}
                        based on your inputs, tailored for{" "}
                        {industries.find((i) => i.id === formData.industry)?.name.toLowerCase()} and{" "}
                        {jurisdictions.find((j) => j.id === formData.jurisdiction)?.name} context.
                      </>
                    )}
                    {isAcademic && "."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button variant="glass" type="button" onClick={handleBack} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button variant="gradient" type="button" onClick={handleNext} disabled={!canProceed()}>
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
