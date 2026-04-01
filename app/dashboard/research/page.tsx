'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSearch, FileText, Calendar, Shield } from 'lucide-react'

const items = [
  {
    href: '/dashboard/research/new-research',
    title: 'New research',
    description: 'Create a fresh market research run with on-demand or recurring options.',
    icon: FileSearch,
  },
  {
    href: '/dashboard/research/reports',
    title: 'Reports',
    description: 'Browse generated reports and open report detail pages.',
    icon: FileText,
  },
  {
    href: '/dashboard/research/schedules',
    title: 'Schedules',
    description: 'Manage recurring market research schedules.',
    icon: Calendar,
  },
  {
    href: '/dashboard/research/regulatory-guardrail',
    title: 'Regulatory Guardrail',
    description: 'Run compliance checks and review policy flags.',
    icon: Shield,
  },
]

export default function ResearchModulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Market Research Intelligence</h1>
        <p className="text-white/60">
          On-demand and recurring research, reports, schedules, and compliance tools in one place.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.href} className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <item.icon className="size-5 text-indigo-400" />
                {item.title}
              </CardTitle>
              <CardDescription className="text-white/60">{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="glass">
                <Link href={item.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
