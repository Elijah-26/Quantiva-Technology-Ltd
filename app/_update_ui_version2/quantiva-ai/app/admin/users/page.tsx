"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Ban,
  Check,
  Shield,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", plan: "Professional", status: "active", role: "user", joined: "Mar 26, 2024", lastActive: "2 hours ago" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", plan: "Business", status: "active", role: "user", joined: "Mar 25, 2024", lastActive: "5 hours ago" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", plan: "Starter", status: "pending", role: "user", joined: "Mar 24, 2024", lastActive: "1 day ago" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", plan: "Professional", status: "active", role: "user", joined: "Mar 22, 2024", lastActive: "2 days ago" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", plan: "Business", status: "suspended", role: "user", joined: "Mar 20, 2024", lastActive: "1 week ago" },
  { id: 6, name: "Admin User", email: "admin@quantiva.world", plan: "Enterprise", status: "active", role: "admin", joined: "Jan 1, 2024", lastActive: "Just now" },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
        <p className="text-white/60">
          Manage user accounts, subscriptions, and permissions.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Users", value: 2847 },
          { label: "Active", value: 2456 },
          { label: "Pending", value: 123 },
          { label: "Suspended", value: 45 },
        ].map((stat, index) => (
          <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-white/50 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "pending", "suspended"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize",
                selectedStatus === status
                  ? "bg-rose-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-white/5 border-white/5">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-white/50 text-sm font-medium">User</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Plan</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Role</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Joined</th>
                    <th className="text-left p-4 text-white/50 text-sm font-medium">Last Active</th>
                    <th className="text-right p-4 text-white/50 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                            <span className="text-rose-400 font-medium">
                              {user.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-white/50 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs">
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            user.status === "active"
                              ? "success"
                              : user.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs capitalize"
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {user.role === "admin" ? (
                            <Shield className="w-4 h-4 text-rose-400" />
                          ) : (
                            <User className="w-4 h-4 text-white/40" />
                          )}
                          <span className="text-white/70 text-sm capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/70 text-sm">{user.joined}</td>
                      <td className="p-4 text-white/70 text-sm">{user.lastActive}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-emerald-400 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-rose-400 transition-colors">
                            <Ban className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
