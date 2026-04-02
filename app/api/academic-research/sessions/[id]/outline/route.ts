import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../../_auth'
import { generateOutlineJson } from '@/lib/academic-research/generate'
import type { AcademicTemplateType } from '@/lib/academic-research/types'

export async function POST(
  request: NextRequest,
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

  const searchParams = request.nextUrl.searchParams
  const resetSections = searchParams.get('reset') === '1'

  const { outline, error: genErr } = await generateOutlineJson({
    templateType: session.template_type as AcademicTemplateType,
    answers: (session.answers || {}) as Record<string, unknown>,
    scrapedContext: session.scraped_context,
  })

  if (genErr || outline.length === 0) {
    await auth.supabase
      .from('academic_research_sessions')
      .update({
        status: 'failed',
        error_message: genErr || 'Outline generation produced no sections',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    return NextResponse.json({ error: genErr || 'Outline failed' }, { status: 500 })
  }

  if (resetSections) {
    await auth.supabase.from('academic_research_sections').delete().eq('session_id', id)
  }

  const { error: uErr } = await auth.supabase
    .from('academic_research_sessions')
    .update({
      outline,
      status: 'draft',
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', auth.user.id)

  if (uErr) {
    return NextResponse.json({ error: uErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, outline })
}
