import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { isUserPlatformAdmin } from '@/lib/auth/admin'

function startOfMonthUtc(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
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

    const som = startOfMonthUtc()

    const [
      usersCount,
      libraryCount,
      reportsTotal,
      reportsMonth,
      schedulesActive,
      genCompletedMonth,
      recentUsers,
      recentDocs,
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('library_documents').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).gte('run_at', som),
      supabaseAdmin.from('schedules').select('id', { count: 'exact', head: true }).eq('active', true),
      supabaseAdmin
        .from('generation_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', som),
      supabaseAdmin
        .from('users')
        .select('id, email, full_name, company_name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
      supabaseAdmin
        .from('library_documents')
        .select('id, title, category, source, updated_at, download_count')
        .order('updated_at', { ascending: false })
        .limit(8),
    ])

    return NextResponse.json({
      counts: {
        totalUsers: usersCount.count ?? 0,
        totalLibraryDocuments: libraryCount.count ?? 0,
        totalReports: reportsTotal.count ?? 0,
        reportsThisMonth: reportsMonth.count ?? 0,
        activeSchedules: schedulesActive.count ?? 0,
        generationsCompletedThisMonth: genCompletedMonth.count ?? 0,
      },
      recentUsers: recentUsers.data ?? [],
      recentLibraryDocuments: recentDocs.data ?? [],
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
