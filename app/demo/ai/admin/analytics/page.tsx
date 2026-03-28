'use client'

import { useMemo, useState } from 'react'
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

const CHART_ROWS = [
  { name: 'Mon', generations: 420, signups: 24 },
  { name: 'Tue', generations: 380, signups: 18 },
  { name: 'Wed', generations: 510, signups: 31 },
  { name: 'Thu', generations: 490, signups: 22 },
  { name: 'Fri', generations: 600, signups: 40 },
  { name: 'Sat', generations: 280, signups: 12 },
  { name: 'Sun', generations: 260, signups: 10 },
]

const CSV_ROWS = [
  ['weekday', 'generations', 'signups'],
  ...CHART_ROWS.map((r) => [r.name, String(r.generations), String(r.signups)]),
]

export default function AdminAnalyticsDemoPage() {
  const [range, setRange] = useState('30d')

  const kpis = useMemo(
    () => [
      { label: 'MAU (demo)', value: '12.4k', hint: RANGE_LABELS[range] },
      { label: 'Generations / period', value: '48.2k', hint: RANGE_LABELS[range] },
      { label: 'Trial → paid', value: '3.8%', hint: RANGE_LABELS[range] },
      { label: 'Churn (demo)', value: '1.2%', hint: RANGE_LABELS[range] },
    ],
    [range]
  )

  const exportCsv = () => {
    const csv = CSV_ROWS.map((row) => row.join(',')).join('\n')
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
            Demo KPIs and chart — date range is local UI only; data is static.
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
            <CardTitle className="text-white">Activity (sample)</CardTitle>
          </div>
          <CardDescription className="text-white/50">
            Recharts bar chart — same pattern as regulatory guardrail dashboards.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_ROWS} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
