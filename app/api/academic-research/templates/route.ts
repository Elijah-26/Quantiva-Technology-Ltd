import { NextResponse } from 'next/server'
import { listTemplatesForApi } from '@/lib/academic-research/template-flows'

export async function GET() {
  return NextResponse.json({ templates: listTemplatesForApi() })
}
