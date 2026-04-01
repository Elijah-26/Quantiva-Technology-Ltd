'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { withAuth } from '@/lib/auth/protected-route'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'

type AuditRow = {
  id: string
  created_at: string
  action: string
  entity_type: string
  entity_id: string | null
  organization_id: string | null
  metadata: Record<string, unknown>
}

function ActivityPage() {
  const [events, setEvents] = useState<AuditRow[]>([])
  const [scope, setScope] = useState<'own' | 'all'>('own')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/audit?limit=200', { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        if (!cancelled) {
          setEvents(data.events || [])
          setScope(data.scope === 'all' ? 'all' : 'own')
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
  }, [])

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-white/70">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Activity log</h1>
          <p className="text-white/60 text-sm mt-1">
            Immutable record of key actions on your account
            {scope === 'all' ? ' (admin: all users).' : '.'}
          </p>
        </div>
        <Button variant="outline" asChild className="border-white/20 text-white shrink-0">
          <a href="/api/audit?format=csv&limit=500" download>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </a>
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent events</CardTitle>
          <CardDescription className="text-white/50">
            Generations, reports, workspace saves, and organization changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : error ? (
            <p className="text-rose-400 text-sm">{error}</p>
          ) : events.length === 0 ? (
            <p className="text-white/50 text-sm">No events yet.</p>
          ) : (
            <div className="rounded-md border border-white/10 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/70">When</TableHead>
                    <TableHead className="text-white/70">Action</TableHead>
                    <TableHead className="text-white/70">Entity</TableHead>
                    <TableHead className="text-white/70">Id</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id} className="border-white/10">
                      <TableCell className="text-white/80 text-sm whitespace-nowrap">
                        {new Date(ev.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {ev.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/80 text-sm">
                        {ev.entity_type}
                      </TableCell>
                      <TableCell className="text-white/50 text-xs font-mono max-w-[180px] truncate">
                        {ev.entity_id || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(ActivityPage)
