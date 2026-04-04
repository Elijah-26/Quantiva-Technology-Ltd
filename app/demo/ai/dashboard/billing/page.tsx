"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { BillingSummaryResponse } from "@/lib/billing-summary"
import { PricingSection } from "@/components/pricing/PricingSection"
import type { MarketingPlanKey } from "@/lib/marketing-plans"

function usagePct(used: number, limit: number): number {
  if (limit < 0) return 0
  if (limit === 0) return 0
  return Math.min(100, Math.round((used / limit) * 100))
}

function formatLimit(used: number, limit: number): string {
  if (limit < 0) return `${used.toLocaleString()} / Unlimited`
  return `${used.toLocaleString()} / ${limit.toLocaleString()}`
}

export default function BillingPage() {
  const [summary, setSummary] = useState<BillingSummaryResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/billing/summary", { credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Failed to load billing")
      setSummary(data as BillingSummaryResponse)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load")
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get("checkout") !== "success") return
    toast.success("Checkout completed", { description: "Your plan will update once the webhook syncs." })
    void loadSummary()
    window.history.replaceState({}, "", window.location.pathname)
  }, [loadSummary])

  const currentPlanId = summary?.planId ?? null

  const handleSelectPlan = async (planKey: MarketingPlanKey) => {
    if (summary?.isAdmin) return
    if (planKey === "starter") {
      toast.message("Starter is the free tier", {
        description: "Choose Professional or Enterprise to subscribe with Stripe.",
      })
      return
    }
    setLoadingPlan(planKey)
    try {
      const baseUrl = window.location.origin
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          successUrl: `${baseUrl}/dashboard/billing?checkout=success&plan=${planKey}`,
          cancelUrl: `${baseUrl}/dashboard/billing`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.url) {
        window.location.href = data.url as string
        return
      }
      throw new Error(data.error || "Failed to create checkout session")
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
        <p className="text-white/60">
          Manage your subscription, view invoices, and track usage
          {summary ? ` · ${summary.currentYear}` : ""}.
        </p>
      </motion.div>

      {loadError && (
        <p className="text-rose-400 text-sm rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">{loadError}</p>
      )}

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            {loading && !summary ? (
              <div className="flex items-center gap-2 text-white/60">
                <Loader2 className="size-5 animate-spin" />
                Loading your plan…
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                    <Badge variant="info">{summary?.planDisplayName ?? "—"}</Badge>
                  </div>
                  <p className="text-white/80">{summary?.renewalPrimary}</p>
                  {summary?.renewalSecondary ? (
                    <p className="text-white/55 text-sm mt-2">{summary.renewalSecondary}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="glass"
                    disabled={summary?.isAdmin || currentPlanId === "starter" || !currentPlanId}
                    onClick={() =>
                      toast.message("Manage subscription", {
                        description: "Contact support or use the Stripe customer portal when enabled.",
                      })
                    }
                  >
                    Cancel subscription
                  </Button>
                  <Button
                    variant="gradient"
                    disabled={summary?.isAdmin || currentPlanId === "enterprise"}
                    onClick={() => {
                      document.getElementById("billing-plan-grid")?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    {currentPlanId === "enterprise" ? "Top tier" : "Upgrade plan"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="bg-white/5">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Method</TabsTrigger>
        </TabsList>

        {/* Plans Tab — same UI + Stripe flow as /pricing */}
        <TabsContent value="plans" className="space-y-6">
          <PricingSection
            compact
            gridId="billing-plan-grid"
            onSelectPlan={(key) => void handleSelectPlan(key)}
            isLoadingPlan={loadingPlan}
            activePlanId={
              !summary || summary.isAdmin ? undefined : (summary.planId ?? "starter")
            }
            isAdmin={!!summary?.isAdmin}
          />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Plan usage</CardTitle>
              <p className="text-white/50 text-sm">
                Counts reset on the first day of each month (UTC), aligned with your dashboard.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading && !summary ? (
                <div className="flex items-center gap-2 text-white/60">
                  <Loader2 className="size-5 animate-spin" />
                  Loading usage…
                </div>
              ) : summary ? (
                <>
                  {(
                    [
                      {
                        key: "aiGenerations",
                        label: "AI generations (this month)",
                        used: summary.usage.generationsUsedThisMonth,
                        limit: summary.usage.generationsLimit,
                      },
                      {
                        key: "researchReports",
                        label: "Research reports (this month)",
                        used: summary.usage.reportsUsedThisMonth,
                        limit: summary.usage.reportsLimit,
                      },
                    ] as const
                  ).map(({ key, label, used, limit }) => {
                    const pct = usagePct(used, limit)
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/70">{label}</span>
                          <span className="text-white tabular-nums">{formatLimit(used, limit)}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              limit < 0
                                ? "bg-gradient-to-r from-emerald-600 to-emerald-400 w-full"
                                : pct > 80
                                  ? "bg-rose-500"
                                  : "bg-gradient-to-r from-indigo-500 to-indigo-400"
                            )}
                            style={{ width: limit < 0 ? "100%" : `${pct}%` }}
                          />
                        </div>
                        <p className="text-white/40 text-sm mt-1">
                          {limit < 0 ? "Unlimited on your plan" : `${pct}% used this month`}
                        </p>
                      </div>
                    )
                  })}
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Invoice history</CardTitle>
              <p className="text-white/50 text-sm">
                Invoices from Stripe will appear here after subscription billing is connected.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/55 text-sm">
                <CreditCard className="w-10 h-10 text-white/30 mx-auto mb-3" />
                No invoices yet for {summary?.currentYear ?? new Date().getUTCFullYear()}.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Method Tab */}
        <TabsContent value="payment">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Payment method</CardTitle>
              <p className="text-white/50 text-sm">
                Cards on file are managed by Stripe when you subscribe to a paid plan.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/55 text-sm mb-4">
                No saved payment method. Use <strong className="text-white/80">Get Started</strong> on a paid
                plan to add one via Stripe Checkout.
              </div>
              <Button
                variant="glass"
                className="w-full"
                onClick={() => document.getElementById("billing-plan-grid")?.scrollIntoView({ behavior: "smooth" })}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View plans
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
