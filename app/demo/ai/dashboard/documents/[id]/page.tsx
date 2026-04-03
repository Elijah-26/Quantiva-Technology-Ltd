'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Star, Clock, FileText, History } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

type WsFolderRow = {
  id: string
  name: string
  parent_id: string | null
  sort_order: number
}

function flattenFoldersForSelect(folders: WsFolderRow[]): { id: string; label: string }[] {
  const byParent = new Map<string | null, WsFolderRow[]>()
  for (const f of folders) {
    const p = f.parent_id
    if (!byParent.has(p)) byParent.set(p, [])
    byParent.get(p)!.push(f)
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
  }
  const out: { id: string; label: string }[] = []
  const walk = (parent: string | null, depth: number) => {
    for (const f of byParent.get(parent) || []) {
      out.push({ id: f.id, label: `${'\u2014 '.repeat(depth)}${f.name}` })
      walk(f.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}

type LibraryDoc = {
  id: string
  title: string
  description: string
  category: string
  jurisdiction: string
  accessLevel: string
  wordCount: number
  downloadCount: number
  rating: number
  lastUpdated: string
  preview: string
  fullContent: string
  readMinutes: number
  complexity: 'Low' | 'Moderate' | 'High'
  versions: { version: string; date: string; note: string }[]
  relatedIds: string[]
  source?: string
  createdByUserId?: string | null
  hasFileAttachment?: boolean
  originalFilename?: string | null
  fileMimeType?: string | null
}

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const id = typeof params.id === 'string' ? params.id : ''
  const docBase =
    pathname.startsWith('/dashboard') ? '/dashboard/documents' : '/demo/ai/dashboard/documents'
  const adminBase = pathname.startsWith('/dashboard') ? '/dashboard' : '/demo/ai/dashboard'

  const [doc, setDoc] = useState<LibraryDoc | null>(null)
  const [related, setRelated] = useState<LibraryDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveOpen, setSaveOpen] = useState(false)
  const [folderChoices, setFolderChoices] = useState<{ id: string; label: string }[]>([])
  const [saveFolderId, setSaveFolderId] = useState<string>('__auto__')
  const [saveBusy, setSaveBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/library-documents/${encodeURIComponent(id)}`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Not found')
        if (cancelled) return
        const d = data.document as LibraryDoc
        setDoc(d)
        const relIds = d.relatedIds || []
        if (relIds.length) {
          const rel = await Promise.all(
            relIds.map((rid) =>
              fetch(`/api/library-documents/${encodeURIComponent(rid)}`, { credentials: 'include' }).then(
                (r) => r.json().then((j) => (r.ok ? j.document : null))
              )
            )
          )
          if (!cancelled) setRelated(rel.filter(Boolean) as LibraryDoc[])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const categoryLabel = useMemo(() => {
    if (!doc) return ''
    return doc.category.charAt(0).toUpperCase() + doc.category.slice(1)
  }, [doc])

  const source = doc?.source ?? 'curated'
  const showFullBody = useMemo(() => {
    if (!doc) return false
    const full = doc.fullContent?.trim() ?? ''
    const prev = doc.preview?.trim() ?? ''
    return full.length > 0 && (full.length > prev.length + 30 || full !== prev)
  }, [doc])

  useEffect(() => {
    if (!saveOpen) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/workspace/folders', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || cancelled) return
        const rows = (data.folders || []) as WsFolderRow[]
        setFolderChoices(flattenFoldersForSelect(rows))
      } catch {
        if (!cancelled) setFolderChoices([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [saveOpen])

  const saveToWorkspace = async () => {
    if (!doc) return
    setSaveBusy(true)
    try {
      const body: Record<string, string> = { libraryDocumentId: doc.id }
      if (saveFolderId !== '__auto__') {
        body.folderId = saveFolderId
      } else {
        body.folderSlug = doc.category === 'privacy' ? 'gdpr' : 'contracts'
      }
      const res = await fetch('/api/workspace/items/from-library', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Saved to workspace')
        setSaveOpen(false)
      } else {
        const j = await res.json().catch(() => ({}))
        toast.error(j.error || 'Could not save')
      }
    } finally {
      setSaveBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-white/60">Loading document…</div>
    )
  }

  if (error || !doc) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-white/60">{error || 'No document found for this id.'}</p>
        <Button variant="outline" onClick={() => router.push(docBase)}>
          Back to library
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="text-white/70">
            <Link href={docBase}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{doc.title}</h1>
              {source === 'on_demand' && (
                <Badge variant="secondary" className="text-xs capitalize">
                  On demand
                </Badge>
              )}
              {source === 'scheduled' && (
                <Badge variant="outline" className="border-violet-400/40 text-violet-300 text-xs">
                  Auto
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/50">{doc.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {doc.hasFileAttachment ? (
            <Button variant="gradient" asChild>
              <a
                href={`/api/library-documents/${encodeURIComponent(doc.id)}/file`}
                download={doc.originalFilename ?? undefined}
                className="inline-flex items-center gap-2"
              >
                <Download className="size-4" />
                {doc.originalFilename ? `Download ${doc.originalFilename}` : 'Download original file'}
              </a>
            </Button>
          ) : (
            <Button
              variant="gradient"
              onClick={() => toast.success('Export is managed per plan — document is in your library.')}
            >
              <Download className="size-4" />
              Download PDF
            </Button>
          )}
          <Button variant="glass" type="button" onClick={() => { setSaveFolderId('__auto__'); setSaveOpen(true) }}>
            Save to workspace
          </Button>
          {doc.accessLevel !== 'free' && (
            <Button variant="glass" asChild>
              <Link href={`${adminBase}/billing`}>Upgrade for access</Link>
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4 lg:col-span-2"
        >
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">{showFullBody ? 'Excerpt' : 'Content'}</CardTitle>
              <CardDescription className="text-white/50">
                {showFullBody
                  ? 'Short preview; full draft below when available.'
                  : 'From your document library.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/10 bg-navy-900/80 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80 max-h-[min(50vh,28rem)] overflow-y-auto">
                {doc.preview}
              </div>
            </CardContent>
          </Card>

          {showFullBody && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Full document</CardTitle>
                <CardDescription className="text-white/50">
                  Complete generated or stored text for this library entry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/10 bg-navy-900/80 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80 max-h-[min(70vh,40rem)] overflow-y-auto">
                  {doc.fullContent}
                </div>
              </CardContent>
            </Card>
          )}

          {related.length > 0 && (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Related templates</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <Button key={r.id} variant="outline" size="sm" asChild>
                    <Link href={`${docBase}/${r.id}`}>{r.title}</Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="size-4" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <div className="flex justify-between">
                <span>Source</span>
                <span className="text-right capitalize text-white/90">
                  {source === 'on_demand'
                    ? 'On demand'
                    : source === 'scheduled'
                      ? 'Scheduled'
                      : 'Curated'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Category</span>
                <Badge variant="secondary">{categoryLabel}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Jurisdiction</span>
                <span>{doc.jurisdiction.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Words</span>
                <span>{doc.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Read time
                </span>
                <span>{doc.readMinutes} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5" />
                  Rating
                </span>
                <span>{doc.rating}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <History className="size-4" />
                Versions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white/70">
              {(doc.versions || []).map((v) => (
                <div key={v.version + v.date} className="rounded-lg border border-white/10 p-2">
                  <div className="font-medium text-white">{v.version}</div>
                  <div className="text-xs text-white/50">{v.date}</div>
                  <div>{v.note}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="border border-zinc-600 bg-black text-white shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Save to workspace</DialogTitle>
            <DialogDescription className="text-white/60">
              Choose a folder or use the default (maps privacy → GDPR folder, else Contracts).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-white/70">Folder</Label>
            <Select value={saveFolderId} onValueChange={setSaveFolderId}>
              <SelectTrigger className="w-full border-zinc-600 bg-zinc-900 text-white">
                <SelectValue placeholder="Choose folder" />
              </SelectTrigger>
              <SelectContent className="border border-zinc-600 bg-black text-white max-h-64">
                <SelectItem value="__auto__" className="text-white focus:bg-zinc-800 focus:text-white">
                  Default by category
                </SelectItem>
                {folderChoices.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                    className="text-white focus:bg-zinc-800 focus:text-white"
                  >
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-500 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => setSaveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-white text-black hover:bg-zinc-200"
              onClick={() => void saveToWorkspace()}
              disabled={saveBusy}
            >
              {saveBusy ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
