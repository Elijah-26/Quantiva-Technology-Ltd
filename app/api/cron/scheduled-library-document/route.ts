// Scheduled random library document(s) — CRON_SECRET; batch size from app_config / env

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import {
  getScheduledLibraryDocumentsPerDay,
  runScheduledLibraryBatch,
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

    const batch = await runScheduledLibraryBatch(supabaseAdmin)

    if (!batch.ok) {
      return NextResponse.json(
        { ok: false, error: batch.error, errors: batch.errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      requested: batch.requested,
      createdCount: batch.createdCount,
      partial: batch.partial,
      created: batch.created,
      errors: batch.errors,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
