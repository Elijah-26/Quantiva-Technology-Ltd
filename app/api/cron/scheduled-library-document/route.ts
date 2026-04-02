// Scheduled random library document — protect with CRON_SECRET (Vercel Cron or external ping)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { recordAuditEvent } from '@/lib/audit'
import { documentTypesForMarketCategory } from '@/lib/library-document-taxonomy'
import {
  synthesizeLibraryDocument,
  buildLibraryDocumentTitle,
  insertGeneratedLibraryRow,
  previewFromBody,
} from '@/lib/library-document-generation'

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('CRON_SECRET not set; scheduled-library-document rejected')
    return false
  }
  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true
  const q = request.nextUrl.searchParams.get('secret')
  return q === secret
}

export async function POST(request: NextRequest) {
  return runScheduled(request)
}

export async function GET(request: NextRequest) {
  return runScheduled(request)
}

async function runScheduled(request: NextRequest) {
  try {
    if (!authorizeCron(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: refRows, error: refErr } = await supabaseAdmin
      .from('reference_options')
      .select('kind, value, label')
      .in('kind', ['market_category', 'geography'])

    if (refErr) {
      return NextResponse.json({ error: refErr.message }, { status: 500 })
    }

    const categories = (refRows || []).filter((r) => r.kind === 'market_category')
    const geos = (refRows || []).filter((r) => r.kind === 'geography')

    const cat = pickRandom(categories)
    const geo = pickRandom(geos)
    if (!cat || !geo) {
      return NextResponse.json(
        { error: 'Missing reference_options for market_category or geography' },
        { status: 500 }
      )
    }

    const types = documentTypesForMarketCategory(cat.value)
    const docType = pickRandom(types)
    if (!docType) {
      return NextResponse.json({ error: 'No document types for category' }, { status: 500 })
    }

    const genInput = {
      marketCategoryValue: cat.value,
      marketCategoryLabel: cat.label,
      documentTypeId: docType.id,
      geographyValue: geo.value,
      geographyLabel: geo.label,
    }

    const dateSuffix = new Date().toISOString().slice(0, 10)
    const { text, error: synErr } = await synthesizeLibraryDocument(genInput)
    if (synErr || !text) {
      return NextResponse.json({ error: synErr || 'Generation failed' }, { status: 500 })
    }

    const title = buildLibraryDocumentTitle(genInput, dateSuffix)
    const preview = previewFromBody(text)

    const inserted = await insertGeneratedLibraryRow(supabaseAdmin, {
      title,
      fullContent: text,
      preview,
      marketCategoryValue: cat.value,
      geographyValue: geo.value,
      source: 'scheduled',
      createdByUserId: null,
    })

    if ('error' in inserted) {
      return NextResponse.json({ error: inserted.error }, { status: 500 })
    }

    const auditActor = process.env.CRON_AUDIT_USER_ID
    if (auditActor) {
      await recordAuditEvent(supabaseAdmin, {
        actorUserId: auditActor,
        action: 'library.document_generated_scheduled',
        entityType: 'library_document',
        entityId: inserted.id,
        metadata: {
          marketCategory: cat.value,
          documentType: docType.id,
          geography: geo.value,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      id: inserted.id,
      title,
      marketCategory: cat.value,
      documentType: docType.id,
      geography: geo.value,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
