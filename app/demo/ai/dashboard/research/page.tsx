'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GraduationCap, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TEMPLATE_TYPES = [
  { id: 'dissertation', label: 'Dissertation / Thesis' },
  { id: 'proposal', label: 'Research proposal' },
  { id: 'literature', label: 'Literature review' },
  { id: 'paper', label: 'Research paper' },
  { id: 'case', label: 'Case study' },
]

const CITATIONS = [
  { id: 'apa', label: 'APA 7' },
  { id: 'mla', label: 'MLA 9' },
  { id: 'chicago', label: 'Chicago 17' },
]

const WORD_TARGETS = [
  { id: '8k', label: '8,000 words' },
  { id: '12k', label: '12,000 words' },
  { id: '15k', label: '15,000 words' },
  { id: '80k', label: '80,000 words (thesis)' },
]

const OUTLINE_A = `1. Introduction
   1.1 Problem statement
   1.2 Research questions
   1.3 Scope and limitations
2. Literature review
   2.1 Theoretical framework
   2.2 Prior empirical work
   2.3 Research gap
3. Methodology
   3.1 Design and data
   3.2 Analysis approach
   3.3 Ethics and reliability
4. Results
5. Discussion
6. Conclusion & future work
References (auto-formatted)`

const OUTLINE_B = `1. Executive summary
2. Background & context
3. Critical synthesis of themes
   3.1 Theme A — regulation
   3.2 Theme B — technology
   3.3 Theme C — organisational behaviour
4. Integrated conceptual model
5. Implications for practice
6. Agenda for further research
Appendices`

export default function ResearchDemoPage() {
  const [step, setStep] = useState(1)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [citationId, setCitationId] = useState<string | null>(null)
  const [wordId, setWordId] = useState<string | null>(null)
  const [outlineVariant, setOutlineVariant] = useState<'a' | 'b'>('a')
  const [showOutline, setShowOutline] = useState(false)

  const outlineText = outlineVariant === 'a' ? OUTLINE_A : OUTLINE_B

  const next = () => {
    if (step === 1 && !templateId) {
      toast.error('Pick a template type')
      return
    }
    if (step === 2 && !citationId) {
      toast.error('Pick a citation style')
      return
    }
    if (step === 3 && !wordId) {
      toast.error('Pick a word-count target')
      return
    }
    if (step < 4) setStep(step + 1)
  }

  const back = () => {
    if (step > 1) setStep(step - 1)
  }

  const generate = () => {
    setShowOutline(true)
    toast.success('Demo outline generated (static sample)')
  }

  const regenerate = () => {
    setOutlineVariant((v) => (v === 'a' ? 'b' : 'a'))
    toast.message('Demo — showing alternate static outline')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Research module</h1>
          <p className="text-white/60">
            Academic templates — demo wizard with static outlines (no AI call).
          </p>
        </div>
        <Button variant="glass" asChild>
          <Link href="/demo/ai/dashboard/research/projects">Research projects</Link>
        </Button>
      </motion.div>

      <div className="flex gap-2 text-sm text-white/50">
        {[1, 2, 3, 4].map((s) => (
          <span
            key={s}
            className={cn(
              'rounded-full px-3 py-1',
              step === s ? 'bg-indigo-500 text-white' : 'bg-white/10'
            )}
          >
            {s === 4 ? 'Outline' : `Step ${s}`}
          </span>
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <GraduationCap className="size-5 text-indigo-400" />
            {step === 1 && 'Template type'}
            {step === 2 && 'Citation style'}
            {step === 3 && 'Word count target'}
            {step === 4 && 'Generate outline'}
          </CardTitle>
          <CardDescription className="text-white/50">
            All choices are local — nothing is saved to a server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {TEMPLATE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    templateId === t.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-white/70">Citation format</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {CITATIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCitationId(c.id)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-sm transition-colors',
                      citationId === c.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/80'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {WORD_TARGETS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWordId(w.id)}
                  className={cn(
                    'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                    wordId === w.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/80'
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          )}

          {step === 4 && !showOutline && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Ready to generate a static outline for:{' '}
                <span className="text-white">
                  {TEMPLATE_TYPES.find((t) => t.id === templateId)?.label}
                </span>
                ,{' '}
                {CITATIONS.find((c) => c.id === citationId)?.label}, target{' '}
                {WORD_TARGETS.find((w) => w.id === wordId)?.label}.
              </p>
              <Button variant="gradient" type="button" onClick={generate}>
                Generate outline (demo)
              </Button>
            </div>
          )}

          {showOutline && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">Outline preview</p>
                <Button variant="glass" size="sm" type="button" onClick={regenerate}>
                  <RefreshCw className="size-4" />
                  Regenerate (alternate static)
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-navy-900/80 p-4 text-sm text-white/80 whitespace-pre-wrap font-mono">
                {outlineText}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <Button variant="glass" type="button" onClick={back} disabled={step === 1}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
            {step < 4 && (
              <Button variant="gradient" type="button" onClick={next}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
