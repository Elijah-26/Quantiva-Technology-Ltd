'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  BarChart3,
  Menu,
  X,
  ClipboardList,
  Library,
  ArrowLeft,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/admin/scheduled-documents', label: 'Scheduled documents', icon: Calendar },
  { href: '/dashboard/admin/moderation', label: 'Moderation', icon: ClipboardList },
  { href: '/dashboard/admin/templates', label: 'Templates', icon: Library },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="dark min-h-screen flex bg-black text-white">
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full bg-black border-r border-white/5 z-40"
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/dashboard/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="text-xl font-semibold text-white font-heading">Quantiva</span>
                <span className="text-xs text-rose-400 block -mt-1">Admin</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive ? 'bg-rose-500/20 text-rose-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </motion.aside>

      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300 bg-black',
          isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'
        )}
      >
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </header>

        <main className="flex-1 p-6 bg-black">{children}</main>
      </div>
    </div>
  )
}
