'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderOpen,
  FileText,
  Search,
  Grid3X3,
  List,
  Star,
  Clock,
  Download,
  Trash2,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Share2,
  FolderInput,
  Pencil,
  Users,
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { trackLibraryDocumentDownload } from '@/lib/track-library-download'

type FolderRow = {
  id: string
  name: string
  slug: string
  icon_emoji: string
  parent_id: string | null
  sort_order: number
}

type WsDoc = {
  id: string
  title: string
  type: string
  folder: string
  folderName: string | null
  date: string
  isFavorite: boolean
  status: string
  folderId: string | null
  libraryDocumentId: string | null
  generationJobId: string | null
  hasStoredContent: boolean
  isOwner: boolean
}

type ShareRow = { id: string; sharedWithUserId: string; email: string | null; createdAt: string }

type ViewState =
  | { kind: 'all' }
  | { kind: 'favorites' }
  | { kind: 'shared' }
  | { kind: 'folder'; folderId: string }

function buildChildrenMap(folders: FolderRow[]) {
  const byParent = new Map<string | null, FolderRow[]>()
  for (const f of folders) {
    const p = f.parent_id
    if (!byParent.has(p)) byParent.set(p, [])
    byParent.get(p)!.push(f)
  }
  for (const arr of byParent.values()) {
    arr.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
  }
  return byParent
}

function collectDescendantFolderIds(rootId: string, byParent: Map<string | null, FolderRow[]>): Set<string> {
  const out = new Set<string>([rootId])
  const stack = [rootId]
  while (stack.length) {
    const cur = stack.pop()!
    const kids = byParent.get(cur) || []
    for (const k of kids) {
      if (!out.has(k.id)) {
        out.add(k.id)
        stack.push(k.id)
      }
    }
  }
  return out
}

function flatFolderOptions(
  folders: FolderRow[],
  byParent: Map<string | null, FolderRow[]>,
  depth = 0,
  parent: string | null = null
): { id: string; label: string }[] {
  const rows = byParent.get(parent) || []
  const out: { id: string; label: string }[] = []
  for (const f of rows) {
    out.push({ id: f.id, label: `${'— '.repeat(depth)}${f.name}` })
    out.push(...flatFolderOptions(folders, byParent, depth + 1, f.id))
  }
  return out
}

