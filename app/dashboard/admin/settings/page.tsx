'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Loader2, Webhook, Play, CheckCircle2, XCircle, Plus, Pencil, Trash2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Health = {
  openaiApiKeyConfigured: boolean
  cronSecretConfigured: boolean
  cronAuditUserConfigured: boolean
  referenceMarketCategories: number
  referenceGeographies: number
  readyForScheduledRun: boolean
}

type WebhookRow = {
  id: string
  name: string
  url: string
  type: string
  description: string | null
  active: boolean
}

function BoolRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="text-white/70">{label}</span>
      {ok ? (
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="size-4" /> Yes
        </span>
      ) : (
        <span className="flex items-center gap-1 text-rose-400">
          <XCircle className="size-4" /> No
        </span>
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [documentsPerDay, setDocumentsPerDay] = useState(1)
  const [maxCap, setMaxCap] = useState(10)
  const [source, setSource] = useState<string>('default')
  const [inputValue, setInputValue] = useState('1')
  const [health, setHealth] = useState<Health | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [running, setRunning] = useState(false)

  const [webhooks, setWebhooks] = useState<WebhookRow[]>([])
  const [whLoading, setWhLoading] = useState(true)
  const [whDialog, setWhDialog] = useState(false)
  const [whEditing, setWhEditing] = useState<WebhookRow | null>(null)
  const [whSaving, setWhSaving] = useState(false)
  const [whForm, setWhForm] = useState({
    name: '',
    url: '',
    type: 'on-demand' as 'on-demand' | 'recurring',
    description: '',
    active: true,
  })

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

  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const res = await fetch('/api/admin/scheduled-library?validate=1', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to load health')
      setHealth(data.health ?? null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Health check failed')
      setHealth(null)
    } finally {
      setHealthLoading(false)
    }
  }, [])

  const loadWebhooks = useCallback(async () => {
    setWhLoading(true)
    try {
      const res = await fetch('/api/webhooks', { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to load webhooks')
      setWebhooks(data.webhooks || [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Webhooks load failed')
      setWebhooks([])
    } finally {
      setWhLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    void loadHealth()
    void loadWebhooks()
  }, [load, loadHealth, loadWebhooks])

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

  async function runScheduledNow() {
    setRunning(true)
    try {
      const res = await fetch('/api/admin/scheduled-library/run', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Run failed')
      toast.success(
        `Created ${data.createdCount ?? 0} document(s)${data.partial ? ' (partial batch)' : ''}`
      )
      if (data.errors?.length) {
        console.warn('Scheduled run errors', data.errors)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Run failed')
    } finally {
      setRunning(false)
    }
  }

  function openWhCreate() {
    setWhEditing(null)
    setWhForm({
      name: '',
      url: '',
      type: 'on-demand',
      description: '',
      active: true,
    })
    setWhDialog(true)
  }

  function openWhEdit(w: WebhookRow) {
    setWhEditing(w)
    setWhForm({
      name: w.name,
      url: w.url,
      type: w.type === 'recurring' ? 'recurring' : 'on-demand',
      description: w.description || '',
      active: w.active,
    })
    setWhDialog(true)
  }

  async function saveWebhook() {
    if (!whForm.name.trim() || !whForm.url.trim()) {
      toast.error('Name and URL are required')
      return
    }
    setWhSaving(true)
    try {
      if (whEditing) {
        const res = await fetch(`/api/webhooks/${whEditing.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: whForm.name.trim(),
            url: whForm.url.trim(),
            type: whForm.type,
            description: whForm.description || null,
            active: whForm.active,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Update failed')
        toast.success('Webhook updated')
      } else {
        const res = await fetch('/api/webhooks', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: whForm.name.trim(),
            url: whForm.url.trim(),
            type: whForm.type,
            description: whForm.description || null,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Create failed')
        toast.success('Webhook created')
      }
      setWhDialog(false)
      await loadWebhooks()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setWhSaving(false)
    }
  }

  async function deleteWebhook(id: string) {
    if (!confirm('Delete this webhook?')) return
    const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE', credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || 'Delete failed')
      return
    }
    toast.success('Webhook deleted')
    await loadWebhooks()
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
          Scheduled library (UTC cron), health checks, manual run, and market-research webhooks.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-indigo-400" />
            <CardTitle className="text-white">Scheduled library generation</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Vercel cron: <code className="text-white/70">0 8 * * *</code> (08:00 UTC daily). Endpoint{' '}
            <code className="text-white/70">/api/cron/scheduled-library-document</code> with{' '}
            <code className="text-white/70">CRON_SECRET</code> in production.
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

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="border-white/15 text-white" onClick={load}>
                  Refresh config
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-indigo-500/40 text-indigo-200"
                  onClick={() => void loadHealth()}
                  disabled={healthLoading}
                >
                  {healthLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Refresh health
                </Button>
                <Button
                  type="button"
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => void runScheduledNow()}
                  disabled={running}
                >
                  {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
                  Run batch now
                </Button>
              </div>

              {health && (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 max-w-md">
                  <p className="text-white font-medium text-sm mb-2">Environment &amp; reference data</p>
                  <BoolRow label="OpenAI API key set" ok={health.openaiApiKeyConfigured} />
                  <BoolRow label="CRON_SECRET set (Vercel cron auth)" ok={health.cronSecretConfigured} />
                  <BoolRow label="CRON_AUDIT_USER_ID (optional audit actor)" ok={health.cronAuditUserConfigured} />
                  <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
                    <span className="text-white/70">Market categories (reference_options)</span>
                    <span className="text-white tabular-nums">{health.referenceMarketCategories}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
                    <span className="text-white/70">Geographies (reference_options)</span>
                    <span className="text-white tabular-nums">{health.referenceGeographies}</span>
                  </div>
                  <div
                    className={cn(
                      'mt-3 text-sm font-medium',
                      health.readyForScheduledRun ? 'text-emerald-400' : 'text-amber-400'
                    )}
                  >
                    {health.readyForScheduledRun
                      ? 'Ready for automated runs (OpenAI + cron secret + reference data).'
                      : 'Not fully ready — fix the items above before expecting cron success.'}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Webhook className="size-5 text-indigo-400" />
            <div>
              <CardTitle className="text-white">Webhooks</CardTitle>
              <CardDescription className="text-white/50">
                On-demand and recurring market research endpoints (platform admin only to edit).
              </CardDescription>
            </div>
          </div>
          <Button className="gap-2 shrink-0" onClick={openWhCreate}>
            <Plus className="size-4" />
            Add webhook
          </Button>
        </CardHeader>
        <CardContent>
          {whLoading ? (
            <div className="flex items-center gap-2 text-white/60 text-sm py-8">
              <Loader2 className="size-4 animate-spin" />
              Loading webhooks…
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-white/50 text-sm">No webhooks configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-white/50">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">URL</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((w) => (
                    <tr key={w.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white font-medium">{w.name}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="border-white/20 text-white/80 capitalize">
                          {w.type}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-white/60 font-mono text-xs max-w-[200px] truncate">
                        {w.url}
                      </td>
                      <td className="py-2 pr-4">
                        {w.active ? (
                          <span className="text-emerald-400">Yes</span>
                        ) : (
                          <span className="text-white/40">No</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/60 hover:text-white"
                          onClick={() => openWhEdit(w)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white/60 hover:text-rose-400"
                          onClick={() => void deleteWebhook(w.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={whDialog} onOpenChange={setWhDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{whEditing ? 'Edit webhook' : 'New webhook'}</DialogTitle>
            <DialogDescription className="text-white/50">
              Type must be <code className="text-white/70">on-demand</code> or{' '}
              <code className="text-white/70">recurring</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-white/80">Name</Label>
              <Input
                value={whForm.name}
                onChange={(e) => setWhForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">URL</Label>
              <Input
                value={whForm.url}
                onChange={(e) => setWhForm((f) => ({ ...f, url: e.target.value }))}
                className="bg-white/5 border-white/10 text-white font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Type</Label>
              <Select
                value={whForm.type}
                onValueChange={(v) => setWhForm((f) => ({ ...f, type: v as typeof f.type }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-demand">On-demand</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Description</Label>
              <Textarea
                value={whForm.description}
                onChange={(e) => setWhForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
              />
            </div>
            {whEditing && (
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={whForm.active}
                  onChange={(e) => setWhForm((f) => ({ ...f, active: e.target.checked }))}
                  className="rounded border-white/30"
                />
                Active
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/20" onClick={() => setWhDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => void saveWebhook()} disabled={whSaving}>
              {whSaving ? <Loader2 className="size-4 animate-spin" /> : whEditing ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
