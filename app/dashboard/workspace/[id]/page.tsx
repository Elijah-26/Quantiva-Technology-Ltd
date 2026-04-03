'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { withAuth } from '@/lib/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileStack } from 'lucide-react'
import { toast } from 'sonner'

type ItemPayload = {
  title: string
  contentText: string | null
  libraryDocumentId: string | null
  folderName: string | null
  isOwner: boolean
}

function WorkspaceItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const pathname = usePathname()
  const wsBase = pathname.startsWith('/dashboard') ? '/dashboard/workspace' : '/demo/ai/dashboard/workspace'
  const [item, setItem] = useState<ItemPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch(`/api/workspace/items/${encodeURIComponent(id)}`, {
      credentials: 'include',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Not found')
    const it = data.item
    setItem({
      title: it.title || 'Document',
      contentText: it.contentText ?? null,
      libraryDocumentId: it.libraryDocumentId ?? null,
      folderName: it.folderName ?? null,
      isOwner: Boolean(it.isOwner),
    })
  }, [id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await load()
      } catch {
        if (!cancelled) setItem(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  const title = item?.title ?? 'Document'
  const content = item?.contentText ?? null
  const libraryId = item?.libraryDocumentId ?? null

  async function downloadBody(text: string, ext: 'md' | 'txt') {
    const blob = new Blob([text], { type: ext === 'md' ? 'text/markdown' : 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${title.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'document'}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function download(ext: 'md' | 'txt') {
    if (!content) {
      toast.error('No stored draft for this item')
      return
    }
    downloadBody(content, ext)
  }

  async function downloadFromLibrary(ext: 'md' | 'txt') {
    if (!libraryId) {
      toast.error('Not linked to a library document')
      return
    }
    try {
      const res = await fetch(`/api/library-documents/${encodeURIComponent(libraryId)}`, {
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.document) {
        toast.error('Could not load library document')
        return
      }
      const text =
        (data.document.fullContent as string) || (data.document.preview as string) || ''
      if (!text.trim()) {
        toast.error('Library document has no body yet')
        return
      }
      downloadBody(text, ext)
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-white/70">
        <Link href={wsBase}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Workspace
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{loading ? 'Loading…' : title}</h1>
          {!loading && item && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {item.folderName && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {item.folderName}
                </Badge>
              )}
              {!item.isOwner && (
                <Badge variant="outline" className="text-xs border-violet-400/40 text-violet-200">
                  Shared with you · view only
                </Badge>
              )}
              {libraryId && (
                <Badge variant="outline" className="text-xs border-white/20 text-white/60 gap-1">
                  <FileStack className="size-3" />
                  Library link
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white"
            disabled={!content}
            onClick={() => download('md')}
          >
            <Download className="w-4 h-4 mr-2" />
            Draft .md
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white"
            disabled={!content}
            onClick={() => download('txt')}
          >
            <Download className="w-4 h-4 mr-2" />
            Draft .txt
          </Button>
          {libraryId ? (
            <>
              <Button variant="glass" size="sm" onClick={() => downloadFromLibrary('md')}>
                <Download className="w-4 h-4 mr-2" />
                Library .md
              </Button>
              <Button variant="glass" size="sm" onClick={() => downloadFromLibrary('txt')}>
                <Download className="w-4 h-4 mr-2" />
                Library .txt
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/50 text-sm">Loading…</p>
          ) : !item ? (
            <p className="text-white/50 text-sm">We could not load this document.</p>
          ) : content ? (
            <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {content}
            </pre>
          ) : (
            <p className="text-white/50 text-sm">
              No workspace draft is stored yet. If this came from the library, use <strong>Library .md</strong> to
              download the template body. Generate an on-demand document to get a full draft here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(WorkspaceItemPage)
