import type { SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../../_auth'
import {
  formatSourceCatalog,
  generateReferencesAppendix,
  generateSectionBody,
  summarizeScraped,
} from '@/lib/academic-research/generate'
import type { AcademicTemplateType, OutlineItem } from '@/lib/academic-research/types'

async function finalizeReferences(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  session: {
    scraped_context: unknown
    citation_style: string | null
    answers: unknown
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: sectionRows, error: secErr } = await supabase
    .from('academic_research_sections')
    .select('section_slug, heading, sort_order, body')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: true })

  if (secErr) {
    return { ok: false, error: secErr.message }
  }

  const combined =
    (sectionRows || [])
      .map((r) => String(r.body || ''))
      .join('\n\n') || ''

  const answers = (session.answers || {}) as Record<string, unknown>
  const citationStyle =
    session.citation_style || String(answers.citation_style || 'apa')
  const sourceCatalog = formatSourceCatalog(session.scraped_context)

  const { text: refText, error: fErr } = await generateReferencesAppendix({
    citationStyle,
    combinedSectionBodies: combined,
    sourceCatalog,
  })

  if (fErr || !refText) {
    return { ok: false, error: fErr || 'References generation failed' }
  }

  const { error: upErr } = await supabase
    .from('academic_research_sessions')
    .update({
      references_text: refText,
      status: 'completed',
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (upErr) {
    return { ok: false, error: upErr.message }
  }
  return { ok: true }
}

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

  const outlineRaw = (session.outline || []) as OutlineItem[]
  const outlineSorted = [...outlineRaw].sort((a, b) => a.sort_order - b.sort_order)
  if (!Array.isArray(outlineSorted) || outlineSorted.length === 0) {
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
    target = outlineSorted.find((o) => o.slug === body.sectionSlug.trim())
    if (!target) {
      return NextResponse.json({ error: 'Unknown section slug' }, { status: 400 })
    }
  } else {
    target = outlineSorted.find((o) => !filled.has(o.slug))
  }

  if (!target) {
    const refEmpty = !String(session.references_text || '').trim()
    if (refEmpty && outlineSorted.length > 0) {
      const fin = await finalizeReferences(auth.supabase, auth.user.id, id, session)
      if (!fin.ok) {
        await auth.supabase
          .from('academic_research_sessions')
          .update({
            status: 'failed',
            error_message: fin.error,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
        return NextResponse.json({ error: fin.error }, { status: 500 })
      }
      return NextResponse.json({
        completed: true,
        progress: { current: outlineSorted.length, total: outlineSorted.length },
        finalized: true,
      })
    }

    await auth.supabase
      .from('academic_research_sessions')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({
      completed: true,
      message: 'All sections already generated',
      progress: { current: outlineSorted.length, total: outlineSorted.length },
    })
  }

  const answers = (session.answers || {}) as Record<string, unknown>
  const scrapedSummary = summarizeScraped(session.scraped_context)
  const sourceCatalog = formatSourceCatalog(session.scraped_context)
  const idx = outlineSorted.findIndex((o) => o.slug === target.slug)
  const sectionNumber = idx >= 0 ? idx + 1 : 1
  const total = outlineSorted.length

  const { body: sectionBody, error: genErr } = await generateSectionBody({
    templateType: session.template_type as AcademicTemplateType,
    citationStyle: session.citation_style || String(answers.citation_style || 'apa'),
    answers,
    scrapedSummary,
    sourceCatalog,
    outline: outlineSorted,
    sectionSlug: target.slug,
    sectionHeading: target.heading,
    sectionNumber,
    totalSections: total,
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
  const done = outlineSorted.every((o) => nextFilled.has(o.slug))

  if (done) {
    const fin = await finalizeReferences(auth.supabase, auth.user.id, id, session)
    if (!fin.ok) {
      await auth.supabase
        .from('academic_research_sessions')
        .update({
          status: 'failed',
          error_message: fin.error,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      return NextResponse.json({ error: fin.error }, { status: 500 })
    }
  } else {
    await auth.supabase
      .from('academic_research_sessions')
      .update({ status: 'generating', updated_at: new Date().toISOString() })
      .eq('id', id)
  }

  return NextResponse.json({
    completed: done,
    progress: { current: nextFilled.size, total: outlineSorted.length },
    section: { slug: target.slug, heading: target.heading },
  })
}
