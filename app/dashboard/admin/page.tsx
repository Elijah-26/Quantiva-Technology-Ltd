'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, FileText, BarChart3, Repeat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type SummaryUser = {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  role: string
  created_at: string
}

type SummaryDoc = {
  id: string
  title: string
  category: string
  source: string | null
  updated_at: string
  download_count: number
}

type SummaryResponse = {
  counts: {
    totalUsers: number
    totalLibraryDocuments: number
    totalReports: number
    reportsThisMonth: number
    activeSchedules: number
    generationsCompletedThisMonth: number
  }
  recentUsers: SummaryUser[]
  recentLibraryDocuments: SummaryDoc[]
}

function formatShortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/summary', { credentials: 'include' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json as SummaryResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const stats = data
    ? [
        {
          label: 'Total users',
          value: data.counts.totalUsers,
          icon: Users,
          color: 'from-blue-500 to-blue-600',
        },
        {
          label: 'Library documents',
          value: data.counts.totalLibraryDocuments,
          icon: FileText,
          color: 'from-emerald-500 to-emerald-600',
        },
        {
          label: 'Reports (this month)',
          value: data.counts.reportsThisMonth,
          icon: BarChart3,
          color: 'from-amber-500 to-amber-600',
        },
        {
          label: 'Active schedules',
          value: data.counts.activeSchedules,
          icon: Repeat,
          color: 'from-rose-500 to-rose-600',
        },
      ]
    : []

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">
          Live counts and recent activity from Supabase ({loading ? 'loading…' : error ? error : 'updated'}).
        </p>
      </motion.div>

      {error && (
        <p className="text-sm text-rose-400">
          {error}.{' '}
          <button type="button" className="underline" onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {data && (
        <p className="text-xs text-white/40">
          Total reports (all time): {data.counts.totalReports}. Generations completed this month:{' '}
          {data.counts.generationsCompletedThisMonth}.
        </p>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent users</CardTitle>
              <Button variant="ghost" size="sm" className="text-rose-400" asChild>
                <Link href="/dashboard/admin/users">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(data?.recentUsers ?? []).length === 0 && !loading && (
                  <p className="text-white/50 text-sm">No users yet.</p>
                )}
                {(data?.recentUsers ?? []).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                        <span className="text-rose-400 font-medium text-sm">
                          {(u.full_name || u.email || '?')
                            .split(/\s+/)
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {u.full_name?.trim() || u.email}
                        </p>
                        <p className="text-white/50 text-xs truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {u.role}
                      </Badge>
                      <span className="text-white/40 text-xs hidden sm:inline">
                        {formatShortDate(u.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent library documents</CardTitle>
              <Button variant="ghost" size="sm" className="text-rose-400" asChild>
                <Link href="/dashboard/admin/documents">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(data?.recentLibraryDocuments ?? []).length === 0 && !loading && (
                  <p className="text-white/50 text-sm">No library documents yet.</p>
                )}
                {(data?.recentLibraryDocuments ?? []).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{doc.title}</p>
                        <p className="text-white/50 text-xs truncate">
                          {doc.category} · {doc.download_count} downloads
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {doc.source && (
                        <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                          {doc.source}
                        </Badge>
                      )}
                      <span className="text-white/40 text-xs">{formatShortDate(doc.updated_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
