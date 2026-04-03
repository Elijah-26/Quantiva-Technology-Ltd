"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  Sparkles,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Download,
  Copy,
  RefreshCw,
  Lock,
  FileStack,
  ScrollText,
  Handshake,
  BadgeCheck,
  Users,
  IdCard,
  Scale,
  Shield,
  Mail,
  Zap,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  DOCUMENT_CARDS,
  buildLegacyApiFields,
  getFlow,
  isOnDemandDocId,
  stepIsValid,
  totalWizardSteps,
  type OnDemandDocId,
  type WizardField,
} from "@/lib/on-demand-generation/wizard-flows"
import {
  exportOnDemandDraftDocx,
  exportOnDemandDraftPdf,
} from "@/lib/on-demand-generation/client-export"
import { AcademicGeneratingOverlay } from "@/components/AcademicGeneratingOverlay"

const ICON_MAP: Record<string, LucideIcon> = {
  Lock,
  FileStack,
  ScrollText,
  Handshake,
  BadgeCheck,
  Users,
  IdCard,
  Scale,
  Shield,
  Mail,
  FileText,
  Zap,
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: WizardField
  value: string
  onChange: (v: string) => void
}) {
  const id = `wiz-${field.id}`
  if (field.type === "select" && field.options?.length) {
    return (
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="w-full border-white/15 bg-white/5 text-white"
        >
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-navy-900 text-white">
          {field.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }
  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
      />
    )
  }
  return (
    <Input
      id={id}
      type={field.type === "url" ? "url" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
    />
  )
}

export function GenerateWizard() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [documentType, setDocumentType] = useState<OnDemandDocId | "">("")
  const [wizardContext, setWizardContext] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [workspaceItemId, setWorkspaceItemId] = useState<string | null>(null)
  const [libraryDocumentId, setLibraryDocumentId] = useState<string | null>(null)
  const [appliedQuery, setAppliedQuery] = useState(false)
  const [exporting, setExporting] = useState<"docx" | "pdf" | null>(null)

  const totalSteps =
    documentType && isOnDemandDocId(documentType) ? totalWizardSteps(documentType) : 1

  const setField = (id: string, v: string) => {
    setWizardContext((prev) => ({ ...prev, [id]: v }))
  }

  const selectType = (id: OnDemandDocId) => {
    setDocumentType(id)
    setWizardContext({})
    setStep(1)
  }

  const applySearchParams = useCallback(() => {
    const type = searchParams.get("type") || searchParams.get("documentType") || ""
    if (!type || !isOnDemandDocId(type)) return
    setDocumentType(type)
    setStep(2)
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
    if (!documentType) return
    setIsGenerating(true)
    setGeneratedText("")
    setWorkspaceItemId(null)
    setLibraryDocumentId(null)
    try {
      const legacy = buildLegacyApiFields(documentType, wizardContext)
      const res = await fetch("/api/generation-jobs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          wizardContext,
          ...legacy,
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
      setLibraryDocumentId(typeof data.libraryDocumentId === "string" ? data.libraryDocumentId : null)
      setIsComplete(true)
      if (data.libraryDocumentId && data.workspaceItemId) {
        toast.success("Saved to your library and workspace")
      } else if (data.libraryDocumentId) {
        toast.success("Saved to your document library")
      } else if (data.workspaceItemId) {
        toast.success("Saved a copy to your workspace")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadBaseName = () => {
    const typeName = DOCUMENT_CARDS.find((t) => t.id === documentType)?.name || "document"
    const legacy = documentType ? buildLegacyApiFields(documentType, wizardContext) : null
    return `${typeName}-${legacy?.companyName || "draft"}`.replace(/[^\w\-]+/g, "_").slice(0, 80) || "quantiva-draft"
  }

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const downloadFile = (ext: "md" | "txt") => {
    if (!generatedText) return
    const base = downloadBaseName()
    const blob = new Blob([generatedText], { type: ext === "md" ? "text/markdown" : "text/plain" })
    triggerBlobDownload(blob, `${base}.${ext}`)
  }

  const downloadDocx = async () => {
    if (!generatedText) return
    const title = DOCUMENT_CARDS.find((t) => t.id === documentType)?.name || "Document"
    setExporting("docx")
    try {
      const blob = await exportOnDemandDraftDocx(title, generatedText)
      triggerBlobDownload(blob, `${downloadBaseName()}.docx`)
      toast.success("Downloaded .docx")
    } catch {
      toast.error("Could not build .docx")
    } finally {
      setExporting(null)
    }
  }

  const downloadPdf = async () => {
    if (!generatedText) return
    const title = DOCUMENT_CARDS.find((t) => t.id === documentType)?.name || "Document"
    setExporting("pdf")
    try {
      const blob = await exportOnDemandDraftPdf(title, generatedText)
      triggerBlobDownload(blob, `${downloadBaseName()}.pdf`)
      toast.success("Downloaded .pdf")
    } catch {
      toast.error("Could not build .pdf")
    } finally {
      setExporting(null)
    }
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
    if (step === 1) return Boolean(documentType)
    if (!documentType) return false
    return stepIsValid(documentType, step - 2, wizardContext)
  }

  const contentStepIndex = step - 2
  const flow = documentType ? getFlow(documentType) : null
  const currentStepDef =
    documentType && flow && contentStepIndex >= 0 ? flow.steps[contentStepIndex] : null

  if (isComplete) {
    const isDash =
      typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")
    const wsPath = isDash ? "/dashboard/workspace" : "/demo/ai/dashboard/workspace"
    const docPath = isDash ? "/dashboard/documents" : "/demo/ai/dashboard/documents"
    const itemPath = workspaceItemId ? `${wsPath}/${workspaceItemId}` : wsPath
    const libraryItemPath = libraryDocumentId ? `${docPath}/${libraryDocumentId}` : docPath

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
            {libraryDocumentId
              ? "Your draft is in the document library (and workspace when available). Download or copy below. This is not legal advice—have counsel review before use."
              : workspaceItemId
                ? "A draft was saved to your workspace. Download or copy below. This is not legal advice—have counsel review before use."
                : "Download or copy your draft below. If saves failed, your job is still stored under on-demand generation history."}
          </p>
        </motion.div>

        <Card className="glass-card border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {DOCUMENT_CARDS.find((t) => t.id === documentType)?.name}
                </h3>
                <p className="text-white/50 text-sm">Generated just now</p>
              </div>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="p-4 rounded-xl bg-white/5 mb-4 max-h-64 overflow-y-auto">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                {generatedText ||
                  (documentType
                    ? `${buildLegacyApiFields(documentType, wizardContext).companyName} — draft will appear here after generation (stored in Supabase).`
                    : "Your draft will appear here after generation.")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="gradient"
                className="flex-1 min-w-[120px]"
                type="button"
                onClick={() => downloadFile("md")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download .md
              </Button>
              <Button
                variant="glass"
                className="flex-1 min-w-[120px]"
                type="button"
                onClick={() => downloadFile("txt")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download .txt
              </Button>
              <Button
                variant="glass"
                className="flex-1 min-w-[120px]"
                type="button"
                disabled={exporting !== null}
                onClick={() => void downloadDocx()}
              >
                {exporting === "docx" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download .docx
              </Button>
              <Button
                variant="glass"
                className="flex-1 min-w-[120px]"
                type="button"
                disabled={exporting !== null}
                onClick={() => void downloadPdf()}
              >
                {exporting === "pdf" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download .pdf
              </Button>
              <Button variant="glass" type="button" onClick={copyText} disabled={exporting !== null}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="glass" type="button" asChild>
                <a href={libraryItemPath}>Document library</a>
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
      <AcademicGeneratingOverlay
        show
        subtitle="Tailoring content to your answers. For some document types we also pull brief public web snippets when configured—always verify sources. This usually takes under a minute."
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">On-Demand Document</h1>
        <p className="text-white/60">
          Choose a document type and answer the questions for that category. Steps change based on what
          you select. Academic theses and proposals live under{" "}
          <span className="text-indigo-300">Academic Research</span>.
        </p>
      </motion.div>

      <p className="text-amber-200/80 text-xs text-center mb-6 px-2">
        Outputs are AI drafts only—not legal advice. For contracts, privacy, HR, family law, and
        regulated industries, have qualified counsel review before use.
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
                    {DOCUMENT_CARDS.map((type) => {
                      const Icon = ICON_MAP[type.icon] || FileText
                      const selected = documentType === type.id
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => selectType(type.id)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-all duration-200",
                            selected
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10",
                            type.glow &&
                              "ring-1 ring-indigo-400/40 shadow-[0_0_24px_rgba(99,102,241,0.18)]"
                          )}
                        >
                          <span className="mb-2 flex text-indigo-300">
                            <Icon className="size-7" aria-hidden />
                          </span>
                          <span className="text-white font-medium block">{type.name}</span>
                          <span className="text-white/50 text-sm">{type.description}</span>
                        </button>
                      )
                    })}
                  </div>
                  {documentType === "law_divorce" && (
                    <p className="mt-4 text-sm text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      Family law is highly jurisdiction-specific. This tool only produces an informational
                      outline—not filings or legal advice. Consult a licensed attorney.
                    </p>
                  )}
                </div>
              </div>
            )}

            {step >= 2 && currentStepDef && documentType && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">{currentStepDef.title}</h2>
                  {currentStepDef.description ? (
                    <p className="text-sm text-white/55 mb-4">{currentStepDef.description}</p>
                  ) : null}
                  <div className="space-y-5">
                    {currentStepDef.fields.map((field) => (
                      <div key={field.id}>
                        <Label
                          htmlFor={`wiz-${field.id}`}
                          className="text-white/70 mb-2 block text-sm"
                        >
                          {field.label}
                          {field.required ? <span className="text-rose-400"> *</span> : null}
                        </Label>
                        <FieldEditor
                          field={field}
                          value={wizardContext[field.id] || ""}
                          onChange={(v) => setField(field.id, v)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {step === totalSteps && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <h4 className="text-white font-medium mb-2">Ready to generate</h4>
                    <p className="text-white/60 text-sm">
                      We will draft your{" "}
                      {DOCUMENT_CARDS.find((t) => t.id === documentType)?.name.toLowerCase()} using the
                      answers above. For supported types, we may add short public web excerpts to the
                      prompt—verify everything important independently.
                    </p>
                  </div>
                )}
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
                    Generate document
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
