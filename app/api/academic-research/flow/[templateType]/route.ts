import { NextRequest, NextResponse } from 'next/server'
import { isAcademicTemplateType } from '@/lib/academic-research/types'
import { getFlowSteps, TEMPLATE_UI_META } from '@/lib/academic-research/template-flows'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ templateType: string }> }
) {
  const { templateType } = await context.params
  if (!isAcademicTemplateType(templateType)) {
    return NextResponse.json({ error: 'Unknown template' }, { status: 400 })
  }
  return NextResponse.json({
    templateType,
    meta: TEMPLATE_UI_META[templateType],
    steps: getFlowSteps(templateType),
  })
}
