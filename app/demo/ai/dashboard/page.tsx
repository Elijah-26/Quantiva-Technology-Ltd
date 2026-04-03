"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  FileText,
  Sparkles,
  ArrowRight,
  Star,
  GraduationCap,
  FolderOpen,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import type { DashboardSummaryResponse } from "@/lib/dashboard-summary"

const quickActions = [
  { label: "On-Demand Document", icon: Sparkles, href: "/dashboard/generate", color: "from-indigo-500 to-indigo-600" },
  { label: "Browse Templates", icon: FileText, href: "/dashboard/documents", color: "from-emerald-500 to-emerald-600" },
  { label: "Academic Research", icon: GraduationCap, href: "/dashboard/new-research", color: "from-violet-500 to-violet-600" },
  { label: "View Workspace", icon: FolderOpen, href: "/dashboard/workspace", color: "from-amber-500 to-amber-600" },
]

function usageBarPercent(used: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/dashboard/summary", { credentials: "include" })
        if (!res.ok) {
          if (res.status === 401) {
            if (!cancelled) setError("Sign in to see your dashboard.")
          } else {
            if (!cancelled) setError("Could not load dashboard.")
          }
          if (!cancelled) setSummary(null)
          return
        }
        const data = (await res.json()) as DashboardSummaryResponse
        if (!cancelled) {
          setSummary(data)
          setError(null)
        }
      } catch {
        if (!cancelled) {
          setError("Could not load dashboard.")
          setSummary(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const statCards = useMemo(() => {
    if (!summary) return []
    return [
      { label: "Library templates", value: summary.stats.libraryTemplates, icon: FileText, hint: "Available to browse" },
      { label: "Workspace items", value: summary.stats.workspaceItems, icon: FolderOpen, hint: "Saved in your workspace" },
      { label: "AI generations", value: summary.stats.aiGenerationsCompleted, icon: Sparkles, hint: "Completed jobs" },
      { label: "Research reports", value: summary.stats.researchReports, icon: BarChart3, hint: "Total reports" },
    ]
  }, [summary])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-indigo-400" />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-white/80">{error || "Something went wrong."}</p>
        {error === "Sign in to see your dashboard." && (
          <Button variant="glass" className="mt-4" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    )
  }

  const { usage } = summary
  const genUnlimited = usage.generationsLimit < 0
  const repUnlimited = usage.reportsLimit < 0
  const genPct = genUnlimited ? 0 : usageBarPercent(usage.generationsUsedThisMonth, usage.generationsLimit)
  const repPct = repUnlimited ? 0 : usageBarPercent(usage.reportsUsedThisMonth, usage.reportsLimit)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {summary.greetingName}
        </h1>
        <p className="text-white/60">
          Here&apos;s what&apos;s happening with your compliance documents.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <p className="text-white/40 text-sm mt-4">{stat.hint}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                "group p-6 rounded-2xl bg-gradient-to-br transition-all duration-300 hover:scale-[1.02]",
                action.color
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.label}</h3>
              <div className="flex items-center text-white/80 text-sm">
                Get started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent activity</CardTitle>
              <Button variant="glass" size="sm" asChild>
                <Link href="/dashboard/workspace">View workspace</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.recentActivity.length === 0 ? (
                  <p className="text-white/50 text-sm py-6 text-center">
                    No recent activity yet. Generate a document or run research to see it here.
                  </p>
                ) : (
                  summary.recentActivity.map((item) => {
                    const href =
                      item.kind === "report" && item.reportExecutionId
                        ? `/dashboard/reports/${item.reportExecutionId}`
                        : item.kind === "workspace"
                          ? "/dashboard/workspace"
                          : "/dashboard/generate"
                    const typeLabel =
                      item.kind === "report"
                        ? "Research"
                        : item.kind === "workspace"
                          ? item.status || "Workspace"
                          : "AI generate"
                    const successish =
                      item.status === "completed" || item.status === "success"
                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-white font-medium truncate">{item.title}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {typeLabel}
                              </Badge>
                              <span className="text-white/40 text-xs">{item.subtitle}</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={successish ? "success" : "warning"}
                          className="text-xs shrink-0 ml-2"
                        >
                          {item.status}
                        </Badge>
                      </Link>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Recommended for You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.recommendedTemplates.length === 0 ? (
                  <p className="text-white/50 text-sm">No templates in the library yet.</p>
                ) : (
                  summary.recommendedTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{template.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h4 className="text-white font-medium text-sm">{template.title}</h4>
                      <Button variant="glass" size="sm" className="w-full mt-3" asChild>
                        <Link href={`/dashboard/documents/${template.id}`}>Use template</Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Plan usage</h3>
                <p className="text-white/50 text-sm">{summary.planLabel} · This month (UTC)</p>
              </div>
              <Button variant="glass" size="sm" asChild>
                <Link href="/dashboard/billing">Billing</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">AI generations</span>
                  <span className="text-white text-sm">
                    {genUnlimited
                      ? `${usage.generationsUsedThisMonth} · Unlimited`
                      : `${usage.generationsUsedThisMonth} / ${usage.generationsLimit}`}
                  </span>
                </div>
                {genUnlimited ? (
                  <p className="text-white/40 text-xs">No monthly cap on your plan.</p>
                ) : (
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
                      style={{ width: `${genPct}%` }}
                    />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Research reports</span>
                  <span className="text-white text-sm">
                    {repUnlimited
                      ? `${usage.reportsUsedThisMonth} · Unlimited`
                      : `${usage.reportsUsedThisMonth} / ${usage.reportsLimit}`}
                  </span>
                </div>
                {repUnlimited ? (
                  <p className="text-white/40 text-xs">No monthly cap on your plan.</p>
                ) : (
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${repPct}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
