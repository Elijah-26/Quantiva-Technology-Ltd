'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Template = { id: string; label: string; description: string; stepCount: number }

type SessionRow = {
  id: string
  template_type: string
  status: string
  title: string
  updated_at: string
}

export default function AcademicResearchHubPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [tRes, sRes] = await Promise.all([
        fetch('/api/academic-research/templates'),
        fetch('/api/academic-research/sessions', { credentials: 'include' }),
      ])
      const tData = await tRes.json().catch(() => ({}))
      const sData = await sRes.json().catch(() => ({}))
      if (tRes.ok) setTemplates(tData.templates || [])
      if (sRes.ok) setSessions(sData.sessions || [])
      else if (sRes.status === 401) toast.error('Sign in to manage research sessions')
    } catch {
      toast.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function startTemplate(templateId: string) {
    setCreating(templateId)
    try {
      const res = await fetch('/api/academic-research/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: templateId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not create session')
      router.push(`/dashboard/ai-research/session/${data.session.id}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <GraduationCap className="size-8 text-indigo-400" />
          Academic research
        </h1>
        <p className="text-white/60 max-w-2xl">
          Choose a template and follow the steps. Your session is saved automatically. Generated text is a
          draft—review and edit it with your supervisor or committee before submission.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/50">
          <Loader2 className="size-5 animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-white/10 bg-white/5 h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{t.label}</CardTitle>
                  <CardDescription className="text-white/50">{t.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-3">
                  <p className="text-xs text-white/40">{t.stepCount} steps in this flow</p>
                  <Button
                    variant="gradient"
                    className="w-full"
                    disabled={!!creating}
                    onClick={() => startTemplate(t.id)}
                  >
                    {creating === t.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Start
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Your sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-white/45">No sessions yet — start a template above.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/dashboard/ai-research/session/${s.id}`}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3',
                    'hover:bg-white/10 transition-colors'
                  )}
                >
                  <div>
                    <p className="font-medium text-white">{s.title}</p>
                    <p className="text-xs text-white/45">
                      {s.template_type.replace(/_/g, ' ')} · updated {s.updated_at?.slice(0, 10)}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      s.status === 'completed' && 'bg-emerald-500/20 text-emerald-300',
                      s.status === 'failed' && 'bg-rose-500/20 text-rose-300'
                    )}
                  >
                    {s.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
