import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../../../_auth'
import { buildDocxBuffer, buildPdfBuffer } from '@/lib/academic-research/export-server'
import type { OutlineItem } from '@/lib/academic-research/types'
import type { SectionRow } from '@/lib/academic-research/assemble'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params

  const format = request.nextUrl.searchParams.get('format') || 'docx'
  if (format !== 'docx' && format !== 'pdf') {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  }

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
    .select('section_slug, heading, sort_order, body')
    .eq('session_id', id)
    .order('sort_order', { ascending: true })

  if (secErr) {
    return NextResponse.json({ error: secErr.message }, { status: 500 })
  }

  const outline = (session.outline || []) as OutlineItem[]
  const sectionRows: SectionRow[] = (sections || []).map((r) => ({
    section_slug: r.section_slug,
    heading: r.heading,
    sort_order: r.sort_order,
    body: r.body || '',
  }))

  const referencesText = String(session.references_text ?? '')
  const title = String(session.title || 'Research document')

  const payload = { title, outline, sections: sectionRows, referencesText }

  const safeName = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 80) || 'research'

  try {
    if (format === 'docx') {
      const buf = await buildDocxBuffer(payload)
      return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeName}.docx"`,
        },
      })
    }

    const buf = await buildPdfBuffer(payload)
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Export failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
