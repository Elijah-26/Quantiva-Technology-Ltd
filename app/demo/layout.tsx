import Link from 'next/link'
import { DemoAppShell } from '@/components/demo/DemoAppShell'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-[100] shrink-0 border-b border-amber-500/30 bg-amber-950/95 px-4 py-2 text-center text-sm text-amber-50 backdrop-blur-sm">
        <span className="font-medium">Demo mode</span>
        <span className="text-amber-200/90">
          {' '}
          — sample data only; actions do not change real accounts or billing.
        </span>
        <Link
          href="/demo"
          className="ml-2 underline underline-offset-2 hover:text-white"
        >
          Demo hub
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <DemoAppShell>{children}</DemoAppShell>
      </div>
    </div>
  )
}
