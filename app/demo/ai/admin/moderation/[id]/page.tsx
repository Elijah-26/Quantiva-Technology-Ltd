'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, X, MessageSquareWarning } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Item = {
  id: string
  title: string
  submittedBy: string
  status: string
  submittedAt: string
  snippet: string
  category: string
}

export default function AdminModerationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const id = typeof params.id === 'string' ? params.id : ''
  const listHref = pathname.includes('/dashboard/admin')
    ? '/dashboard/admin/moderation'
    : '/demo/ai/admin/moderation'

  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/moderation/${encodeURIComponent(id)}`, {
          credentials: 'include',
        })
        const data = await res.json().catch(() => ({}))
        if (!cancelled) {
          if (res.ok) setItem(data.item)
          else setItem(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const goList = () => router.push(listHref)

  const act = async (status: 'approved' | 'rejected' | 'changes_requested', label: string) => {
    if (!item) return
    const res = await fetch(`/api/admin/moderation/${encodeURIComponent(item.id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(`Marked as ${label}`)
      goList()
    } else {
      const j = await res.json().catch(() => ({}))
      toast.error(j.error || 'Update failed')
    }
  }

  if (loading) {
    return <p className="text-white/60 py-8">Loading…</p>
  }

  if (!item) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Not found</h1>
        <p className="text-white/60">No moderation item matches this id.</p>
        <Button variant="glass" asChild>
          <Link href={listHref}>Back to queue</Link>
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="text-white/70">
          <Link href={listHref}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">{item.title}</h1>
          <p className="text-sm text-white/50">
            {item.submittedBy} · {item.category} · {item.submittedAt.slice(0, 10)}
          </p>
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Content preview</CardTitle>
          <CardDescription className="text-white/50">From Supabase moderation_items.snippet</CardDescription>
        </CardHeader>
        <CardContent>
          <blockquote className="rounded-xl border border-white/10 bg-navy-900/80 p-4 text-white/80">
            {item.snippet}
          </blockquote>
          <p className="mt-3 text-xs text-white/40">
            Current status: <span className="text-white/70">{item.status}</span>
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
          type="button"
          onClick={() => act('approved', 'approved')}
        >
          <Check className="size-4" />
          Approve
        </Button>
        <Button variant="destructive" type="button" onClick={() => act('rejected', 'rejected')}>
          <X className="size-4" />
          Reject
        </Button>
        <Button
          variant="secondary"
          type="button"
          className="bg-amber-600 text-white hover:bg-amber-700"
          onClick={() => act('changes_requested', 'changes requested')}
        >
          <MessageSquareWarning className="size-4" />
          Request changes
        </Button>
      </div>
    </motion.div>
  )
}
