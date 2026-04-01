'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Download } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const RANGE_LABELS: Record<string, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

export default function AdminAnalyticsDemoPage() {
  const [range, setRange] = useState('30d')
  const [chartRows, setChartRows] = useState<{ name: string; generations: number; signups: number }[]>([])
  const [kpisData, setKpisData] = useState({
    totalUsers: 0,
    reportsInRange: 0,
    activeSchedules: 0,
    generationsInRange: 0,
    moderationPending: 0,
  })
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`, { credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        if (!cancelled) {
          setChartRows(data.chart || [])
          setKpisData(
            data.kpis ?? {
              totalUsers: 0,
              reportsInRange: 0,
              activeSchedules: 0,
              generationsInRange: 0,
              moderationPending: 0,
            }
          )
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [range])

  const kpis = useMemo(
    () => [
      { label: 'Registered users', value: String(kpisData.totalUsers), hint: RANGE_LABELS[range] },
      { label: 'Reports (range)', value: String(kpisData.reportsInRange), hint: RANGE_LABELS[range] },
      { label: 'Active schedules', value: String(kpisData.activeSchedules), hint: 'Live recurring' },
      { label: 'Moderation pending', value: String(kpisData.moderationPending), hint: 'Queue' },
    ],
    [range, kpisData]
  )

  const exportCsv = () => {
    const rows = [
      ['date', 'generations', 'signups'],
      ...chartRows.map((r) => [r.name, String(r.generations), String(r.signups)]),
    ]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `demo-analytics-${range}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Demo CSV downloaded')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-white/60">
            KPIs and report volume by day from Supabase (admin only).{loadError && ` ${loadError}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px] border-white/10 bg-navy-900/80 text-white">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            type="button"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={exportCsv}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((m) => (
          <Card key={m.label} className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <p className="text-sm text-white/50">{m.label}</p>
              <p className="text-2xl font-semibold text-white">{m.value}</p>
              <p className="text-xs text-white/35 mt-1">{m.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-rose-400" />
            <CardTitle className="text-white">Reports by day</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Count of reports with run_at in the selected range (signups column reserved).
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.45)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              <Bar dataKey="generations" fill="#f43f5e" name="Generations" radius={[4, 4, 0, 0]} />
              <Bar dataKey="signups" fill="#818cf8" name="Signups" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
