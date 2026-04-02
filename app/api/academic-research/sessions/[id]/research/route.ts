import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../../_auth'
import { gatherResearchSources } from '@/lib/research-web/gather'
import {
  contextHintsFromAnswers,
  topicQueryFromAnswers,
} from '@/lib/academic-research/template-flows'
import type { AcademicTemplateType } from '@/lib/academic-research/types'

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  const { data: session, error: sErr } = await auth.supabase
    .from('academic_research_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .single()

  if (sErr || !session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const templateType = session.template_type as AcademicTemplateType
  const answers = (session.answers || {}) as Record<string, unknown>
  const citationStyle =
    String(session.citation_style || '').trim() ||
    String(answers.citation_style || 'apa')

  await auth.supabase
    .from('academic_research_sessions')
    .update({ status: 'researching', updated_at: new Date().toISOString(), error_message: null })
    .eq('id', id)

  const result = await gatherResearchSources({
    templateType,
    topicQuery: topicQueryFromAnswers(templateType, answers),
    contextHints: contextHintsFromAnswers(templateType, answers),
    researchContext: {
      supabase: auth.supabase,
      userId: auth.user.id,
      citationStyle,
    },
  })

  const { error: uErr } = await auth.supabase
    .from('academic_research_sessions')
    .update({
      scraped_context: result.sources,
      status: 'draft',
      updated_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('id', id)
    .eq('user_id', auth.user.id)

  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    sourceCount: result.sources.length,
    skippedReason: result.skippedReason,
  })
}
