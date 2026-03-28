'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const STEPS = [
  { id: 'account', label: 'Link Quantiva account' },
  { id: 'rules', label: 'Sync ruleset bundle' },
  { id: 'browser', label: 'Browser permissions granted' },
  { id: 'workspace', label: 'Workspace destination selected' },
]

export default function ExtensionSyncDemoPage() {
  const [done, setDone] = useState<Record<string, boolean>>({
    account: false,
    rules: false,
    browser: false,
    workspace: false,
  })

  const toggle = (id: string, next: boolean) => {
    setDone((prev) => ({ ...prev, [id]: next }))
    toast.message(next ? 'Demo — step marked done' : 'Demo — step cleared')
  }

  const allOn = STEPS.every((s) => done[s.id])

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/demo/extension" aria-label="Back to extension hub">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync & connection (demo)</h1>
          <p className="text-gray-600 text-sm">Toggle checklist items — no backend.</p>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Connection checklist</CardTitle>
          <CardDescription>Use checkboxes to simulate setup progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                {done[s.id] ? (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="size-5 shrink-0 text-gray-300" />
                )}
                <Label htmlFor={s.id} className="text-sm font-normal cursor-pointer">
                  {s.label}
                </Label>
              </div>
              <Checkbox
                id={s.id}
                checked={done[s.id]}
                onCheckedChange={(v) => toggle(s.id, v === true)}
              />
            </div>
          ))}
          {allOn ? (
            <p className="text-sm text-emerald-700 font-medium">
              All steps complete — in production this would enable live sync.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
