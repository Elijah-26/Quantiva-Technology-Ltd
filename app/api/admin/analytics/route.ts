import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'

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

    if (!(await isUserPlatformAdmin(user, supabaseAdmin))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const range = request.nextUrl.searchParams.get('range') || '30d'
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceIso = since.toISOString()

    const [
      usersC,
      usersInRangeC,
      reportsC,
      schedulesC,
      genC,
      modC,
      libC,
      workspaceC,
      reportsByDay,
      usersJoined,
      auditRows,
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).gte('created_at', sinceIso),
      supabaseAdmin
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .gte('run_at', sinceIso),
      supabaseAdmin.from('schedules').select('id', { count: 'exact', head: true }).eq('active', true),
      supabaseAdmin
        .from('generation_jobs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sinceIso),
      supabaseAdmin
        .from('moderation_items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabaseAdmin
        .from('library_documents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sinceIso),
      supabaseAdmin
        .from('workspace_items')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sinceIso),
      supabaseAdmin.from('reports').select('run_at').gte('run_at', sinceIso).order('run_at', { ascending: true }),
      supabaseAdmin.from('users').select('created_at').gte('created_at', sinceIso).order('created_at', { ascending: true }),
      supabaseAdmin
        .from('audit_events')
        .select('action, created_at')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(5000),
    ])

    const reportBuckets: Record<string, number> = {}
    for (const r of reportsByDay.data || []) {
      const d = (r.run_at as string).slice(0, 10)
      reportBuckets[d] = (reportBuckets[d] || 0) + 1
    }

    const signupBuckets: Record<string, number> = {}
    for (const r of usersJoined.data || []) {
      const d = (r.created_at as string).slice(0, 10)
      signupBuckets[d] = (signupBuckets[d] || 0) + 1
    }

    const dateKeys = Array.from(new Set([...Object.keys(reportBuckets), ...Object.keys(signupBuckets)])).sort()

    const chartRows =
      dateKeys.length > 0
        ? dateKeys.map((date) => ({
            name: date.slice(5),
            generations: reportBuckets[date] || 0,
            signups: signupBuckets[date] || 0,
          }))
        : [{ name: '—', generations: 0, signups: 0 }]

    const auditByAction: Record<string, number> = {}
    for (const r of auditRows.data || []) {
      const a = (r.action as string) || 'unknown'
      auditByAction[a] = (auditByAction[a] || 0) + 1
    }
    const auditTop = Object.entries(auditByAction)
      .map(([action, count]) => ({ action, count }))
      .sort((x, y) => y.count - x.count)
      .slice(0, 20)

    return NextResponse.json({
      range,
      kpis: {
        totalUsers: usersC.count ?? 0,
        newUsersInRange: usersInRangeC.count ?? 0,
        reportsInRange: reportsC.count ?? 0,
        activeSchedules: schedulesC.count ?? 0,
        generationsInRange: genC.count ?? 0,
        moderationPending: modC.count ?? 0,
        libraryDocumentsInRange: libC.count ?? 0,
        workspaceItemsInRange: workspaceC.count ?? 0,
      },
      chart: chartRows,
      auditTop,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
