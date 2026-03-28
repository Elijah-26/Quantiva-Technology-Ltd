"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  FileText,
  Sparkles,
  Download,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
  MoreHorizontal,
  Star,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data
const stats = [
  { label: "Documents Generated", value: 24, change: "+12%", icon: FileText },
  { label: "AI Generations", value: 156, change: "+28%", icon: Sparkles },
  { label: "Downloads", value: 89, change: "+5%", icon: Download },
  { label: "Time Saved", value: "48h", change: "+15%", icon: Clock },
]

const recentDocuments = [
  { id: 1, title: "GDPR Privacy Policy", type: "Privacy", date: "2 hours ago", status: "completed" },
  { id: 2, title: "Terms of Service", type: "Legal", date: "Yesterday", status: "completed" },
  { id: 3, title: "Employee Handbook", type: "HR", date: "3 days ago", status: "draft" },
  { id: 4, title: "Cookie Policy", type: "Privacy", date: "1 week ago", status: "completed" },
]

const recommendedTemplates = [
  { id: 1, title: "Data Processing Agreement", category: "GDPR", popularity: 98 },
  { id: 2, title: "Non-Disclosure Agreement", category: "Contracts", popularity: 95 },
  { id: 3, title: "Software License Agreement", category: "Technology", popularity: 92 },
]

const quickActions = [
  { label: "Generate Document", icon: Sparkles, href: "/demo/ai/dashboard/generate", color: "from-indigo-500 to-indigo-600" },
  { label: "Browse Templates", icon: FileText, href: "/demo/ai/dashboard/documents", color: "from-emerald-500 to-emerald-600" },
  { label: "Research wizard", icon: GraduationCap, href: "/demo/ai/dashboard/research", color: "from-violet-500 to-violet-600" },
  { label: "View Workspace", icon: Shield, href: "/demo/ai/dashboard/workspace", color: "from-amber-500 to-amber-600" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, John! 👋
        </h1>
        <p className="text-white/60">
          Here's what's happening with your compliance documents.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                <div className="flex items-center gap-1 mt-4">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">{stat.change}</span>
                  <span className="text-white/40 text-sm">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Documents</CardTitle>
              <Button variant="glass" size="sm" asChild>
                <Link href="/demo/ai/dashboard/workspace">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{doc.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {doc.type}
                          </Badge>
                          <span className="text-white/40 text-xs">{doc.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={doc.status === "completed" ? "success" : "warning"}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
                      <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Templates */}
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
                {recommendedTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs">{template.popularity}%</span>
                      </div>
                    </div>
                    <h4 className="text-white font-medium text-sm">{template.title}</h4>
                    <Button variant="glass" size="sm" className="w-full mt-3">
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="glass-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Plan Usage</h3>
                <p className="text-white/50 text-sm">Pro Plan - Monthly</p>
              </div>
              <Button variant="glass" size="sm" asChild>
                <Link href="/demo/ai/dashboard/billing">Upgrade</Link>
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">AI Generations</span>
                  <span className="text-white text-sm">45 / 50</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[90%] bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Downloads</span>
                  <span className="text-white text-sm">67 / 100</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[67%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
