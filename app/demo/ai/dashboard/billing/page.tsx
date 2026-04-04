"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { CreditCard, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { BillingSummaryResponse } from "@/lib/billing-summary"
import type { SubscriptionPlan } from "@/lib/plan-limits"

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    description: "Perfect for individuals and small projects",
    features: [
      "5 AI generations/month",
      "10 downloads/month",
      "Access to free templates",
      "Basic search",
      "Email support",
    ],
    notIncluded: [
      "API access",
      "Team collaboration",
      "Priority support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 49,
    description: "For growing businesses and teams",
    features: [
      "50 AI generations/month",
      "100 downloads/month",
      "All Pro templates",
      "Advanced search & filters",
      "Priority support",
      "API access",
      "Team collaboration",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    description: "For organizations with advanced needs",
    features: [
      "Unlimited AI generations",
      "Unlimited downloads",
      "All Business templates",
      "Custom document requests",
      "Dedicated account manager",
      "SSO & advanced security",
      "Custom integrations",
    ],
  },
]

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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [summary, setSummary] = useState<BillingSummaryResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null)

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

  async function startStripeCheckout(plan: SubscriptionPlan) {
    if (plan === "starter") {
      toast.message("Starter is free", { description: "Pick Professional or Enterprise to subscribe." })
      return
    }
    setCheckoutPlan(plan)
    try {
      const origin = window.location.origin
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          successUrl: `${origin}/dashboard/billing?checkout=success`,
          cancelUrl: `${origin}/dashboard/billing`,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Could not start checkout")
      if (data.url) {
        window.location.href = data.url as string
        return
      }
      throw new Error("No checkout URL returned")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed")
    } finally {
      setCheckoutPlan(null)
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

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn("text-sm", billingCycle === "monthly" ? "text-white" : "text-white/50")}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative w-14 h-7 rounded-full bg-white/10 transition-colors"
            >
              <div
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-indigo-500 transition-all duration-300",
                  billingCycle === "annual" ? "left-8" : "left-1"
                )}
              />
            </button>
            <span className={cn("text-sm", billingCycle === "annual" ? "text-white" : "text-white/50")}>
              Annual
              <span className="ml-2 text-xs text-emerald-400">Save 20%</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div id="billing-plan-grid" className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    "h-full rounded-2xl p-6 transition-all duration-300",
                    plan.highlighted
                      ? "bg-gradient-to-b from-indigo-500/20 to-indigo-600/10 border-2 border-indigo-500/50"
                      : "glass-card hover:bg-white/[0.06]",
                    currentPlanId === plan.id && "ring-2 ring-emerald-500/50"
                  )}
                >
                  {currentPlanId === plan.id && (
                    <Badge className="mb-4 bg-emerald-500 text-white">Current Plan</Badge>
                  )}
                  {plan.highlighted && currentPlanId !== plan.id && (
                    <Badge className="mb-4 bg-indigo-500 text-white">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/50 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      £{billingCycle === "monthly" ? plan.price : Math.round(plan.price * 0.8)}
                    </span>
                    <span className="text-white/50">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/70 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white/30 text-xs">-</span>
                        </span>
                        <span className="text-white/30 text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={
                      currentPlanId === plan.id ? "glass" : plan.highlighted ? "gradient" : "glass"
                    }
                    className="w-full"
                    disabled={
                      currentPlanId === plan.id ||
                      checkoutPlan === plan.id ||
                      (plan.id === "starter" && currentPlanId != null && currentPlanId !== "starter")
                    }
                    onClick={() => void startStripeCheckout(plan.id as SubscriptionPlan)}
                  >
                    {checkoutPlan === plan.id ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Redirecting…
                      </>
                    ) : currentPlanId === plan.id ? (
                      "Current plan"
                    ) : plan.id === "starter" && currentPlanId != null && currentPlanId !== "starter" ? (
                      "Lower tier"
                    ) : plan.id === "starter" ? (
                      "Free"
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
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
                No saved payment method. Use <strong className="text-white/80">Subscribe</strong> on a paid
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
