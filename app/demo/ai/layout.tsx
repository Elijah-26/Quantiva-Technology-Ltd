/**
 * Dark shell for Quantiva AI demo routes (ported marketing + dashboard styling).
 * Root layout already provides global CSS and background effects.
 */
export default function DemoAiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark min-h-screen bg-navy-900 text-white">{children}</div>
  )
}
