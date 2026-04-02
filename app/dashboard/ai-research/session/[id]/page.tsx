'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  Sparkles,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FlowStep, FlowField } from '@/lib/academic-research/template-flows'
import { getWizardStep } from '@/lib/academic-research/types'
import type { OutlineItem } from '@/lib/academic-research/types'
import { buildAssembledDocument } from '@/lib/academic-research/assemble'

type SessionRow = {
  id: string
  template_type: string
  status: string
  title: string
  citation_style: string
  word_target_band: string
  answers: Record<string, unknown>
  scraped_context: unknown
  outline: unknown
  references_text?: string | null
  error_message: string | null
  updated_at: string
}

type SectionRow = {
  id: string
  section_slug: string
  heading: string
  sort_order: number
  body: string
}

function userFacingSessionError(msg: string | null): string | null {
  if (!msg?.trim()) return null
  if (
    /OPENAI|FIRECRAWL|API_KEY|api\.openai|supabase|VERCEL|timeout|ECONNRESET/i.test(msg)
  ) {
    return 'Something went wrong while generating. You can try again, or go back and adjust your answers.'
  }
  return msg
}

type GeneratePhase = null | 'preparing' | 'structuring' | 'writing'

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FlowField
  value: string
  onChange: (v: string) => void
}) {
  if (field.type === 'textarea') {
    return (
      <textarea
        id={field.name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none"
      />
    )
  }
  if (field.type === 'select' && field.options?.length) {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-white/15 bg-white/5 text-white">
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
  return (
    <Input
      id={field.name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="border-white/10 bg-white/5 text-white"
    />
  )
}

export default function AcademicResearchSessionPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  const [session, setSession] = useState<SessionRow | null>(null)
  const [sections, setSections] = useState<SectionRow[]>([])
  const [steps, setSteps] = useState<FlowStep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [pipeBusy, setPipeBusy] = useState(false)
  const [generatePhase, setGeneratePhase] = useState<GeneratePhase>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/academic-research/sessions/${encodeURIComponent(id)}`, {
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Not found')
      const s = data.session as SessionRow
      setSession(s)
      setSections(data.sections || [])

      const fRes = await fetch(`/api/academic-research/flow/${encodeURIComponent(s.template_type)}`)
      const fData = await fRes.json().catch(() => ({}))
      if (fRes.ok) setSteps(fData.steps || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed')
      router.push('/dashboard/ai-research')
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    load()
  }, [load])

  const stepIndex = session ? getWizardStep(session.answers) : 0
  const currentStep = steps[stepIndex]
  const isReview = currentStep?.id === 'review'
  const totalSteps = steps.length

  useEffect(() => {
    if (!session || !currentStep) return
    const next: Record<string, string> = {}
    for (const f of currentStep.fields) {
      const v = session.answers[f.name]
      next[f.name] = typeof v === 'string' ? v : v != null ? String(v) : ''
    }
    setForm(next)
  }, [session, currentStep])

  async function patchSession(body: Record<string, unknown>) {
    const res = await fetch(`/api/academic-research/sessions/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Save failed')
    setSession(data.session as SessionRow)
    return data.session as SessionRow
  }

  function validateStep(): boolean {
    if (!currentStep) return true
    for (const f of currentStep.fields) {
      if (f.required && !String(form[f.name] || '').trim()) {
        toast.error(`Please fill: ${f.label}`)
        return false
      }
    }
    return true
  }

  async function goNext() {
    if (!session || !currentStep || isReview) return
    if (!validateStep()) return
    setSaving(true)
    try {
      const merged = { ...session.answers, ...form }
      await patchSession({
        answers: merged,
        step: Math.min(stepIndex + 1, totalSteps - 1),
      })
      toast.success('Saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function goBack() {
    if (!session || stepIndex <= 0) return
    setSaving(true)
    try {
      const merged = { ...session.answers, ...form }
      await patchSession({
        answers: merged,
        step: stepIndex - 1,
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function runGenerate() {
    if (!id) return
    setPipeBusy(true)
    setGeneratePhase('preparing')
    try {
      const resR = await fetch(`/api/academic-research/sessions/${encodeURIComponent(id)}/research`, {
        method: 'POST',
        credentials: 'include',
      })
      const dataR = await resR.json().catch(() => ({}))
      if (!resR.ok) throw new Error(dataR.error || 'Preparation step failed')
      toast.success(
        typeof dataR.sourceCount === 'number' && dataR.sourceCount > 0
          ? `Found ${dataR.sourceCount} web source(s) for context.`
          : 'Continuing with your answers.'
      )

      setGeneratePhase('structuring')
      const resO = await fetch(
        `/api/academic-research/sessions/${encodeURIComponent(id)}/outline?reset=1`,
        { method: 'POST', credentials: 'include' }
      )
      const dataO = await resO.json().catch(() => ({}))
      if (!resO.ok) throw new Error(dataO.error || 'Could not structure the document')

      setGeneratePhase('writing')
      let guard = 0
      while (guard < 48) {
        guard++
        const resG = await fetch(`/api/academic-research/sessions/${encodeURIComponent(id)}/generate`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const dataG = await resG.json().catch(() => ({}))
        if (!resG.ok) throw new Error(dataG.error || 'Writing failed')
        if (dataG.completed) {
          await load()
          toast.success('Your document is ready.')
          return
        }
        await load()
      }
      throw new Error('Generation stopped after too many steps. Try again or contact support.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
      await load()
    } finally {
      setPipeBusy(false)
      setGeneratePhase(null)
    }
  }

  const outline = (session?.outline || []) as OutlineItem[]
  const scraped = Array.isArray(session?.scraped_context) ? session.scraped_context : []

  const assembled =
    session &&
    buildAssembledDocument({
      title: session.title || 'Research',
      outline,
      sections: sections.map((s) => ({
        section_slug: s.section_slug,
        heading: s.heading,
        sort_order: s.sort_order,
        body: s.body,
      })),
      referencesText: String(session.references_text ?? ''),
    })

  async function copyDoc() {
    if (!assembled?.trim()) {
      toast.error('Nothing to copy yet')
      return
    }
    await navigator.clipboard.writeText(assembled)
    toast.success('Copied')
  }

  async function downloadExport(format: 'docx' | 'pdf') {
    if (!id) return
    try {
      const res = await fetch(
        `/api/academic-research/sessions/${encodeURIComponent(id)}/export?format=${format}`,
        { credentials: 'include' }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Download failed')
      }
      const blob = await res.blob()
      const ext = format === 'docx' ? 'docx' : 'pdf'
      const base = (session?.title || 'research').replace(/\s+/g, '_').slice(0, 60)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${base}.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success(`Downloaded .${ext}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed')
    }
  }

  const phaseLabel =
    generatePhase === 'preparing'
      ? 'Preparing…'
      : generatePhase === 'structuring'
        ? 'Structuring…'
        : generatePhase === 'writing'
          ? 'Writing…'
          : null

  const displayError = userFacingSessionError(session?.error_message ?? null)

  if (loading || !session) {
    return (
      <div className="flex items-center gap-2 py-20 text-white/50 justify-center">
        <Loader2 className="size-6 animate-spin" />
        Loading session…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="text-white/70">
          <Link href="/dashboard/ai-research">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{session.title}</h1>
          <p className="text-sm text-white/50">
            {session.template_type.replace(/_/g, ' ')} ·{' '}
            <Badge variant="outline" className="border-white/20 text-white/70">
              {session.status}
            </Badge>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/50">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              'rounded-full px-2.5 py-1',
              i === stepIndex ? 'bg-indigo-500 text-white' : 'bg-white/10'
            )}
          >
            {i + 1}. {s.title}
          </span>
        ))}
      </div>

      {!isReview && currentStep && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">{currentStep.title}</CardTitle>
              {currentStep.description && (
                <CardDescription className="text-white/50">{currentStep.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {currentStep.fields.map((f) => (
                <div key={f.name} className="space-y-2">
                  <Label htmlFor={f.name} className="text-white/80">
                    {f.label}
                    {f.required && <span className="text-rose-400"> *</span>}
                  </Label>
                  <FieldInput field={f} value={form[f.name] || ''} onChange={(v) => setForm((p) => ({ ...p, [f.name]: v }))} />
                </div>
              ))}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button variant="glass" type="button" onClick={goBack} disabled={stepIndex === 0 || saving}>
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button variant="gradient" type="button" onClick={goNext} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save & continue'}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isReview && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Generate document</CardTitle>
              <CardDescription className="text-white/50">
                When you are happy with your answers, generate a full draft with numbered sections and references.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {displayError && (
                <p className="text-sm text-amber-300/90 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  {displayError}
                </p>
              )}
              {pipeBusy && phaseLabel && (
                <p className="text-sm text-white/60 flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  {phaseLabel}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="gradient" disabled={pipeBusy} onClick={runGenerate}>
                  {pipeBusy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Generate
                </Button>
              </div>
              <Button variant="glass" type="button" onClick={goBack} disabled={pipeBusy}>
                <ChevronLeft className="size-4" />
                Back to edit answers
              </Button>
            </CardContent>
          </Card>

          {!pipeBusy && scraped.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Sources ({scraped.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/65">
                {(scraped as { title?: string; url?: string }[]).slice(0, 6).map((s, i) => (
                  <div key={i} className="border border-white/10 rounded-lg p-2">
                    <p className="font-medium text-white/90">{s.title || 'Source'}</p>
                    <a href={s.url} className="text-indigo-400 text-xs break-all" target="_blank" rel="noreferrer">
                      {s.url}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!pipeBusy && outline.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Outline</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-1 text-sm text-white/75">
                  {outline.map((o) => (
                    <li key={o.slug}>{o.heading}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {sections.length > 0 && assembled && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-white text-base">Document</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button variant="glass" size="sm" type="button" onClick={copyDoc}>
                    <Copy className="size-4" />
                    Copy
                  </Button>
                  <Button variant="glass" size="sm" type="button" onClick={() => downloadExport('docx')}>
                    <FileText className="size-4" />
                    DOCX
                  </Button>
                  <Button variant="glass" size="sm" type="button" onClick={() => downloadExport('pdf')}>
                    <Download className="size-4" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[480px] overflow-y-auto rounded-xl border border-white/10 bg-navy-950/80 p-4 text-sm text-white/80 whitespace-pre-wrap font-mono">
                  {assembled || '—'}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