export default function WorkspacePageClient() {
  const pathname = usePathname()
  const wsBase = pathname.startsWith('/dashboard') ? '/dashboard/workspace' : '/demo/ai/dashboard/workspace'

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedView, setSelectedView] = useState<ViewState>({ kind: 'all' })
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<WsDoc[]>([])
  const [folderRows, setFolderRows] = useState<FolderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [folderDialogParentId, setFolderDialogParentId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderSaving, setFolderSaving] = useState(false)

  const [renameFolderId, setRenameFolderId] = useState<string | null>(null)
  const [renameFolderName, setRenameFolderName] = useState('')

  const [shareDoc, setShareDoc] = useState<WsDoc | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [shares, setShares] = useState<ShareRow[]>([])
  const [sharesLoading, setSharesLoading] = useState(false)

  const byParent = useMemo(() => buildChildrenMap(folderRows), [folderRows])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [fr, ir] = await Promise.all([
        fetch('/api/workspace/folders', { credentials: 'include' }),
        fetch('/api/workspace/items', { credentials: 'include' }),
      ])
      const fj = await fr.json().catch(() => ({}))
      const ij = await ir.json().catch(() => ({}))
      if (!fr.ok) throw new Error(fj.error || 'Failed to load folders')
      if (!ir.ok) throw new Error(ij.error || 'Failed to load items')
      const rawFolders = fj.folders || []
      setFolderRows(
        rawFolders.map((f: Record<string, unknown>) => ({
          id: f.id as string,
          name: f.name as string,
          slug: f.slug as string,
          icon_emoji: (f.icon_emoji as string) || '📁',
          parent_id: (f.parent_id as string | null) ?? null,
          sort_order: typeof f.sort_order === 'number' ? f.sort_order : 0,
        }))
      )
      setDocuments(ij.items || [])
      setExpanded((prev) => {
        const next = new Set(prev)
        for (const f of rawFolders as FolderRow[]) {
          if (f.parent_id === null) next.add(f.id)
        }
        return next
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const docCountInTree = useCallback(
    (folderId: string) => {
      const ids = collectDescendantFolderIds(folderId, byParent)
      return documents.filter((d) => d.folderId && ids.has(d.folderId)).length
    },
    [documents, byParent]
  )

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      let inView = true
      if (selectedView.kind === 'all') inView = true
      else if (selectedView.kind === 'favorites') inView = doc.isFavorite
      else if (selectedView.kind === 'shared') inView = !doc.isOwner
      else {
        const ids = collectDescendantFolderIds(selectedView.folderId, byParent)
        inView = Boolean(doc.folderId && ids.has(doc.folderId))
      }
      const q = searchQuery.toLowerCase()
      const matchesSearch = !q || doc.title.toLowerCase().includes(q)
      return inView && matchesSearch
    })
  }, [documents, selectedView, searchQuery, byParent])

  const stats = useMemo(() => {
    const drafts = documents.filter((d) => d.status === 'draft').length
    const completed = documents.filter((d) => d.status === 'completed' || d.status === 'saved').length
    const fav = documents.filter((d) => d.isFavorite).length
    const sharedIn = documents.filter((d) => !d.isOwner).length
    return [
      { label: 'Total', value: documents.length },
      { label: 'Favorites', value: fav },
      { label: 'Shared with you', value: sharedIn },
      { label: 'Completed / saved', value: completed },
      { label: 'Drafts', value: drafts },
    ]
  }, [documents])

  async function downloadDoc(doc: WsDoc) {
    if (doc.hasStoredContent) {
      try {
        const res = await fetch(`/api/workspace/items/${encodeURIComponent(doc.id)}`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.item?.contentText) {
          toast.error('Could not download draft')
          return
        }
        const blob = new Blob([data.item.contentText], { type: 'text/markdown' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${doc.title.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'document'}.md`
        a.click()
        URL.revokeObjectURL(a.href)
      } catch {
        toast.error('Download failed')
      }
      return
    }
    if (doc.libraryDocumentId) {
      try {
        const res = await fetch(`/api/library-documents/${encodeURIComponent(doc.libraryDocumentId)}`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.document) {
          toast.error('Could not load library document')
          return
        }
        const text = (data.document.fullContent as string) || (data.document.preview as string) || ''
        const blob = new Blob([text], { type: 'text/markdown' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${doc.title.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'document'}.md`
        a.click()
        URL.revokeObjectURL(a.href)
        trackLibraryDocumentDownload(doc.libraryDocumentId)
      } catch {
        toast.error('Download failed')
      }
      return
    }
    toast.message('No file body for this item', {
      description: 'Open the document or generate content first.',
    })
  }

  async function patchDoc(doc: WsDoc, body: Record<string, unknown>) {
    const res = await fetch(`/api/workspace/items/${encodeURIComponent(doc.id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || 'Update failed')
      return false
    }
    await load()
    return true
  }

  async function deleteDoc(doc: WsDoc) {
    if (!doc.isOwner) return
    if (!window.confirm(`Remove "${doc.title}" from your workspace?`)) return
    const res = await fetch(`/api/workspace/items/${encodeURIComponent(doc.id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      toast.error(j.error || 'Delete failed')
      return
    }
    toast.success('Removed from workspace')
    load()
  }

  async function leaveShared(doc: WsDoc) {
    if (doc.isOwner) return
    const res = await fetch(
      `/api/workspace/items/${encodeURIComponent(doc.id)}/shares/self`,
      { method: 'DELETE', credentials: 'include' }
    )
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      toast.error(j.error || 'Could not leave')
      return
    }
    toast.success('Removed from your workspace list')
    load()
  }

  async function createFolder() {
    const name = newFolderName.trim()
    if (!name) {
      toast.error('Enter a folder name')
      return
    }
    setFolderSaving(true)
    try {
      const res = await fetch('/api/workspace/folders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: folderDialogParentId }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(j.error || 'Could not create folder')
        return
      }
      toast.success('Folder created')
      setFolderDialogOpen(false)
      setNewFolderName('')
      setFolderDialogParentId(null)
      if (j.folder?.id) {
        setExpanded((prev) => new Set(prev).add(j.folder.id))
        if (folderDialogParentId) setExpanded((prev) => new Set(prev).add(folderDialogParentId))
      }
      load()
    } finally {
      setFolderSaving(false)
    }
  }

  async function saveRenameFolder() {
    if (!renameFolderId) return
    const name = renameFolderName.trim()
    if (!name) {
      toast.error('Enter a name')
      return
    }
    const res = await fetch(`/api/workspace/folders/${encodeURIComponent(renameFolderId)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(j.error || 'Rename failed')
      return
    }
    toast.success('Folder renamed')
    setRenameFolderId(null)
    load()
  }

  async function deleteFolder(folderId: string, name: string) {
    if (!window.confirm(`Delete folder "${name}" and all subfolders? Documents inside will become unfiled.`)) return
    const res = await fetch(`/api/workspace/folders/${encodeURIComponent(folderId)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      toast.error(j.error || 'Delete failed')
      return
    }
    toast.success('Folder deleted')
    if (selectedView.kind === 'folder' && selectedView.folderId === folderId) {
      setSelectedView({ kind: 'all' })
    }
    load()
  }

  function openShare(doc: WsDoc) {
    setShareDoc(doc)
    setShareEmail('')
    setShares([])
    setSharesLoading(true)
    fetch(`/api/workspace/items/${encodeURIComponent(doc.id)}/shares`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => setShares(j.shares || []))
      .catch(() => setShares([]))
      .finally(() => setSharesLoading(false))
  }

  async function addShare() {
    if (!shareDoc) return
    const email = shareEmail.trim().toLowerCase()
    if (!email.includes('@')) {
      toast.error('Enter a valid email')
      return
    }
    const res = await fetch(`/api/workspace/items/${encodeURIComponent(shareDoc.id)}/shares`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(j.error || 'Share failed')
      return
    }
    toast.success('Document shared')
    setShareEmail('')
    setShares((s) => [...s, j.share])
  }

  async function revokeShare(shareId: string) {
    if (!shareDoc) return
    const res = await fetch(
      `/api/workspace/items/${encodeURIComponent(shareDoc.id)}/shares/${encodeURIComponent(shareId)}`,
      { method: 'DELETE', credentials: 'include' }
    )
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      toast.error(j.error || 'Could not remove')
      return
    }
    setShares((s) => s.filter((x) => x.id !== shareId))
  }

  const folderOptions = useMemo(() => flatFolderOptions(folderRows, byParent), [folderRows, byParent])

  function renderFolderTree(parent: string | null, depth: number): ReactNode {
    const rows = byParent.get(parent) || []
    return rows.map((f) => {
      const hasKids = (byParent.get(f.id) || []).length > 0
      const isOpen = expanded.has(f.id)
      const count = docCountInTree(f.id)
      const selected = selectedView.kind === 'folder' && selectedView.folderId === f.id
      return (
        <div key={f.id} className="select-none">
          <div
            className={cn(
              'flex items-center gap-1 rounded-lg pr-2 text-left transition-colors',
              selected ? 'bg-indigo-500/25 text-indigo-200' : 'text-white/65 hover:bg-white/5 hover:text-white'
            )}
            style={{ paddingLeft: 8 + depth * 14 }}
          >
            <button
              type="button"
              className={cn('p-1 rounded shrink-0', !hasKids && 'invisible')}
              onClick={() => toggleExpand(f.id)}
              aria-label={isOpen ? 'Collapse' : 'Expand'}
            >
              {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-between gap-2 py-2 min-w-0"
              onClick={() => setSelectedView({ kind: 'folder', folderId: f.id })}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{f.icon_emoji || '📁'}</span>
                <span className="text-sm truncate">{f.name}</span>
              </span>
              <span className="text-xs text-white/35 shrink-0">{count}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 text-white/40 hover:text-white shrink-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-white/10 bg-navy-950 text-white">
                <DropdownMenuItem
                  className="focus:bg-white/10"
                  onClick={() => {
                    setFolderDialogParentId(f.id)
                    setFolderDialogOpen(true)
                  }}
                >
                  <FolderPlus className="size-4 mr-2" />
                  New subfolder
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-white/10"
                  onClick={() => {
                    setRenameFolderId(f.id)
                    setRenameFolderName(f.name)
                  }}
                >
                  <Pencil className="size-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-rose-300 focus:bg-rose-500/20 focus:text-rose-100"
                  onClick={() => deleteFolder(f.id, f.name)}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasKids && isOpen ? renderFolderTree(f.id, depth + 1) : null}
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Workspace</h1>
        <p className="text-white/60">
          {loading ? 'Loading…' : 'Organize documents in folders, share with teammates, and keep everything in one place.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        {stats.map((stat, index) => (
          <div key={index} className="glass-card p-4">
            <p className="text-white/50 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="glass"
            onClick={() => {
              setFolderDialogParentId(null)
              setFolderDialogOpen(true)
            }}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New folder
          </Button>
          <div className="flex bg-white/5 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="lg:col-span-1"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Library
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedView({ kind: 'all' })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors',
                    selectedView.kind === 'all'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>📂</span> All documents
                  </span>
                  <span className="text-xs text-white/40">{documents.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView({ kind: 'favorites' })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors',
                    selectedView.kind === 'favorites'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>⭐</span> Favorites
                  </span>
                  <span className="text-xs text-white/40">
                    {documents.filter((d) => d.isFavorite).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView({ kind: 'shared' })}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors',
                    selectedView.kind === 'shared'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Users className="size-4 opacity-70" /> Shared with you
                  </span>
                  <span className="text-xs text-white/40">
                    {documents.filter((d) => !d.isOwner).length}
                  </span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2">Folders</p>
                <div className="space-y-0.5 max-h-[min(52vh,28rem)] overflow-y-auto pr-1">
                  {renderFolderTree(null, 0)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card border-0">
            <CardContent className="p-4">
              {viewMode === 'list' ? (
                <div className="space-y-2">
                  {filteredDocuments.length === 0 ? (
                    <p className="text-white/45 text-sm py-12 text-center">No documents in this view.</p>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`${wsBase}/${doc.id}`}
                              className="text-white font-medium group-hover:text-indigo-400 transition-colors block truncate"
                            >
                              {doc.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {doc.type}
                              </Badge>
                              {!doc.isOwner && (
                                <Badge variant="outline" className="text-xs border-violet-400/40 text-violet-200">
                                  Shared
                                </Badge>
                              )}
                              {doc.folderName && (
                                <span className="text-white/35 text-xs truncate max-w-[12rem]">
                                  {doc.folderName}
                                </span>
                              )}
                              <span className="text-white/40 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {doc.date}
                              </span>
                              <Badge
                                variant={doc.status === 'completed' || doc.status === 'saved' ? 'success' : 'warning'}
                                className="text-xs capitalize"
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {doc.isOwner ? (
                            <button
                              type="button"
                              title="Favorite"
                              onClick={() => patchDoc(doc, { isFavorite: !doc.isFavorite })}
                              className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-amber-400 transition-colors"
                            >
                              <Star
                                className={cn('w-4 h-4', doc.isFavorite && 'fill-amber-400 text-amber-400')}
                              />
                            </button>
                          ) : null}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white">
                                <MoreHorizontal className="size-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-white/10 bg-navy-950 text-white min-w-[11rem]">
                              <DropdownMenuItem asChild className="focus:bg-white/10">
                                <Link href={`${wsBase}/${doc.id}`}>
                                  <FileText className="size-4 mr-2" />
                                  Open
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="focus:bg-white/10" onClick={() => downloadDoc(doc)}>
                                <Download className="size-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              {doc.isOwner ? (
                                <>
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="focus:bg-white/10">
                                      <FolderInput className="size-4 mr-2" />
                                      Move to…
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="border-white/10 bg-navy-950 text-white max-h-64 overflow-y-auto">
                                      <DropdownMenuItem
                                        className="focus:bg-white/10"
                                        onClick={() => patchDoc(doc, { folderId: null })}
                                      >
                                        Unfiled
                                      </DropdownMenuItem>
                                      {folderOptions.map((opt) => (
                                        <DropdownMenuItem
                                          key={opt.id}
                                          className="focus:bg-white/10"
                                          onClick={() => patchDoc(doc, { folderId: opt.id })}
                                        >
                                          {opt.label}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                  <DropdownMenuItem className="focus:bg-white/10" onClick={() => openShare(doc)}>
                                    <Share2 className="size-4 mr-2" />
                                    Share…
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem
                                    className="text-rose-300 focus:bg-rose-500/20"
                                    onClick={() => deleteDoc(doc)}
                                  >
                                    <Trash2 className="size-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem className="focus:bg-white/10" onClick={() => leaveShared(doc)}>
                                    <LogOut className="size-4 mr-2" />
                                    Remove from list
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDocuments.length === 0 ? (
                    <p className="text-white/45 text-sm py-12 text-center col-span-full">No documents in this view.</p>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="flex items-center gap-1">
                            {doc.isOwner ? (
                              <button
                                type="button"
                                onClick={() => patchDoc(doc, { isFavorite: !doc.isFavorite })}
                                className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-amber-400"
                              >
                                <Star
                                  className={cn('w-4 h-4', doc.isFavorite && 'fill-amber-400 text-amber-400')}
                                />
                              </button>
                            ) : (
                              <Badge variant="outline" className="text-[10px] border-violet-400/40 text-violet-200">
                                Shared
                              </Badge>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-9 text-white/50">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-white/10 bg-navy-950 text-white min-w-[10rem]">
                                <DropdownMenuItem asChild className="focus:bg-white/10">
                                  <Link href={`${wsBase}/${doc.id}`}>Open</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-white/10" onClick={() => downloadDoc(doc)}>
                                  Download
                                </DropdownMenuItem>
                                {doc.isOwner ? (
                                  <>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="focus:bg-white/10">
                                        Move to…
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="border-white/10 bg-navy-950 text-white max-h-52 overflow-y-auto">
                                        <DropdownMenuItem
                                          className="focus:bg-white/10"
                                          onClick={() => patchDoc(doc, { folderId: null })}
                                        >
                                          Unfiled
                                        </DropdownMenuItem>
                                        {folderOptions.map((opt) => (
                                          <DropdownMenuItem
                                            key={opt.id}
                                            className="focus:bg-white/10"
                                            onClick={() => patchDoc(doc, { folderId: opt.id })}
                                          >
                                            {opt.label}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuItem className="focus:bg-white/10" onClick={() => openShare(doc)}>
                                      Share…
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem
                                      className="text-rose-300 focus:bg-rose-500/20"
                                      onClick={() => deleteDoc(doc)}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem className="focus:bg-white/10" onClick={() => leaveShared(doc)}>
                                    Remove from list
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <Link
                          href={`${wsBase}/${doc.id}`}
                          className="text-white font-medium mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2"
                        >
                          {doc.title}
                        </Link>
                        <p className="text-white/50 text-sm mb-2">{doc.type}</p>
                        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
                          <span className="text-white/40 text-xs">{doc.date}</span>
                          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                            <Link href={`${wsBase}/${doc.id}`}>Open</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="border border-zinc-600 bg-black text-white shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{folderDialogParentId ? 'New subfolder' : 'New folder'}</DialogTitle>
            <DialogDescription className="text-white/60">
              Folders help you group library saves and generated documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="nf-name" className="text-white/70">
              Name
            </Label>
            <Input
              id="nf-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Q1 contracts"
              className="bg-white/5 border-white/10 text-white"
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-500 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => setFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200" onClick={createFolder} disabled={folderSaving}>
              {folderSaving ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(renameFolderId)}
        onOpenChange={(o) => {
          if (!o) setRenameFolderId(null)
        }}
      >
        <DialogContent className="border border-zinc-600 bg-black text-white shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Rename folder</DialogTitle>
          </DialogHeader>
          <Input
            value={renameFolderName}
            onChange={(e) => setRenameFolderName(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
            onKeyDown={(e) => e.key === 'Enter' && saveRenameFolder()}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-zinc-500 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => setRenameFolderId(null)}
            >
              Cancel
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200" onClick={saveRenameFolder}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(shareDoc)} onOpenChange={(o) => !o && setShareDoc(null)}>
        <DialogContent className="border border-zinc-600 bg-black text-white shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Share document</DialogTitle>
            <DialogDescription className="text-white/60">
              Invite a teammate by email. They must already have an account. Shared users can view and download; only
              you can move or delete the original.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 py-2">
            <Input
              placeholder="colleague@company.com"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Button type="button" className="bg-white text-black hover:bg-zinc-200 shrink-0" onClick={addShare}>
              Add
            </Button>
          </div>
          <div className="border border-white/10 rounded-lg divide-y divide-white/10 max-h-48 overflow-y-auto">
            {sharesLoading ? (
              <p className="p-3 text-sm text-white/50">Loading…</p>
            ) : shares.length === 0 ? (
              <p className="p-3 text-sm text-white/50">Not shared with anyone yet.</p>
            ) : (
              shares.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="truncate text-white/80">{s.email || s.sharedWithUserId}</span>
                  <Button variant="ghost" size="sm" className="text-rose-300 hover:text-rose-100" onClick={() => revokeShare(s.id)}>
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
