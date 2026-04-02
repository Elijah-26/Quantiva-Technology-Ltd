'use client'

import { useEffect, useMemo, useState } from 'react'
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
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  GraduationCap,
  BookMarked,
  Library,
  ScrollText,
  Wand2,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getCurrentUserProfile } from '@/lib/auth/user-service'

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/documents/generate', label: 'Generate to library', icon: Wand2 },
  { href: '/dashboard/ai-research', label: 'Research wizard', icon: GraduationCap },
  { href: '/dashboard/ai-research/projects', label: 'Research projects', icon: BookMarked },
  { href: '/dashboard/generate', label: 'AI Generate', icon: Sparkles },
  { href: '/dashboard/workspace', label: 'My Workspace', icon: FolderOpen },
  { href: '/dashboard/compliance/activity', label: 'Activity log', icon: ScrollText },
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
            const underPrefix = pathname.startsWith(`${link.href}/`)
            const isDocLibrary = link.href === '/dashboard/documents'
            const onGenerateLibrary = pathname.startsWith('/dashboard/documents/generate')
            const isActive =
              pathname === link.href ||
              (link.href !== '/dashboard' &&
                underPrefix &&
                !(isDocLibrary && onGenerateLibrary))
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
            <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">Profile</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
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
