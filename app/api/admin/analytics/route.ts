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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
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

    const [usersC, reportsC, schedulesC, genC, modC] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
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
    ])

    const { data: reportsByDay } = await supabaseAdmin
      .from('reports')
      .select('run_at')
      .gte('run_at', sinceIso)
      .order('run_at', { ascending: true })

    const dayBuckets: Record<string, number> = {}
    for (const r of reportsByDay || []) {
      const d = (r.run_at as string).slice(0, 10)
      dayBuckets[d] = (dayBuckets[d] || 0) + 1
    }

    const chartRows = Object.entries(dayBuckets).map(([date, generations]) => ({
      name: date.slice(5),
      generations,
      signups: 0,
    }))

    return NextResponse.json({
      range,
      kpis: {
        totalUsers: usersC.count ?? 0,
        reportsInRange: reportsC.count ?? 0,
        activeSchedules: schedulesC.count ?? 0,
        generationsInRange: genC.count ?? 0,
        moderationPending: modC.count ?? 0,
      },
      chart: chartRows.length ? chartRows : [{ name: '—', generations: 0, signups: 0 }],
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
