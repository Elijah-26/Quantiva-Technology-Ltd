'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type RefOption = { value: string; label: string }
type DocTypeOption = { id: string; label: string }

export default function GenerateLibraryDocumentPage() {
  const pathname = usePathname()
  const docBase =
    pathname.startsWith('/dashboard') ? '/dashboard/documents' : '/demo/ai/dashboard/documents'

  const [marketCategories, setMarketCategories] = useState<RefOption[]>([])
  const [geographies, setGeographies] = useState<RefOption[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocTypeOption[]>([])
  const [marketCategory, setMarketCategory] = useState('')
  const [geography, setGeography] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    id: string
    title: string
    preview: string
  } | null>(null)

  const loadOptions = useCallback(async (category: string) => {
    const q = category ? `?marketCategory=${encodeURIComponent(category)}` : ''
    const res = await fetch(`/api/library-documents/generate${q}`, { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Failed to load options')
    setMarketCategories(data.marketCategories || [])
    setGeographies(data.geographies || [])
    setDocumentTypes(data.documentTypes || [])
    return data as {
      marketCategories: RefOption[]
      geographies: RefOption[]
      documentTypes: DocTypeOption[]
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await loadOptions('')
        if (cancelled) return
        const firstCat = data.marketCategories[0]?.value ?? ''
        setMarketCategory(firstCat)
        setDocumentType(data.documentTypes[0]?.id ?? '')
        const firstGeo = data.geographies[0]?.value ?? ''
        if (firstGeo) setGeography(firstGeo)
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : 'Could not load form')
      } finally {
        if (!cancelled) setLoadingOptions(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadOptions])

  const onCategoryChange = async (value: string) => {
    setMarketCategory(value)
    setDocumentType('')
    try {
      const data = await loadOptions(value)
      setDocumentType(data.documentTypes[0]?.id ?? '')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not load document types')
    }
  }

  const canSubmit = marketCategory && geography && documentType && !submitting && !loadingOptions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/library-documents/generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketCategory, documentType, geography }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data.code === 'GEN_LIMIT') {
          toast.error(data.error || 'Monthly generation limit reached')
        } else {
          toast.error(data.error || 'Generation failed')
        }
        return
      }
      const doc = data.document as { id: string; title: string; preview: string }
      setResult({ id: doc.id, title: doc.title, preview: doc.preview })
      toast.success('Document added to your library')
    } catch {
      toast.error('Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  const selectTriggerClass = useMemo(
    () =>
      cn(
        'w-full max-w-none border-white/15 bg-white/5 text-white',
        'data-[placeholder]:text-white/40 focus-visible:ring-indigo-500/40'
      ),
    []
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-white">Generate to library</h1>
        <p className="text-white/60 text-sm">
          Pick an industry, document type, and geography. We create the draft and save it to the
          document library (counts toward your monthly AI generation limit).
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="size-5 text-indigo-400" />
              New library document
            </CardTitle>
            <CardDescription className="text-white/50">
              On-demand generation is stored with source &quot;on demand&quot; and linked to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/80">Industry (market category)</Label>
                <Select
                  value={marketCategory}
                  onValueChange={onCategoryChange}
                  disabled={loadingOptions}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-navy-900 text-white">
                    {marketCategories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Document type</Label>
                <Select
                  value={documentType}
                  onValueChange={setDocumentType}
                  disabled={loadingOptions || !documentTypes.length}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-navy-900 text-white">
                    {documentTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Geography</Label>
                <Select value={geography} onValueChange={setGeography} disabled={loadingOptions}>
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select geography" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-navy-900 text-white">
                    {geographies.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full sm:w-auto"
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate and save
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-white/90"
        >
          <p className="font-medium text-white">{result.title}</p>
          <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-white/70">{result.preview}</p>
          <Button variant="outline" className="mt-4 border-white/20 text-white hover:bg-white/10" asChild>
            <Link href={`${docBase}/${result.id}`}>Open in library</Link>
          </Button>
        </motion.div>
      )}

      <p className="text-center text-sm text-white/40">
        <Link href={docBase} className="text-indigo-400 hover:text-indigo-300">
          Back to document library
        </Link>
      </p>
    </div>
  )
}
