'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Plus, Eye, Edit3, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

type LibraryRow = {
  id: string
  title: string
  description: string
  category: string
  jurisdiction: string
  access_level: string
  word_count: number
  download_count: number
  rating: number
  preview: string
  source: string
  created_at: string
  updated_at: string
  complexity: string
  read_minutes: number
}

type Stats = {
  globalTotal: number
  totalDownloads: number
  countBySource: Record<string, number>
}

const emptyForm = {
  title: '',
  description: '',
  category: '',
  jurisdiction: '',
  access_level: 'free',
  source: 'curated' as 'curated' | 'scheduled' | 'on_demand',
  preview: '',
  full_content: '',
}

export default function AdminDocumentsPage() {
  const [rows, setRows] = useState<LibraryRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setLoading(true)
    setForbidden(false)
    try {
      const q = new URLSearchParams({ limit: '100' })
      if (debouncedSearch) q.set('search', debouncedSearch)
      const res = await fetch(`/api/admin/library-documents?${q}`, { credentials: 'include' })
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) {
        setForbidden(true)
        setRows([])
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setRows(data.documents || [])
      setTotal(data.total ?? 0)
      setStats(data.stats || null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    if (sourceFilter === 'all') return rows
    return rows.filter((r) => (r.source || 'curated') === sourceFilter)
  }, [rows, sourceFilter])

  const sourceBreakdown = stats?.countBySource || {}

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  function openEdit(row: LibraryRow) {
    setEditingId(row.id)
    setForm({
      title: row.title,
      description: row.description || '',
      category: row.category,
      jurisdiction: row.jurisdiction || '',
      access_level: row.access_level || 'free',
      source: (row.source as typeof emptyForm.source) || 'curated',
      preview: row.preview || '',
      full_content: '',
    })
    setDialogOpen(true)
  }

  async function loadFullForEdit(id: string) {
    const res = await fetch(`/api/admin/library-documents/${id}`, { credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.document) {
      const d = data.document
      setForm((f) => ({
        ...f,
        full_content: typeof d.full_content === 'string' ? d.full_content : '',
        preview: typeof d.preview === 'string' ? d.preview : f.preview,
      }))
    }
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        const body: Record<string, unknown> = {
          title: form.title.trim(),
          description: form.description,
          category: form.category.trim() || 'general',
          jurisdiction: form.jurisdiction,
          access_level: form.access_level,
          source: form.source,
          preview: form.preview,
        }
        if (form.full_content !== '') body.full_content = form.full_content
        const res = await fetch(`/api/admin/library-documents/${editingId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Update failed')
        toast.success('Document updated')
      } else {
        const res = await fetch('/api/admin/library-documents', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description,
            category: form.category.trim() || 'general',
            jurisdiction: form.jurisdiction,
            access_level: form.access_level,
            source: form.source,
            preview: form.preview || form.full_content.slice(0, 500),
            full_content: form.full_content || form.preview,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Create failed')
        toast.success('Document created')
      }
      setDialogOpen(false)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”?`)) return
    const res = await fetch(`/api/admin/library-documents/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || 'Delete failed')
      return
    }
    toast.success('Deleted')
    await load()
  }

  if (forbidden) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Documents</h1>
        <p className="text-white/60">You do not have permission to manage library documents.</p>
        <Button variant="outline" className="border-white/20" asChild>
          <Link href="/dashboard">Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-white/60">Library templates and generated entries (Supabase).</p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600 gap-2 shrink-0" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add document
        </Button>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/50 text-sm">Total in library</p>
          <p className="text-2xl font-bold text-white">{stats?.globalTotal ?? '—'}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-white/50 text-sm">Total downloads</p>
          <p className="text-2xl font-bold text-white">
            {(stats?.totalDownloads ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 sm:col-span-2">
          <p className="text-white/50 text-sm mb-2">By source</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sourceBreakdown).map(([k, v]) => (
              <Badge key={k} variant="outline" className="border-white/20 text-white/80">
                {k}: {v}
              </Badge>
            ))}
            {Object.keys(sourceBreakdown).length === 0 && (
              <span className="text-white/40 text-sm">No data</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            placeholder="Search title or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'curated', 'scheduled', 'on_demand'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSourceFilter(s)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors',
                sourceFilter === s
                  ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Library documents</CardTitle>
          <CardDescription className="text-white/50">
            Showing {filtered.length} in view · {total} match search
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-white/60">
              <Loader2 className="size-6 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Document</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Category</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Source</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Access</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Downloads</th>
                    <th className="text-right p-4 text-white/50 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3 min-w-0 max-w-xs">
                          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-rose-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate">{doc.title}</p>
                            <p className="text-white/45 text-xs truncate">{doc.jurisdiction || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white/70 text-sm">{doc.category}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {doc.source || 'curated'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs border-white/20 text-white/70 capitalize">
                          {doc.access_level}
                        </Badge>
                      </td>
                      <td className="p-4 text-white/70 text-sm tabular-nums">{doc.download_count}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="text-white/60 hover:text-white" asChild>
                            <Link href={`/dashboard/documents/${doc.id}`} target="_blank" rel="noreferrer">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white/60 hover:text-white"
                            onClick={() => {
                              openEdit(doc)
                              void loadFullForEdit(doc.id)
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white/60 hover:text-rose-400"
                            onClick={() => void handleDelete(doc.id, doc.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="p-8 text-center text-white/50 text-sm">No documents match.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit document' : 'New document'}</DialogTitle>
            <DialogDescription className="text-white/50">
              Stored in <code className="text-white/70">library_documents</code>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-white/80">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-white/80">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-white/80">Jurisdiction</Label>
                <Input
                  value={form.jurisdiction}
                  onChange={(e) => setForm((f) => ({ ...f, jurisdiction: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-white/80">Access</Label>
                <Select
                  value={form.access_level}
                  onValueChange={(v) => setForm((f) => ({ ...f, access_level: v }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-white/80">Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, source: v as typeof f.source }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curated">Curated</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="on_demand">On demand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Preview (short)</Label>
              <Textarea
                value={form.preview}
                onChange={(e) => setForm((f) => ({ ...f, preview: e.target.value }))}
                className="bg-white/5 border-white/10 text-white min-h-[80px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">Full content</Label>
              <Textarea
                value={form.full_content}
                onChange={(e) => setForm((f) => ({ ...f, full_content: e.target.value }))}
                placeholder={editingId ? 'Loads when you open edit…' : 'Optional body (HTML or plain text)'}
                className="bg-white/5 border-white/10 text-white min-h-[120px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/20" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : editingId ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
