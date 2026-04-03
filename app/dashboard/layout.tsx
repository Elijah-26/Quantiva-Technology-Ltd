'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield,
  LayoutDashboard,
  FileText,
  Sparkles,
  FolderOpen,
  CreditCard,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  GraduationCap,
  Library,
  BarChart3,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getCurrentUserProfile } from '@/lib/auth/user-service'
import type { DashboardActivityItem, DashboardSummaryResponse } from '@/lib/dashboard-summary'

function activityHref(a: DashboardActivityItem): string {
  if (a.kind === 'report' && a.reportExecutionId) {
    return `/dashboard/reports/${encodeURIComponent(a.reportExecutionId)}`
  }
  if (a.kind === 'workspace') return '/dashboard/workspace'
  if (a.kind === 'generation') return '/dashboard/generate'
  return '/dashboard'
}

function ActivityIcon({ kind }: { kind: DashboardActivityItem['kind'] }) {
  if (kind === 'report') return <BarChart3 className="w-4 h-4 text-violet-400 shrink-0" />
  if (kind === 'workspace') return <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
  return <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/ai-research', label: 'Academic Research', icon: GraduationCap },
  { href: '/dashboard/generate', label: 'On-Demand Document', icon: Sparkles },
  { href: '/dashboard/workspace', label: 'My Workspace', icon: FolderOpen },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/research', label: 'Market Research Intelligence', icon: Library },
  { href: '/dashboard/admin', label: 'Admin', icon: Shield },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('User')
  const [planLabel, setPlanLabel] = useState('Pro Plan')
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifWrapRef = useRef<HTMLDivElement>(null)

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/dashboard/summary', { credentials: 'include' })
      const data = await res.json().catch(() => null)
      if (res.ok && data && !data.error) setSummary(data as DashboardSummaryResponse)
    } catch {
      /* ignore */
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    void loadSummary()
  }, [user, loadSummary])

  useEffect(() => {
    if (!notifOpen) return
    void loadSummary()
  }, [notifOpen, loadSummary])

  useEffect(() => {
    if (!notifOpen) return
    const onDocMouseDown = (e: MouseEvent) => {
      const el = notifWrapRef.current
      if (el && !el.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [notifOpen])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [loading, user, router])

  useEffect(() => {
    let active = true
    async function loadProfile() {
      const { data } = await getCurrentUserProfile()
      if (!active) return
      if (data?.full_name?.trim()) setDisplayName(data.full_name.trim())
      else if (user?.email) setDisplayName(user.email.split('@')[0])
      setPlanLabel(data?.role === 'admin' ? 'Admin' : 'Pro Plan')
    }
    if (user) loadProfile()
    return () => {
      active = false
    }
  }, [user])

  const initials = useMemo(() => {
    const parts = displayName.split(' ').filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    return (parts[0]?.[0] ?? 'U').toUpperCase()
  }, [displayName])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center">
        <p className="text-white/70">Loading...</p>
      </div>
    )
  }

  // Admin routes render their own full shell; avoid double sidebars/headers.
  if (pathname.startsWith('/dashboard/admin')) {
    return <div className="dark min-h-screen bg-black text-white">{children}</div>
  }

  return (
    <div className="dark min-h-screen flex bg-black text-white">
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'fixed left-0 top-0 h-full bg-black/95 backdrop-blur-xl border-r border-white/5 z-40',
          !isSidebarOpen && 'items-center'
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-semibold text-white font-heading">Quantiva</span>
            )}
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(`${link.href}/`))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
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
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-black/90 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search documents, templates..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifWrapRef}>
              <button
                type="button"
                aria-expanded={notifOpen}
                aria-haspopup="true"
                aria-label="Activity and notifications"
                onClick={() => {
                  setNotifOpen((o) => !o)
                  setIsProfileOpen(false)
                }}
                className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {(() => {
                  const n = summary?.recentActivity?.length ?? 0
                  if (n < 1) return null
                  return (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-rose-500 text-[10px] font-semibold text-white flex items-center justify-center">
                      {n > 9 ? '9+' : n}
                    </span>
                  )
                })()}
              </button>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] rounded-xl bg-zinc-950 border border-white/10 shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">Recent activity</p>
                    <p className="text-xs text-white/45">Workspace, reports, and generations</p>
                  </div>
                  <div className="max-h-[min(60vh,20rem)] overflow-y-auto">
                    {summaryLoading && !summary?.recentActivity?.length ? (
                      <p className="px-4 py-6 text-sm text-white/50 text-center">Loading…</p>
                    ) : (summary?.recentActivity?.length ?? 0) === 0 ? (
                      <p className="px-4 py-6 text-sm text-white/50 text-center">
                        No recent activity yet. Open{' '}
                        <Link href="/dashboard/workspace" className="text-indigo-400 hover:underline">
                          Workspace
                        </Link>
                        , run research, or generate a document.
                      </p>
                    ) : (
                      <ul className="py-1">
                        {(summary?.recentActivity ?? []).map((item) => (
                          <li key={item.id}>
                            <Link
                              href={activityHref(item)}
                              onClick={() => setNotifOpen(false)}
                              className="flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                              <ActivityIcon kind={item.kind} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white/90 line-clamp-2">{item.title}</p>
                                <p className="text-xs text-white/45 mt-0.5">{item.subtitle}</p>
                                <p className="text-[10px] uppercase tracking-wide text-white/35 mt-1">
                                  {item.kind === 'report'
                                    ? 'Research'
                                    : item.kind === 'workspace'
                                      ? 'Workspace'
                                      : 'Generation'}
                                  {item.status ? ` · ${item.status}` : ''}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="border-t border-white/10 px-3 py-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setNotifOpen(false)}
                      className="block text-center text-xs text-indigo-400 hover:text-indigo-300 py-1.5"
                    >
                      View dashboard
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen)
                  setNotifOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-white/50">{planLabel}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/40" />
              </button>

              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-navy-800 border border-white/10 shadow-xl overflow-hidden"
                >
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </Link>
                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={signOut}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-black">{children}</main>
      </div>
    </div>
  )
}
