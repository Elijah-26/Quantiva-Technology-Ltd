import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import { isPlatformAdmin } from '@/lib/auth/admin'
import { recordAuditEvent } from '@/lib/audit'
import { insertGeneratedLibraryRow, previewFromBody } from '@/lib/library-document-generation'

const WIZARD_DOC_LABELS: Record<string, string> = {
  privacy: 'Privacy Policy',
  dpa: 'Data Processing Agreement (DPA)',
  terms: 'Terms of Service',
  contract: 'Contract',
  compliance: 'Compliance Doc',
  hr: 'HR Document',
  research_proposal: 'Research proposal',
  dissertation_outline: 'Dissertation outline',
  research_ethics: 'Research ethics statement',
  academic_paper: 'Academic paper scaffold',
  custom: 'Custom Document',
}

const ACADEMIC_DOC_TYPES = new Set([
  'research_proposal',
  'dissertation_outline',
  'research_ethics',
  'academic_paper',
])

async function synthesizeDocument(body: {
  documentType: string
  industry: string
  jurisdiction: string
  companyName: string
  website: string
  description: string
  additionalRequirements: string
}): Promise<{ text: string; error?: string }> {
  const key = process.env.OPENAI_API_KEY
  const isAcademic = ACADEMIC_DOC_TYPES.has(body.documentType)
  if (!key) {
    return {
      text: `[Draft — add OPENAI_API_KEY for live AI generation]\n\n${body.companyName}\n${body.website}\n\n${body.description}\n\n${body.additionalRequirements || ''}\n\nDocument type: ${body.documentType} · Field/context: ${body.industry} · Jurisdiction: ${body.jurisdiction}`,
    }
  }

  const systemContent = isAcademic
    ? 'You help researchers structure academic writing: proposals, thesis outlines, ethics statements, and paper scaffolding. Use clear headings, bullet points, and methodology-aware language. Do not fabricate citations; use placeholder tags like [Author, Year] where needed.'
    : 'You draft professional legal/compliance-oriented document sections. Use clear headings and bullet points where helpful.'

  const userContent = isAcademic
    ? `Produce a structured outline or draft for: ${body.documentType.replace(/_/g, ' ')}.\nInstitution / project name: ${body.companyName}\nSite or lab page (optional): ${body.website}\nField or programme: ${body.industry}\nRegulatory or ethics context (jurisdiction): ${body.jurisdiction}\nTopic summary: ${body.description}\nSupervisor or committee requirements: ${body.additionalRequirements || 'None'}`
    : `Produce a structured draft for a ${body.documentType} document.\nCompany: ${body.companyName}\nWebsite: ${body.website}\nIndustry: ${body.industry}\nJurisdiction: ${body.jurisdiction}\nRequirements: ${body.description}\nAdditional: ${body.additionalRequirements || 'None'}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemContent,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        max_tokens: 2500,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      return { text: '', error: json?.error?.message || 'OpenAI request failed' }
    }
    const text = json?.choices?.[0]?.message?.content?.trim()
    if (!text) return { text: '', error: 'Empty model response' }
    return { text }
  } catch (e) {
    return { text: '', error: e instanceof Error ? e.message : 'Generation failed' }
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('generation_jobs')
      .select('id, status, document_type, company_name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ jobs: data || [] })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const documentType = String(body.documentType || '')
    const industry = String(body.industry || '')
    const jurisdiction = String(body.jurisdiction || '')
    const companyName = String(body.companyName || '')
    const website = String(body.website || '')
    const description = String(body.description || '')
    const additionalRequirements = String(body.additionalRequirements || '')

    if (!documentType || !industry || !jurisdiction || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!isPlatformAdmin(user)) {
      const { limits } = await getUserPlanAndLimits(user.id)
      if (limits.reportsPerMonth !== Infinity) {
        const now = new Date()
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
        const { count, error: cErr } = await supabaseAdmin
          .from('generation_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth)
        if (cErr) {
          return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
        }
        if ((count ?? 0) >= limits.reportsPerMonth) {
          return NextResponse.json(
            { error: 'Plan limit reached for generations this month', code: 'GEN_LIMIT' },
            { status: 403 }
          )
        }
      }
    }

    const { data: job, error: insErr } = await supabase
      .from('generation_jobs')
      .insert({
        user_id: user.id,
        status: 'processing',
        document_type: documentType,
        industry,
        jurisdiction,
        company_name: companyName,
        website,
        description,
        additional_requirements: additionalRequirements,
      })
      .select()
      .single()

    if (insErr || !job) {
      return NextResponse.json({ error: insErr?.message || 'Insert failed' }, { status: 500 })
    }

    const result = await synthesizeDocument({
      documentType,
      industry,
      jurisdiction,
      companyName,
      website,
      description,
      additionalRequirements,
    })

    const now = new Date().toISOString()
    if (result.error) {
      await supabaseAdmin
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: result.error,
          updated_at: now,
        })
        .eq('id', job.id)

      await recordAuditEvent(supabaseAdmin, {
        actorUserId: user.id,
        action: 'generation.failed',
        entityType: 'generation_job',
        entityId: job.id,
        metadata: { documentType, companyName, error: result.error },
      })

      return NextResponse.json(
        { job: { ...job, status: 'failed', error_message: result.error } },
        { status: 200 }
      )
    }

    await supabaseAdmin
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_text: result.text,
        updated_at: now,
      })
      .eq('id', job.id)

    let workspaceItemId: string | null = null
    const { data: wsItem, error: wsErr } = await supabaseAdmin
      .from('workspace_items')
      .insert({
        user_id: user.id,
        title: `${documentType} — ${companyName}`,
        doc_type: documentType,
        status: 'completed',
        content_text: result.text,
        generation_job_id: job.id,
      })
      .select('id')
      .single()

    if (wsErr) {
      console.error('workspace_items insert after generation', wsErr)
    } else if (wsItem) {
      workspaceItemId = wsItem.id
    }

    const docLabel = WIZARD_DOC_LABELS[documentType] || documentType.replace(/_/g, ' ')
    const libraryTitle = `${docLabel} — ${companyName}`
    const libraryDescription = `AI Generate draft for ${companyName}. Industry: ${industry}. Jurisdiction: ${jurisdiction}.`

    let libraryDocumentId: string | null = null
    const libInsert = await insertGeneratedLibraryRow(supabaseAdmin, {
      title: libraryTitle,
      fullContent: result.text,
      preview: previewFromBody(result.text),
      marketCategoryValue: documentType,
      geographyValue: jurisdiction,
      source: 'on_demand',
      createdByUserId: user.id,
      generationJobId: job.id,
      description: libraryDescription,
    })

    if ('error' in libInsert) {
      console.error('library_documents insert after generation', libInsert.error)
    } else {
      libraryDocumentId = libInsert.id
      await recordAuditEvent(supabaseAdmin, {
        actorUserId: user.id,
        action: 'library.document_generated_on_demand',
        entityType: 'library_document',
        entityId: libInsert.id,
        metadata: { documentType, companyName, generationJobId: job.id },
      })
    }

    await recordAuditEvent(supabaseAdmin, {
      actorUserId: user.id,
      action: 'generation.completed',
      entityType: 'generation_job',
      entityId: job.id,
      metadata: {
        documentType,
        companyName,
        workspaceItemId,
        libraryDocumentId,
      },
    })

    return NextResponse.json({
      job: {
        ...job,
        status: 'completed',
        result_text: result.text,
      },
      workspaceItemId,
      libraryDocumentId,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
