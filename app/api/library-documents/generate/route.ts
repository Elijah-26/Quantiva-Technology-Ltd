// GET: options for form (market categories, geographies, document types for a category)
// POST: on-demand generate + insert into library_documents

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import { isPlatformAdmin } from '@/lib/auth/admin'
import { recordAuditEvent } from '@/lib/audit'
import { documentTypesForMarketCategory, isDocTypeAllowedForCategory } from '@/lib/library-document-taxonomy'
import {
  synthesizeLibraryDocument,
  buildLibraryDocumentTitle,
  insertGeneratedLibraryRow,
  previewFromBody,
} from '@/lib/library-document-generation'

export async function GET(request: NextRequest) {
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

    const { data: rows, error } = await supabaseAdmin
      .from('reference_options')
      .select('kind, value, label, sort_order')
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = rows || []
    const marketCategories = list
      .filter((r) => r.kind === 'market_category')
      .map((r) => ({ value: r.value, label: r.label }))
    const geographies = list
      .filter((r) => r.kind === 'geography')
      .map((r) => ({ value: r.value, label: r.label }))

    const marketCategory = request.nextUrl.searchParams.get('marketCategory') || marketCategories[0]?.value || ''
    const documentTypes = marketCategory
      ? documentTypesForMarketCategory(marketCategory)
      : documentTypesForMarketCategory('')

    return NextResponse.json({
      marketCategories,
      geographies,
      documentTypes,
    })
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

    const body = await request.json().catch(() => ({}))
    const marketCategory = typeof body.marketCategory === 'string' ? body.marketCategory.trim() : ''
    const documentType = typeof body.documentType === 'string' ? body.documentType.trim() : ''
    const geography = typeof body.geography === 'string' ? body.geography.trim() : ''

    if (!marketCategory || !documentType || !geography) {
      return NextResponse.json(
        { error: 'marketCategory, documentType, and geography are required' },
        { status: 400 }
      )
    }

    if (!isDocTypeAllowedForCategory(marketCategory, documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type for the selected industry category' },
        { status: 400 }
      )
    }

    const { data: refRows, error: refErr } = await supabaseAdmin
      .from('reference_options')
      .select('kind, value, label')
      .in('kind', ['market_category', 'geography'])

    if (refErr) {
      return NextResponse.json({ error: refErr.message }, { status: 500 })
    }

    const catLabel =
      refRows?.find((r) => r.kind === 'market_category' && r.value === marketCategory)?.label ||
      marketCategory
    const geoLabel =
      refRows?.find((r) => r.kind === 'geography' && r.value === geography)?.label || geography

    if (!isPlatformAdmin(user)) {
      const { limits } = await getUserPlanAndLimits(user.id)
      if (limits.reportsPerMonth !== Infinity) {
        const now = new Date()
        const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
        const [genRes, libRes] = await Promise.all([
          supabaseAdmin
            .from('generation_jobs')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfMonth),
          supabaseAdmin
            .from('library_documents')
            .select('id', { count: 'exact', head: true })
            .eq('created_by_user_id', user.id)
            .eq('source', 'on_demand')
            .gte('created_at', startOfMonth),
        ])
        if (genRes.error || libRes.error) {
          return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
        }
        const used = (genRes.count ?? 0) + (libRes.count ?? 0)
        if (used >= limits.reportsPerMonth) {
          return NextResponse.json(
            { error: 'Plan limit reached for generations this month', code: 'GEN_LIMIT' },
            { status: 403 }
          )
        }
      }
    }

    const genInput = {
      marketCategoryValue: marketCategory,
      marketCategoryLabel: catLabel,
      documentTypeId: documentType,
      geographyValue: geography,
      geographyLabel: geoLabel,
    }

    const { text, error: synErr } = await synthesizeLibraryDocument(genInput)
    if (synErr || !text) {
      return NextResponse.json({ error: synErr || 'Generation failed' }, { status: 500 })
    }

    const title = buildLibraryDocumentTitle(genInput)
    const preview = previewFromBody(text)

    const inserted = await insertGeneratedLibraryRow(supabaseAdmin, {
      title,
      fullContent: text,
      preview,
      marketCategoryValue: marketCategory,
      geographyValue: geography,
      source: 'on_demand',
      createdByUserId: user.id,
    })

    if ('error' in inserted) {
      return NextResponse.json({ error: inserted.error }, { status: 500 })
    }

    await recordAuditEvent(supabaseAdmin, {
      actorUserId: user.id,
      action: 'library.document_generated_on_demand',
      entityType: 'library_document',
      entityId: inserted.id,
      metadata: { marketCategory, documentType, geography },
    })

    return NextResponse.json({
      document: {
        id: inserted.id,
        title,
        preview,
        fullContent: text,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
