import { DemoAppShell } from '@/components/demo/DemoAppShell'

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <DemoAppShell>{children}</DemoAppShell>
      </div>
    </div>
  )
}
