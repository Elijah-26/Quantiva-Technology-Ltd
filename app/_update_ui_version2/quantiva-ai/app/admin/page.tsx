"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    label: "Total Users",
    value: "2,847",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Documents",
    value: "12,543",
    change: "+28%",
    trend: "up",
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    label: "Revenue",
    value: "£48,290",
    change: "+15%",
    trend: "up",
    icon: DollarSign,
    color: "from-amber-500 to-amber-600",
  },
  {
    label: "Active Sessions",
    value: "342",
    change: "-5%",
    trend: "down",
    icon: Activity,
    color: "from-rose-500 to-rose-600",
  },
]

const recentUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", plan: "Professional", status: "active", joined: "2 hours ago" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", plan: "Business", status: "active", joined: "5 hours ago" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", plan: "Starter", status: "pending", joined: "1 day ago" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", plan: "Professional", status: "active", joined: "2 days ago" },
]

const recentDocuments = [
  { id: 1, title: "GDPR Privacy Policy", type: "Privacy", status: "published", author: "John Doe", date: "2 hours ago" },
  { id: 2, title: "Terms of Service", type: "Legal", status: "published", author: "Jane Smith", date: "5 hours ago" },
  { id: 3, title: "Employment Contract", type: "HR", status: "draft", author: "Bob Johnson", date: "1 day ago" },
  { id: 4, title: "Cookie Policy", type: "Privacy", status: "published", author: "Alice Williams", date: "2 days ago" },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">
          Overview of your platform's performance and activity.
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
            <Card className="bg-white/5 border-white/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/50 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-rose-400" />
                  )}
                  <span className={stat.trend === "up" ? "text-emerald-400 text-sm" : "text-rose-400 text-sm"}>
                    {stat.change}
                  </span>
                  <span className="text-white/40 text-sm">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white/5 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Users</CardTitle>
              <Button variant="ghost" size="sm" className="text-rose-400" asChild>
                <Link href="/admin/users">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <span className="text-rose-400 font-medium">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-white/50 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {user.plan}
                      </Badge>
                      <Badge
                        variant={user.status === "active" ? "success" : "warning"}
                        className="text-xs"
                      >
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white/5 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Recent Documents</CardTitle>
              <Button variant="ghost" size="sm" className="text-rose-400" asChild>
                <Link href="/admin/documents">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{doc.title}</p>
                        <p className="text-white/50 text-xs">{doc.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {doc.type}
                      </Badge>
                      <Badge
                        variant={doc.status === "published" ? "success" : "warning"}
                        className="text-xs"
                      >
                        {doc.status}
                      </Badge>
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
