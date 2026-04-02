import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../_auth'
import { isAcademicTemplateType } from '@/lib/academic-research/types'
import { TEMPLATE_UI_META } from '@/lib/academic-research/template-flows'

export async function GET() {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await auth.supabase
    .from('academic_research_sessions')
    .select(
      'id, template_type, status, title, citation_style, word_target_band, created_at, updated_at'
    )
    .eq('user_id', auth.user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ sessions: data || [] })
}

export async function POST(request: NextRequest) {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const templateType = typeof body.templateType === 'string' ? body.templateType.trim() : ''
  if (!isAcademicTemplateType(templateType)) {
    return NextResponse.json({ error: 'Invalid templateType' }, { status: 400 })
  }

  const title =
    typeof body.title === 'string' && body.title.trim()
      ? body.title.trim()
      : TEMPLATE_UI_META[templateType].label

  const { data, error } = await auth.supabase
    .from('academic_research_sessions')
    .insert({
      user_id: auth.user.id,
      template_type: templateType,
      title,
      citation_style: '',
      word_target_band: '',
      answers: { _meta: { step: 0 } },
      scraped_context: [],
      outline: [],
      status: 'draft',
    })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({ session: data })
}
