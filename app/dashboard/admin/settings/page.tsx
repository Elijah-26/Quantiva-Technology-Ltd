'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Loader2 } from 'lucide-react'
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
  const [inputValue, setInputValue] = useState('1')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/scheduled-library', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setDocumentsPerDay(data.documentsPerDay ?? 1)
      setInputValue(String(data.documentsPerDay ?? 1))
      setMaxCap(data.maxDocumentsPerRun ?? 10)
      setSource(data.documentsPerDaySource ?? 'default')
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
            Runs once daily at 08:00 UTC. Each run creates up to the number below (random industry, document type,
            geography).
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
                  Current saved value: <span className="text-white/70">{documentsPerDay}</span>
                  {source !== 'default' && (
                    <>
                      {' '}
                      (<span className="text-white/70">{source}</span>)
                    </>
                  )}
                  . Maximum per run: {maxCap}.
                </p>
              </form>

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
