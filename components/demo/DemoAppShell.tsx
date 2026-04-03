'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Sparkles,
  Shield,
  FileText,
  LineChart,
  ClipboardCheck,
  Puzzle,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Home,
  LogIn,
  UserPlus,
  KeyRound,
  Rocket,
  FolderOpen,
  CreditCard,
  Settings,
  GraduationCap,
  Users,
  ClipboardList,
  Library,
  BarChart3,
  PanelLeft,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Routes that already ship their own full app layout (sidebar + header). */
function routeHasInnerDemoChrome(pathname: string | null) {
  if (!pathname) return false
  if (pathname === '/demo/ai' || pathname === '/demo/ai/') return true
  if (pathname.startsWith('/demo/ai/dashboard')) return true
  if (pathname.startsWith('/demo/ai/admin')) return true
  return false
}

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

type NavGroup = { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Start',
    items: [
      { href: '/demo', label: 'Demo home', icon: Home },
      { href: '/demo/ai/dashboard', label: 'User app (dashboard)', icon: LayoutDashboard },
    ],
  },
  {
    title: 'User app',
    items: [
      { href: '/demo/ai/dashboard/documents', label: 'Documents', icon: FileText },
      { href: '/demo/ai/dashboard/generate', label: 'On-Demand Document', icon: Sparkles },
      { href: '/demo/ai/dashboard/workspace', label: 'Workspace', icon: FolderOpen },
      { href: '/demo/ai/dashboard/billing', label: 'Billing', icon: CreditCard },
      { href: '/demo/ai/dashboard/settings', label: 'Settings', icon: Settings },
      { href: '/demo/ai/dashboard/research', label: 'Academic Research', icon: GraduationCap },
    ],
  },
  {
    title: 'Auth (demo)',
    items: [
      { href: '/demo/ai/auth/signin', label: 'Sign in', icon: LogIn },
      { href: '/demo/ai/auth/signup', label: 'Sign up', icon: UserPlus },
      { href: '/demo/ai/auth/forgot-password', label: 'Forgot password', icon: KeyRound },
      { href: '/demo/ai/auth/onboarding', label: 'Onboarding', icon: Rocket },
    ],
  },
  {
    title: 'Marketing',
    items: [{ href: '/demo/ai', label: 'Product landing', icon: Sparkles }],
  },
  {
    title: 'Admin (demo)',
    items: [
      { href: '/demo/ai/admin', label: 'Admin home', icon: Shield },
      { href: '/demo/ai/admin/users', label: 'Users', icon: Users },
      { href: '/demo/ai/admin/documents', label: 'Documents', icon: FileText },
      { href: '/demo/ai/admin/moderation', label: 'Moderation', icon: ClipboardList },
      { href: '/demo/ai/admin/templates', label: 'Templates', icon: Library },
      { href: '/demo/ai/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/demo/ai/admin/settings', label: 'Admin settings', icon: Settings },
    ],
  },
  {
    title: 'Other demos',
    items: [
      { href: '/demo/market-research', label: 'Market intelligence', icon: LineChart },
      { href: '/demo/compliance-check', label: 'Compliance playground', icon: ClipboardCheck },
      { href: '/demo/extension', label: 'Extension hub', icon: Puzzle },
      { href: '/demo/extension/panel', label: 'Extension panel', icon: PanelLeft },
      { href: '/demo/extension/sync', label: 'Extension sync', icon: RefreshCw },
    ],
  },
  {
    title: 'Live product',
    items: [
      { href: '/dashboard/regulatory-guardrail', label: 'Regulatory Guardrail', icon: Shield },
      { href: '/dashboard', label: 'Live dashboard', icon: ExternalLink },
    ],
  },
]

function pathMatchesNavHref(pathname: string, href: string): boolean {
  if (href === '/demo') return pathname === '/demo'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function bestMatchingNavHref(pathname: string): string | null {
  const hrefs = [...new Set(NAV_GROUPS.flatMap((g) => g.items).map((i) => i.href))].sort(
    (a, b) => b.length - a.length
  )
  for (const h of hrefs) {
    if (pathMatchesNavHref(pathname, h)) return h
  }
  return null
}

export function DemoAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const innerChrome = routeHasInnerDemoChrome(pathname)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeHref = useMemo(() => (pathname ? bestMatchingNavHref(pathname) : null), [pathname])

  if (innerChrome) {
    return <>{children}</>
  }

  const NavBody = (
    <>
      <div className="flex h-14 items-center justify-between gap-2 border-b border-slate-200 px-4 lg:h-16">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Quantiva</p>
            <p className="truncate text-xs text-slate-500">Product demo shell</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="size-5" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-5">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = activeHref === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-indigo-50 font-medium text-indigo-900'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <Icon className={cn('size-4 shrink-0', isActive ? 'text-indigo-600' : 'text-slate-500')} />
                      <span className="truncate">{item.label}</span>
                      {isActive ? <ChevronRight className="ml-auto size-4 shrink-0 text-indigo-400" /> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  )

  return (
    <div className="flex min-h-0 flex-1 bg-slate-100">
      <aside
        className={cn(
          'z-50 flex w-[min(280px,88vw)] shrink-0 flex-col border-r border-slate-200 bg-white shadow-lg transition-transform duration-200',
          'fixed bottom-0 left-0 top-0 lg:static lg:top-auto lg:h-auto lg:w-64 lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {NavBody}
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close menu overlay"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 border-slate-200"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">Quantiva demos</p>
            <p className="truncate text-xs text-slate-500">Use the menu to move between flows</p>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
