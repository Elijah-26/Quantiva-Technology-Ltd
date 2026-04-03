import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import { isUserPlatformAdmin } from '@/lib/auth/admin'
import { recordAuditEvent } from '@/lib/audit'
import { insertGeneratedLibraryRow, previewFromBody } from '@/lib/library-document-generation'
import { isOnDemandDocId, sanitizeWizardContext } from '@/lib/on-demand-generation/wizard-flows'
import {
  synthesizeOnDemandDocument,
  WIZARD_DOC_LABELS,
} from '@/lib/on-demand-generation/synthesize-server'
import { insertCustomGenerationSeedIfNew } from '@/lib/custom-generation-seeds'

export { WIZARD_DOC_LABELS }

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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
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
    const wizardContextRaw = body.wizardContext

    if (!isOnDemandDocId(documentType)) {
      return NextResponse.json(
        {
          error:
            'Unsupported document type. Academic templates live under Academic Research; on-demand types are listed in the wizard.',
        },
        { status: 400 }
      )
    }

    const docId = documentType
    const wizardStored = sanitizeWizardContext(docId, wizardContextRaw)

    if (!companyName.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!industry || !jurisdiction) {
      return NextResponse.json({ error: 'Missing industry or jurisdiction' }, { status: 400 })
    }

    if (!(await isUserPlatformAdmin(user, supabaseAdmin))) {
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

    const insertRow: Record<string, unknown> = {
      user_id: user.id,
      status: 'processing',
      document_type: documentType,
      industry,
      jurisdiction,
      company_name: companyName,
      website,
      description,
      additional_requirements: additionalRequirements,
      wizard_context: wizardStored,
    }

    const { data: job, error: insErr } = await supabase.from('generation_jobs').insert(insertRow).select().single()

    if (insErr || !job) {
      return NextResponse.json({ error: insErr?.message || 'Insert failed' }, { status: 500 })
    }

    const legacy = {
      industry,
      jurisdiction,
      companyName,
      website,
      description,
      additionalRequirements,
    }

    const result = await synthesizeOnDemandDocument({
      documentType: docId,
      wizardContext: wizardStored,
      legacy,
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
    const libraryDescription = `On-demand document draft for ${companyName}. Industry: ${industry}. Jurisdiction: ${jurisdiction}.`

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

    if (documentType === 'custom') {
      const seedTitle = wizardStored.document_title?.trim() || companyName
      await insertCustomGenerationSeedIfNew(supabaseAdmin, {
        wizardContext: wizardStored,
        sourceUserId: user.id,
        documentTitle: seedTitle.slice(0, 500),
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
