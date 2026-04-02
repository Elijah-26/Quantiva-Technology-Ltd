import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAndUser } from '../academic-research/_auth'
import { gatherScholarlyResearch } from '@/lib/research/researchOrchestrator'
import type { DocumentType } from '@/lib/research/types'
import { generateReferenceList, mapSessionCitationStyle } from '@/lib/research/citationFormatter'

const DOCUMENT_TYPES: DocumentType[] = [
  'dissertation',
  'literature_review',
  'case_study',
  'research_proposal',
  'research_paper',
]

function isDocumentType(s: unknown): s is DocumentType {
  return typeof s === 'string' && (DOCUMENT_TYPES as string[]).includes(s)
}

export async function POST(request: NextRequest) {
  const auth = await getSupabaseAndUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 })
  }

  if (!isDocumentType(body.documentType)) {
    return NextResponse.json(
      { error: `documentType must be one of: ${DOCUMENT_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  const citationStyle = mapSessionCitationStyle(
    typeof body.citationStyle === 'string' ? body.citationStyle : undefined
  )
  const yearFrom =
    typeof body.yearFrom === 'number' && Number.isFinite(body.yearFrom)
      ? Math.floor(body.yearFrom)
      : undefined

  const result = await gatherScholarlyResearch(
    topic,
    body.documentType,
    { citationStyle, yearFrom },
    { supabase: auth.supabase, userId: auth.user.id }
  )

  const citationMap: Record<string, { inText: string; fullReference: string; doi?: string }> = {}
  for (const [k, v] of result.citations) {
    citationMap[k] = { inText: v.inText, fullReference: v.fullReference, doi: v.doi }
  }

  const referenceList = generateReferenceList(result.papers, citationStyle)

  return NextResponse.json({
    papers: result.papers,
    referenceList,
    citationMap,
  })
}
