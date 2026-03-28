'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, X, MessageSquareWarning } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getModerationById,
  updateModerationItem,
} from '@/lib/demo/moderation-mock'

export default function AdminModerationDetailDemoPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''

  const item = id ? getModerationById(id) : undefined

  const goList = () => router.push('/demo/ai/admin/moderation')

  const act = (status: 'approved' | 'rejected' | 'changes_requested', label: string) => {
    if (!item) return
    updateModerationItem(item.id, { status })
    toast.success(`Demo — marked as ${label}`)
    goList()
  }

  if (!item) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-2xl font-bold text-white">Not found</h1>
        <p className="text-white/60">No moderation item matches this id.</p>
        <Button variant="glass" asChild>
          <Link href="/demo/ai/admin/moderation">Back to queue</Link>
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
          <Link href="/demo/ai/admin/moderation">
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
          <CardDescription className="text-white/50">
            Static snippet for demo review.
          </CardDescription>
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
