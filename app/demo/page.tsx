import Link from 'next/link'
import {
  LayoutGrid,
  Sparkles,
  Shield,
  LineChart,
  ClipboardCheck,
  Puzzle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const sections = [
  {
    title: 'Quantiva AI (document platform)',
    description:
      'Marketing site, auth walkthroughs, user dashboard, billing, workspace — all mock data.',
    href: '/demo/ai',
    icon: Sparkles,
  },
  {
    title: 'Quantiva AI — Sign in (demo)',
    description: 'Visual sign-in flow; submit does not authenticate.',
    href: '/demo/ai/auth/signin',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Sign up (demo)',
    href: '/demo/ai/auth/signup',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Forgot password (demo)',
    href: '/demo/ai/auth/forgot-password',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Onboarding (demo)',
    href: '/demo/ai/auth/onboarding',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — User dashboard',
    href: '/demo/ai/dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Documents',
    href: '/demo/ai/dashboard/documents',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Document detail',
    description: 'Open from the Documents list (template detail with mock preview).',
    href: '/demo/ai/dashboard/documents/1',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Research wizard',
    description: 'Multi-step demo: template, citation, word target, static outlines.',
    href: '/demo/ai/dashboard/research',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Research projects',
    description: 'Local project list with add/remove (session only).',
    href: '/demo/ai/dashboard/research/projects',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — AI Generate',
    href: '/demo/ai/dashboard/generate',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Workspace',
    href: '/demo/ai/dashboard/workspace',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Billing',
    href: '/demo/ai/dashboard/billing',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Settings',
    href: '/demo/ai/dashboard/settings',
    icon: LayoutGrid,
  },
  {
    title: 'Quantiva AI — Admin',
    description: 'Admin shell: users, documents, moderation, templates, analytics, settings.',
    href: '/demo/ai/admin',
    icon: Shield,
  },
  {
    title: 'Quantiva AI — Admin moderation',
    description: 'Queue table and per-item approve / reject / request changes (sessionStorage).',
    href: '/demo/ai/admin/moderation',
    icon: Shield,
  },
  {
    title: 'Quantiva AI — Admin templates',
    description: 'Category picker and prefilled CMS form; save is toast-only.',
    href: '/demo/ai/admin/templates',
    icon: Shield,
  },
  {
    title: 'Quantiva AI — Admin analytics',
    description: 'KPI cards, Recharts bar chart, client-side CSV export (static rows).',
    href: '/demo/ai/admin/analytics',
    icon: Shield,
  },
  {
    title: 'Quantiva AI — Admin settings (stub)',
    href: '/demo/ai/admin/settings',
    icon: Shield,
  },
  {
    title: 'Market intelligence landing (Vite port)',
    href: '/demo/market-research',
    icon: LineChart,
  },
  {
    title: 'Compliance check playground',
    description: 'Run FCA/CQC rules locally in the browser (no server save).',
    href: '/demo/compliance-check',
    icon: ClipboardCheck,
  },
  {
    title: 'Regulatory Guardrail dashboard',
    description: 'Charts and history (mock) inside the live app shell.',
    href: '/dashboard/regulatory-guardrail',
    icon: Shield,
  },
  {
    title: 'Chrome extension (instructions)',
    href: '/demo/extension',
    icon: Puzzle,
  },
  {
    title: 'Extension — Panel demo',
    description: 'Fake capture, static suggestion cards, send-to-workspace toast.',
    href: '/demo/extension/panel',
    icon: Puzzle,
  },
  {
    title: 'Extension — Sync checklist',
    description: 'Connection checklist with local toggles.',
    href: '/demo/extension/sync',
    icon: Puzzle,
  },
]

export default function DemoHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Product demos
        </h1>
        <p className="mt-2 text-gray-600">
          Everything below uses dummy data for client walkthroughs. Use the live
          app sidebar &quot;Product demos&quot; anytime to return here.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">
            <ExternalLink className="size-4" />
            Back to live dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((item) => {
          const Icon = item.icon ?? LayoutGrid
          return (
            <Card key={item.href} className="border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    {item.description ? (
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary" size="sm">
                  <Link href={item.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
