"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  { href: "/demo/ai/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/ai/admin/users", label: "Users", icon: Users },
  { href: "/demo/ai/admin/documents", label: "Documents", icon: FileText },
  { href: "/demo/ai/admin/scheduled-documents", label: "Scheduled documents", icon: Calendar },
  { href: "/demo/ai/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/demo/ai/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full bg-navy-900 border-r border-white/5 z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/demo/ai/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="text-xl font-semibold text-white font-heading">
                  Quantiva
                </span>
                <span className="text-xs text-rose-400 block -mt-1">Admin</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          isSidebarOpen ? "ml-[280px]" : "ml-[80px]"
        )}
      >
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-navy-900 sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-rose-500/20 text-rose-400 text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-white/50">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
