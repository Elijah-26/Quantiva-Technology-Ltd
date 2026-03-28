'use client'

import { useState } from 'react'
import Link from 'next/link'
import { performComplianceCheck } from '@/lib/demo/compliance-api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Shield } from 'lucide-react'

const SAMPLE =
  'Our investment strategy guarantees returns of up to 15% annually. Past performance shows consistent growth.'

export default function ComplianceCheckDemoPage() {
  const [text, setText] = useState(SAMPLE)
  const [fca, setFca] = useState(true)
  const [cqc, setCqc] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof performComplianceCheck>
  > | null>(null)

  async function runCheck() {
    setLoading(true)
    setResult(null)
    try {
      const ruleset: string[] = []
      if (fca) ruleset.push('FCA')
      if (cqc) ruleset.push('CQC')
      if (ruleset.length === 0) {
        toast.error('Select at least one ruleset')
        setLoading(false)
        return
      }
      const res = await performComplianceCheck(
        {
          text,
          ruleset,
          mode: 'realtime',
          user_id: 'demo-playground',
          source: 'manual',
        },
        'enterprise'
      )
      setResult(res)
      toast.success('Check complete (demo — in-memory only)')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Check failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-700 dark:text-indigo-300">
          <Shield className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Compliance check playground
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            FCA/CQC pattern rules run in your browser. No data is saved to the
            server.
          </p>
        </div>
      </div>

      <Card className="mb-6 border-gray-200 dark:border-white/10 dark:bg-navy-900">
        <CardHeader>
          <CardTitle className="dark:text-white">Your text</CardTitle>
          <CardDescription>
            Max 5,000 characters. Uses the same rulesets as the Regulatory
            Guardrail module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="min-h-[140px] w-full rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm dark:text-gray-300">
              <input
                type="checkbox"
                checked={fca}
                onChange={() => setFca(!fca)}
              />
              FCA
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm dark:text-gray-300">
              <input
                type="checkbox"
                checked={cqc}
                onChange={() => setCqc(!cqc)}
              />
              CQC
            </label>
          </div>
          <Button onClick={runCheck} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Running…
              </>
            ) : (
              'Run check'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-gray-200 dark:border-white/10 dark:bg-navy-900">
          <CardHeader>
            <CardTitle className="dark:text-white">Results</CardTitle>
            <CardDescription>
              Check ID: {result.check_id} · Checks remaining (demo quota):{' '}
              {result.checks_remaining === Infinity ? '∞' : result.checks_remaining}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.flags.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No flags for this text and ruleset selection.
              </p>
            ) : (
              <ul className="space-y-3">
                {result.flags.map((f, i) => (
                  <li
                    key={`${f.rule_id}-${i}`}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm dark:text-gray-200"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          f.severity === 'violation'
                            ? 'destructive'
                            : f.severity === 'warning'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {f.severity}
                      </Badge>
                      <span className="font-mono text-xs text-gray-500">
                        {f.rule_id}
                      </span>
                    </div>
                    <p className="font-medium text-white">&quot;{f.phrase}&quot;</p>
                    <p className="mt-1 text-gray-400">{f.explanation}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500">{result.disclaimer}</p>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-center text-sm">
        <Link href="/demo" className="text-indigo-600 underline">
          Back to demo hub
        </Link>
      </p>
    </div>
  )
}
