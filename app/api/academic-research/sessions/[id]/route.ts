import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../_auth'
import { setWizardStep, type AcademicTemplateType } from '@/lib/academic-research/types'
import {
  formatSessionListTitle,
  primaryWorkingTitleFromAnswers,
} from '@/lib/academic-research/template-flows'

export async function GET(
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

  const { data: sections, error: secErr } = await auth.supabase
    .from('academic_research_sections')
    .select('id, section_slug, heading, sort_order, body, updated_at')
    .eq('session_id', id)
    .order('sort_order', { ascending: true })

  if (secErr) {
    return NextResponse.json({ error: secErr.message }, { status: 500 })
  }

  return NextResponse.json({ session, sections: sections || [] })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  const { data: existing, error: exErr } = await auth.supabase
    .from('academic_research_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .single()

  if (exErr || !existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  let answers = (existing.answers || {}) as Record<string, unknown>
  if (body.answers && typeof body.answers === 'object' && body.answers !== null) {
    answers = { ...answers, ...(body.answers as Record<string, unknown>) }
  }
  if (typeof body.step === 'number' && body.step >= 0) {
    answers = setWizardStep(answers, Math.floor(body.step))
  }
  patch.answers = answers

  const templateType = existing.template_type as AcademicTemplateType
  if (typeof body.title === 'string') {
    patch.title = body.title.trim().slice(0, 500)
  } else {
    const wt = primaryWorkingTitleFromAnswers(templateType, answers)
    if (wt !== null) {
      patch.title = formatSessionListTitle(wt, templateType).slice(0, 500)
    }
  }

  const cs = answers.citation_style
  const wb = answers.word_target_band
  if (typeof cs === 'string') patch.citation_style = cs
  if (typeof wb === 'string') patch.word_target_band = wb

  if (typeof body.status === 'string') {
    const allowed = ['draft', 'researching', 'generating', 'completed', 'failed'] as const
    if ((allowed as readonly string[]).includes(body.status)) {
      patch.status = body.status
    }
  }
  if (body.error_message === null) patch.error_message = null
  if (typeof body.error_message === 'string') patch.error_message = body.error_message.slice(0, 2000)

  const { data, error } = await auth.supabase
    .from('academic_research_sessions')
    .update(patch)
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ session: data })
}
