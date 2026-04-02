'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Health = {
  openaiApiKeyConfigured: boolean
  cronSecretConfigured: boolean
  cronAuditUserConfigured: boolean
  referenceMarketCategories: number
  referenceGeographies: number
  readyForScheduledRun: boolean
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [documentsPerDay, setDocumentsPerDay] = useState(1)
  const [maxCap, setMaxCap] = useState(10)
  const [source, setSource] = useState<string>('default')
  const [envFallback, setEnvFallback] = useState<string | null>(null)
  const [health, setHealth] = useState<Health | null>(null)
  const [inputValue, setInputValue] = useState('1')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/scheduled-library?validate=1', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setDocumentsPerDay(data.documentsPerDay ?? 1)
      setInputValue(String(data.documentsPerDay ?? 1))
      setMaxCap(data.maxDocumentsPerRun ?? 10)
      setSource(data.documentsPerDaySource ?? 'default')
      setEnvFallback(data.environmentFallback ?? null)
      setHealth(data.health ?? null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveCount(e: React.FormEvent) {
    e.preventDefault()
    const n = parseInt(inputValue, 10)
    if (!Number.isFinite(n) || n < 1) {
      toast.error('Enter a number ≥ 1')
      return
    }
    if (n > maxCap) {
      toast.error(`Maximum per run is ${maxCap}`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/scheduled-library', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentsPerDay: n }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setDocumentsPerDay(data.documentsPerDay)
      setSource(data.documentsPerDaySource)
      setMaxCap(data.maxDocumentsPerRun)
      toast.success('Scheduled library batch size saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Admin settings</h1>
        <p className="text-white/60">
          Platform configuration for automated document generation and integrations.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-indigo-400" />
            <CardTitle className="text-white">Scheduled library generation</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Vercel Cron calls <code className="text-indigo-300">/api/cron/scheduled-library-document</code> daily
            (08:00 UTC). Each run creates up to the number below (random industry, document type, geography).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              <form onSubmit={saveCount} className="space-y-3 max-w-sm">
                <Label htmlFor="docsPerDay" className="text-white/80">
                  Documents to generate per cron run (per day)
                </Label>
                <div className="flex flex-wrap items-end gap-2">
                  <Input
                    id="docsPerDay"
                    type="number"
                    min={1}
                    max={maxCap}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-white/5 border-white/10 text-white w-28"
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="size-4 animate-spin" /> : 'Save'}
                  </Button>
                </div>
                <p className="text-xs text-white/45">
                  Effective value: <span className="text-white/70">{documentsPerDay}</span> (source:{' '}
                  <span className="text-white/70">{source}</span>). Hard cap: {maxCap} — override max with env{' '}
                  <code className="text-indigo-300">SCHEDULED_LIBRARY_DOCUMENTS_MAX_PER_DAY</code>.
                  {envFallback != null && source !== 'environment' && (
                    <>
                      {' '}
                      Env fallback <code className="text-indigo-300">SCHEDULED_LIBRARY_DOCUMENTS_PER_DAY</code> is{' '}
                      {envFallback} (used when DB is empty).
                    </>
                  )}
                </p>
              </form>

              {health && (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                  <p className="text-sm font-medium text-white flex items-center gap-2">
                    {health.readyForScheduledRun ? (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="size-4 text-amber-400" />
                    )}
                    Cron readiness (no documents created)
                  </p>
                  <ul className="text-sm text-white/65 space-y-1">
                    <li className="flex items-center gap-2">
                      {health.openaiApiKeyConfigured ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-3.5 text-rose-400 shrink-0" />
                      )}
                      OPENAI_API_KEY set on deployment
                    </li>
                    <li className="flex items-center gap-2">
                      {health.cronSecretConfigured ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-3.5 text-rose-400 shrink-0" />
                      )}
                      CRON_SECRET set (Vercel injects Bearer token)
                    </li>
                    <li className="flex items-center gap-2">
                      {health.referenceMarketCategories > 0 ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-3.5 text-rose-400 shrink-0" />
                      )}
                      reference_options: {health.referenceMarketCategories} market categories
                    </li>
                    <li className="flex items-center gap-2">
                      {health.referenceGeographies > 0 ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-3.5 text-rose-400 shrink-0" />
                      )}
                      reference_options: {health.referenceGeographies} geographies
                    </li>
                    <li className="flex items-center gap-2">
                      {health.cronAuditUserConfigured ? (
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="size-3.5 text-white/30 shrink-0">○</span>
                      )}
                      CRON_AUDIT_USER_ID (optional — audit log actor for scheduled docs)
                    </li>
                  </ul>
                  <p className="text-xs text-white/40 pt-2">
                    Optional: call the cron URL with{' '}
                    <code className="text-indigo-300">?validate=1</code> and the same auth as production cron to
                    re-check without generating.
                  </p>
                </div>
              )}

              <Button type="button" variant="outline" className="border-white/15 text-white" onClick={load}>
                Refresh status
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
