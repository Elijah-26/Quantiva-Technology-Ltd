// Scheduled random library document(s) — CRON_SECRET; batch size from app_config / env

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  getScheduledLibraryDocumentsPerDay,
  runOneScheduledLibraryDocument,
  runScheduledLibraryHealthChecks,
} from '@/lib/scheduled-library-cron'

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

    if (request.nextUrl.searchParams.get('validate') === '1') {
      const [health, perDay] = await Promise.all([
        runScheduledLibraryHealthChecks(supabaseAdmin),
        getScheduledLibraryDocumentsPerDay(supabaseAdmin),
      ])
      return NextResponse.json({
        ok: true,
        mode: 'validate',
        health,
        documentsPerDay: perDay.count,
        documentsPerDaySource: perDay.source,
        maxDocumentsPerRun: perDay.maxCap,
      })
    }

    const dateSuffix = new Date().toISOString().slice(0, 10)
    const { count } = await getScheduledLibraryDocumentsPerDay(supabaseAdmin)

    const created: Array<{
      id: string
      title: string
      marketCategory: string
      documentType: string
      geography: string
    }> = []
    const errors: Array<{ index: number; error: string }> = []

    for (let i = 0; i < count; i++) {
      const result = await runOneScheduledLibraryDocument(supabaseAdmin, dateSuffix)
      if (result.ok) {
        created.push({
          id: result.id,
          title: result.title,
          marketCategory: result.marketCategory,
          documentType: result.documentType,
          geography: result.geography,
        })
      } else {
        errors.push({ index: i, error: result.error })
      }
    }

    if (created.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { ok: false, error: errors[0]?.error || 'Generation failed', errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      requested: count,
      createdCount: created.length,
      partial: created.length < count,
      created,
      errors: errors.length ? errors : undefined,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
