'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type ModerationItem = {
  id: string
  title: string
  submittedBy: string
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  submittedAt: string
  snippet: string
  category: string
}

function statusBadge(status: ModerationItem['status']) {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">Pending</Badge>
    case 'approved':
      return <Badge className="bg-emerald-600">Approved</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    case 'changes_requested':
      return <Badge className="bg-amber-600">Changes</Badge>
    default:
      return null
  }
}

export default function AdminModerationPage() {
  const pathname = usePathname()
  const base = pathname.includes('/dashboard/admin') ? '/dashboard/admin/moderation' : '/demo/ai/admin/moderation'

  const [items, setItems] = useState<ModerationItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/moderation', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        if (!cancelled) setItems(data.items || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pathname])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Moderation queue</h1>
        <p className="text-white/60">
          Submissions from Supabase (<code className="text-xs">moderation_items</code>). Admin only.
        </p>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 text-rose-400" />
            <CardTitle className="text-white">Queue</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Open a row to approve, reject, or request changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/70">Title</TableHead>
                <TableHead className="text-white/70">Submitter</TableHead>
                <TableHead className="text-white/70">Category</TableHead>
                <TableHead className="text-white/70">Status</TableHead>
                <TableHead className="text-right text-white/70">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id} className="border-white/10">
                  <TableCell className="font-medium text-white">
                    <Link
                      href={`${base}/${encodeURIComponent(row.id)}`}
                      className="hover:text-rose-400 hover:underline"
                    >
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-white/70">{row.submittedBy}</TableCell>
                  <TableCell className="text-white/60">{row.category}</TableCell>
                  <TableCell>{statusBadge(row.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`${base}/${encodeURIComponent(row.id)}`}
                      className="text-sm text-rose-400 hover:underline"
                    >
                      Review
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  )
}
