"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  CreditCard,
  Check,
  Zap,
  Download,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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
    id: "business",
    name: "Business",
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

const invoices = [
  { id: "INV-2024-001", date: "Mar 1, 2024", amount: 49, status: "paid" },
  { id: "INV-2024-002", date: "Feb 1, 2024", amount: 49, status: "paid" },
  { id: "INV-2024-003", date: "Jan 1, 2024", amount: 49, status: "paid" },
  { id: "INV-2023-012", date: "Dec 1, 2023", amount: 49, status: "paid" },
]

const usage = {
  aiGenerations: { used: 32, limit: 50, percentage: 64 },
  downloads: { used: 67, limit: 100, percentage: 67 },
  storage: { used: 245, limit: 1000, percentage: 24 },
}

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const currentPlan = "professional"

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
          Manage your subscription, view invoices, and track usage.
        </p>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                  <Badge variant="info">Professional</Badge>
                </div>
                <p className="text-white/60">
                  Your plan renews on <span className="text-white">April 1, 2024</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="glass">Cancel Subscription</Button>
                <Button variant="gradient">Upgrade Plan</Button>
              </div>
            </div>
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
          <div className="grid md:grid-cols-3 gap-6">
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
                    currentPlan === plan.id && "ring-2 ring-emerald-500/50"
                  )}
                >
                  {currentPlan === plan.id && (
                    <Badge className="mb-4 bg-emerald-500 text-white">Current Plan</Badge>
                  )}
                  {plan.highlighted && currentPlan !== plan.id && (
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
                    variant={currentPlan === plan.id ? "glass" : plan.highlighted ? "gradient" : "glass"}
                    className="w-full"
                    disabled={currentPlan === plan.id}
                  >
                    {currentPlan === plan.id ? "Current Plan" : "Upgrade"}
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
              <CardTitle className="text-white">Plan Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(usage).map(([key, data]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-white">
                      {data.used} / {data.limit}
                      {key === "storage" ? " MB" : ""}
                    </span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        data.percentage > 80 ? "bg-rose-500" : "bg-gradient-to-r from-indigo-500 to-indigo-400"
                      )}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-sm mt-1">
                    {data.percentage}% used this billing period
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{invoice.id}</h4>
                        <p className="text-white/50 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {invoice.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-medium">£{invoice.amount}</span>
                      <Badge variant="success" className="text-xs">
                        {invoice.status}
                      </Badge>
                      <Button variant="glass" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Method Tab */}
        <TabsContent value="payment">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-white">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Visa ending in 4242</h4>
                    <p className="text-white/50 text-sm">Expires 12/25</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" size="sm">
                    Edit
                  </Button>
                  <Button variant="glass" size="sm" className="text-rose-400">
                    Remove
                  </Button>
                </div>
              </div>
              <Button variant="glass" className="w-full mt-4">
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
