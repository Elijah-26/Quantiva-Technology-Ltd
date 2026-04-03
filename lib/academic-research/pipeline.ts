import type { SupabaseClient } from '@supabase/supabase-js'
import { gatherResearchSources } from '@/lib/research-web/gather'
import {
  contextHintsFromAnswers,
  topicQueryFromAnswers,
} from '@/lib/academic-research/template-flows'
import type { AcademicTemplateType } from '@/lib/academic-research/types'
import {
  generateOutlineJson,
  generateReferencesAppendix,
  generateSectionBody,
  summarizeScraped,
  formatSourceCatalog,
} from '@/lib/academic-research/generate'
import { resolveOutlineForSession } from '@/lib/academic-research/section-catalog'
import {
  formatSessionListTitle,
  primaryWorkingTitleFromAnswers,
} from '@/lib/academic-research/template-flows'

export async function runAcademicResearchPipeline(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<{ ok: true } | { ok: false; error: string; stage?: string }> {
  const { data: session, error: sErr } = await supabase
    .from('academic_research_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (sErr || !session) {
    return { ok: false, error: 'Not found', stage: 'load' }
  }

  const templateType = session.template_type as AcademicTemplateType
  const answers = (session.answers || {}) as Record<string, unknown>
  const citationStyleForResearch =
    String(session.citation_style || '').trim() ||
    String(answers.citation_style || 'apa')

  // 1) Research
  await supabase
    .from('academic_research_sessions')
    .update({ status: 'researching', error_message: null, updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  const researchResult = await gatherResearchSources({
    templateType,
    topicQuery: topicQueryFromAnswers(templateType, answers),
    contextHints: contextHintsFromAnswers(templateType, answers),
    researchContext: {
      supabase,
      userId,
      citationStyle: citationStyleForResearch,
    },
  })

  const { error: rErr } = await supabase
    .from('academic_research_sessions')
    .update({
      scraped_context: researchResult.sources,
      status: 'draft',
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (rErr) {
    return { ok: false, error: rErr.message, stage: 'research' }
  }

  let current = { ...session, scraped_context: researchResult.sources }

  // 2) Outline + reset sections + references
  const ans = (current.answers || {}) as Record<string, unknown>
  let outline = resolveOutlineForSession(templateType, ans) || []
  let oErr: string | undefined
  if (outline.length === 0) {
    const gen = await generateOutlineJson({
      templateType,
      answers: ans,
      scrapedContext: current.scraped_context,
    })
    outline = gen.outline
    oErr = gen.error
  }

  if (oErr || outline.length === 0) {
    await supabase
      .from('academic_research_sessions')
      .update({
        status: 'failed',
        error_message: oErr || 'Outline failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
    return { ok: false, error: oErr || 'Outline failed', stage: 'outline' }
  }

  await supabase.from('academic_research_sections').delete().eq('session_id', sessionId)

  const { error: ouErr } = await supabase
    .from('academic_research_sessions')
    .update({
      outline,
      references_text: '',
      status: 'draft',
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (ouErr) {
    return { ok: false, error: ouErr.message, stage: 'outline' }
  }

  current = { ...current, outline, scraped_context: researchResult.sources, references_text: '' }

  const citationStyle =
    current.citation_style || String((current.answers as Record<string, unknown>).citation_style || 'apa')
  const scrapedSummary = summarizeScraped(current.scraped_context)
  const sourceCatalog = formatSourceCatalog(current.scraped_context)
  const outlineSorted = [...outline].sort((a, b) => a.sort_order - b.sort_order)
  const total = outlineSorted.length

  // 3) Generate each section
  for (let i = 0; i < outlineSorted.length; i++) {
    const target = outlineSorted[i]
    const sectionNumber = i + 1

    await supabase
      .from('academic_research_sessions')
      .update({ status: 'generating', error_message: null, updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    const { body: sectionBody, error: genErr } = await generateSectionBody({
      templateType,
      citationStyle,
      answers: (current.answers || {}) as Record<string, unknown>,
      scrapedSummary,
      sourceCatalog,
      outline: outlineSorted,
      sectionSlug: target.slug,
      sectionHeading: target.heading,
      sectionNumber,
      totalSections: total,
    })

    if (genErr || !sectionBody) {
      await supabase
        .from('academic_research_sessions')
        .update({
          status: 'failed',
          error_message: genErr || 'Section generation failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
      return { ok: false, error: genErr || 'Section failed', stage: 'generate' }
    }

    const { error: upErr } = await supabase.from('academic_research_sections').upsert(
      {
        session_id: sessionId,
        section_slug: target.slug,
        heading: target.heading,
        sort_order: target.sort_order,
        body: sectionBody,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,section_slug' }
    )

    if (upErr) {
      await supabase
        .from('academic_research_sessions')
        .update({ status: 'failed', error_message: upErr.message })
        .eq('id', sessionId)
      return { ok: false, error: upErr.message, stage: 'generate' }
    }
  }

  // 4) References appendix
  const { data: sectionRows } = await supabase
    .from('academic_research_sections')
    .select('section_slug, heading, sort_order, body')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: true })

  const combined =
    (sectionRows || [])
      .map((r) => (r.body as string) || '')
      .join('\n\n') || ''

  const { text: refText, error: fErr } = await generateReferencesAppendix({
    citationStyle,
    combinedSectionBodies: combined,
    sourceCatalog,
  })

  if (fErr || !refText) {
    await supabase
      .from('academic_research_sessions')
      .update({
        status: 'failed',
        error_message: fErr || 'References generation failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
    return { ok: false, error: fErr || 'References failed', stage: 'finalize' }
  }

  const titleAnswers = (current.answers || {}) as Record<string, unknown>
  const wt = primaryWorkingTitleFromAnswers(templateType, titleAnswers)
  const listTitle = wt !== null ? formatSessionListTitle(wt, templateType).slice(0, 500) : undefined

  const { error: finErr } = await supabase
    .from('academic_research_sessions')
    .update({
      references_text: refText,
      status: 'completed',
      error_message: null,
      updated_at: new Date().toISOString(),
      ...(listTitle ? { title: listTitle } : {}),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (finErr) {
    return { ok: false, error: finErr.message, stage: 'finalize' }
  }

  return { ok: true }
}
