import { NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../../_auth'
import { runAcademicResearchPipeline } from '@/lib/academic-research/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  const result = await runAcademicResearchPipeline(auth.supabase, auth.user.id, id)
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, stage: result.stage },
      { status: 500 }
    )
  }
  return NextResponse.json({ ok: true })
}
