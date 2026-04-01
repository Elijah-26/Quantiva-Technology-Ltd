'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { withAuth } from '@/lib/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download } from 'lucide-react'
import { toast } from 'sonner'

function WorkspaceItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const pathname = usePathname()
  const wsBase = pathname.startsWith('/dashboard') ? '/dashboard/workspace' : '/demo/ai/dashboard/workspace'
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/workspace/items/${encodeURIComponent(id)}`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Not found')
        if (!cancelled) {
          setTitle(data.item?.title || 'Document')
          setContent(data.item?.contentText ?? null)
        }
      } catch {
        if (!cancelled) {
          setTitle('Not found')
          setContent(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  function download(ext: 'md' | 'txt') {
    if (!content) {
      toast.error('No stored text for this item')
      return
    }
    const blob = new Blob([content], { type: ext === 'md' ? 'text/markdown' : 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${title.replace(/[^\w\-]+/g, '_').slice(0, 80) || 'document'}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
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
        <h1 className="text-2xl font-bold text-white">{loading ? 'Loading…' : title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/20 text-white" onClick={() => download('md')}>
            <Download className="w-4 h-4 mr-2" />
            .md
          </Button>
          <Button variant="outline" size="sm" className="border-white/20 text-white" onClick={() => download('txt')}>
            <Download className="w-4 h-4 mr-2" />
            .txt
          </Button>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/50 text-sm">Loading…</p>
          ) : content ? (
            <pre className="text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed">
              {content}
            </pre>
          ) : (
            <p className="text-white/50 text-sm">
              This item has no stored draft text (e.g. library template only). Open the template from
              Documents or run AI Generate for a full draft.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(WorkspaceItemPage)
