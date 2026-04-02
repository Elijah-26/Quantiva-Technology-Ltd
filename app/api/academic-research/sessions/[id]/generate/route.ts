import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../../_auth'
import { generateSectionBody, summarizeScraped } from '@/lib/academic-research/generate'
import type { AcademicTemplateType, OutlineItem } from '@/lib/academic-research/types'

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

  const outline = (session.outline || []) as OutlineItem[]
  if (!Array.isArray(outline) || outline.length === 0) {
    return NextResponse.json({ error: 'Generate an outline first' }, { status: 400 })
  }

  await auth.supabase
    .from('academic_research_sessions')
    .update({ status: 'generating', error_message: null, updated_at: new Date().toISOString() })
    .eq('id', id)

  const { data: existingRows } = await auth.supabase
    .from('academic_research_sections')
    .select('section_slug, body')
    .eq('session_id', id)

  const filled = new Set(
    (existingRows || [])
      .filter((r) => String(r.body || '').trim().length > 50)
      .map((r) => r.section_slug)
  )

  const body = await request.json().catch(() => ({}))
  let target: OutlineItem | undefined
  if (typeof body.sectionSlug === 'string' && body.sectionSlug.trim()) {
    target = outline.find((o) => o.slug === body.sectionSlug.trim())
    if (!target) {
      return NextResponse.json({ error: 'Unknown section slug' }, { status: 400 })
    }
  } else {
    target = outline.find((o) => !filled.has(o.slug))
  }

  if (!target) {
    await auth.supabase
      .from('academic_research_sessions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({
      completed: true,
      message: 'All sections already generated',
      progress: { current: outline.length, total: outline.length },
    })
  }

  const answers = (session.answers || {}) as Record<string, unknown>
  const scrapedSummary = summarizeScraped(session.scraped_context)

  const { body: sectionBody, error: genErr } = await generateSectionBody({
    templateType: session.template_type as AcademicTemplateType,
    citationStyle: session.citation_style || String(answers.citation_style || 'apa'),
    answers,
    scrapedSummary,
    outline,
    sectionSlug: target.slug,
    sectionHeading: target.heading,
  })

  if (genErr || !sectionBody) {
    await auth.supabase
      .from('academic_research_sessions')
      .update({
        status: 'failed',
        error_message: genErr || 'Section generation failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    return NextResponse.json({ error: genErr || 'Section failed' }, { status: 500 })
  }

  const { error: upErr } = await auth.supabase.from('academic_research_sections').upsert(
    {
      session_id: id,
      section_slug: target.slug,
      heading: target.heading,
      sort_order: target.sort_order,
      body: sectionBody,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'session_id,section_slug' }
  )

  if (upErr) {
    await auth.supabase
      .from('academic_research_sessions')
      .update({ status: 'failed', error_message: upErr.message })
      .eq('id', id)
    return NextResponse.json({ error: upErr.message }, { status: 500 })
  }

  const nextFilled = new Set(filled)
  nextFilled.add(target.slug)
  const done = outline.every((o) => nextFilled.has(o.slug))
  if (done) {
    await auth.supabase
      .from('academic_research_sessions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)
  } else {
    await auth.supabase
      .from('academic_research_sessions')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json({
    completed: done,
    progress: { current: nextFilled.size, total: outline.length },
    section: { slug: target.slug, heading: target.heading },
  })
}
