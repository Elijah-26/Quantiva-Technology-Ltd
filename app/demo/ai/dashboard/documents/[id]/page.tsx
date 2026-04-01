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
  readMinutes: number
  complexity: 'Low' | 'Moderate' | 'High'
  versions: { version: string; date: string; note: string }[]
  relatedIds: string[]
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

  const saveToWorkspace = async () => {
    if (!doc) return
    const res = await fetch('/api/workspace/items/from-library', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        libraryDocumentId: doc.id,
        folderSlug: doc.category === 'privacy' ? 'gdpr' : 'contracts',
      }),
    })
    if (res.ok) toast.success('Saved to workspace')
    else {
      const j = await res.json().catch(() => ({}))
      toast.error(j.error || 'Could not save')
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
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{doc.title}</h1>
            <p className="text-sm text-white/50">{doc.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="gradient"
            onClick={() => toast.success('Export is managed per plan — document is in your library.')}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button variant="glass" type="button" onClick={saveToWorkspace}>
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
              <CardTitle className="text-white">Preview</CardTitle>
              <CardDescription className="text-white/50">
                Excerpt from Supabase library template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/10 bg-navy-900/80 p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap text-white/80">
                {doc.preview}
              </div>
            </CardContent>
          </Card>

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
    </div>
  )
}
