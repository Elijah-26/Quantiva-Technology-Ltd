// GET /api/dashboard/summary — home dashboard stats and activity

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import { isPlatformAdmin } from '@/lib/auth/admin'
import type {
  DashboardActivityItem,
  DashboardSummaryResponse,
} from '@/lib/dashboard-summary'

function startOfMonthUtc(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return d.toLocaleDateString()
}

function limitForJson(admin: boolean, raw: number): number {
  if (admin) return -1
  if (raw === Infinity) return -1
  return raw
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

    const uid = user.id
    const som = startOfMonthUtc()

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('full_name, plan, role')
      .eq('id', uid)
      .maybeSingle()

    const admin = isPlatformAdmin(user) || profile?.role === 'admin'

    const greetingName =
      profile?.full_name?.trim() ||
      user.email?.split('@')[0] ||
      'there'

    let planLabel: string
    if (admin) {
      planLabel = 'Admin'
    } else if (profile?.role === 'admin') {
      planLabel = 'Admin'
    } else {
      const p = profile?.plan
      planLabel = p
        ? `${String(p).charAt(0).toUpperCase()}${String(p).slice(1)} plan`
        : 'Starter plan'
    }

    const [
      libCount,
      wsCount,
      genCompleted,
      repTotal,
      repMonth,
      genMonth,
      wsRows,
      repRows,
      genRows,
      topTemplates,
    ] = await Promise.all([
      supabaseAdmin.from('library_documents').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('workspace_items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid),
      supabaseAdmin
        .from('generation_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('status', 'completed'),
      supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', uid),
      supabaseAdmin
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .gte('run_at', som),
      supabaseAdmin
        .from('generation_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .gte('created_at', som),
      supabaseAdmin
        .from('workspace_items')
        .select('id, title, doc_type, status, updated_at')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false })
        .limit(8),
      supabaseAdmin
        .from('reports')
        .select('execution_id, industry, sub_niche, run_at, status')
        .eq('user_id', uid)
        .order('run_at', { ascending: false })
        .limit(8),
      supabaseAdmin
        .from('generation_jobs')
        .select('id, document_type, company_name, status, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(8),
      supabaseAdmin
        .from('library_documents')
        .select('id, title, category, rating')
        .order('rating', { ascending: false })
        .limit(3),
    ])

    const activity: DashboardActivityItem[] = []

    for (const r of wsRows.data || []) {
      activity.push({
        id: `w-${r.id}`,
        kind: 'workspace',
        title: r.title,
        subtitle: formatRelative(r.updated_at),
        status: r.status || 'saved',
        at: r.updated_at,
      })
    }
    for (const r of repRows.data || []) {
      const title = `${r.industry || 'Report'} — ${r.sub_niche || 'Research'}`
      activity.push({
        id: `r-${r.execution_id}`,
        kind: 'report',
        title,
        subtitle: formatRelative(r.run_at),
        status: r.status || 'success',
        at: r.run_at,
        reportExecutionId: r.execution_id,
      })
    }
    for (const r of genRows.data || []) {
      activity.push({
        id: `g-${r.id}`,
        kind: 'generation',
        title: r.company_name
          ? `${r.document_type || 'Document'} — ${r.company_name}`
          : r.document_type || 'AI document',
        subtitle: formatRelative(r.created_at),
        status: r.status,
        at: r.created_at,
      })
    }

    activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

    const { limits } = await getUserPlanAndLimits(uid)
    const cap = limits.reportsPerMonth
    const reportsLimit = limitForJson(admin, cap)
    const generationsLimit = reportsLimit

    const body: DashboardSummaryResponse = {
      greetingName,
      planLabel,
      stats: {
        libraryTemplates: libCount.count ?? 0,
        workspaceItems: wsCount.count ?? 0,
        aiGenerationsCompleted: genCompleted.count ?? 0,
        researchReports: repTotal.count ?? 0,
      },
      recentActivity: activity.slice(0, 8),
      recommendedTemplates: (topTemplates.data || []).map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        rating: Number(t.rating) || 0,
      })),
      usage: {
        reportsUsedThisMonth: repMonth.count ?? 0,
        reportsLimit,
        generationsUsedThisMonth: genMonth.count ?? 0,
        generationsLimit,
      },
    }

    return NextResponse.json(body)
  } catch (e) {
    console.error('dashboard summary', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
