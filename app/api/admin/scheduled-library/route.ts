import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'
import {
  getScheduledLibraryDocumentsPerDay,
  upsertScheduledLibraryDocumentsPerDay,
  runScheduledLibraryHealthChecks,
  scheduledLibraryMaxPerRun,
} from '@/lib/scheduled-library-cron'

type AdminAuth =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse }

async function requireAdmin(): Promise<AdminAuth> {
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
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!(await isUserPlatformAdmin(user, supabaseAdmin))) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, user }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const perDay = await getScheduledLibraryDocumentsPerDay(supabaseAdmin)
    const validate = request.nextUrl.searchParams.get('validate') === '1'

    const body: Record<string, unknown> = {
      documentsPerDay: perDay.count,
      documentsPerDaySource: perDay.source,
      maxDocumentsPerRun: perDay.maxCap,
      environmentFallback: process.env.SCHEDULED_LIBRARY_DOCUMENTS_PER_DAY || null,
      cronScheduleUtc: '0 8 * * *',
      cronPath: '/api/cron/scheduled-library-document',
    }

    if (validate) {
      body.health = await runScheduledLibraryHealthChecks(supabaseAdmin)
    }

    return NextResponse.json(body)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json().catch(() => ({}))
    const raw = body.documentsPerDay
    const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10)
    if (!Number.isFinite(n) || n < 1) {
      return NextResponse.json({ error: 'documentsPerDay must be a number ≥ 1' }, { status: 400 })
    }

    const maxCap = scheduledLibraryMaxPerRun()
    if (n > maxCap) {
      return NextResponse.json(
        { error: `documentsPerDay cannot exceed ${maxCap} (SCHEDULED_LIBRARY_DOCUMENTS_MAX_PER_DAY)` },
        { status: 400 }
      )
    }

    const { error } = await upsertScheduledLibraryDocumentsPerDay(supabaseAdmin, n)
    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    const perDay = await getScheduledLibraryDocumentsPerDay(supabaseAdmin)
    return NextResponse.json({
      documentsPerDay: perDay.count,
      documentsPerDaySource: perDay.source,
      maxDocumentsPerRun: perDay.maxCap,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
