import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import { isPlatformAdmin } from '@/lib/auth/admin'
import type { SubscriptionPlan } from '@/lib/plan-limits'
import type { BillingSummaryResponse } from '@/lib/billing-summary'

function startOfMonthUtc(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

function countFrom(res: { count: number | null; error?: { message: string } | null }): number {
  if (res.error) console.error('[billing/summary] count error', res.error.message)
  return res.count ?? 0
}

function normalizePlan(raw: string | null | undefined): SubscriptionPlan | null {
  if (raw == null || raw === '') return null
  const p = String(raw).toLowerCase().trim()
  if (p === 'starter') return 'starter'
  if (p === 'professional' || p === 'pro') return 'professional'
  if (p === 'enterprise' || p === 'business') return 'enterprise'
  return null
}

function planDisplayName(plan: SubscriptionPlan | null, isAdmin: boolean): string {
  if (isAdmin) return 'Admin'
  if (!plan || plan === 'starter') return 'Starter'
  if (plan === 'professional') return 'Professional'
  return 'Enterprise'
}

function firstOfNextMonthUtcFormatted(): string {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
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
      .select('plan, role')
      .eq('id', uid)
      .maybeSingle()

    const admin = isPlatformAdmin(user) || profile?.role === 'admin'
    const normalized = normalizePlan(profile?.plan as string | undefined)

    const [repMonth, genMonth] = await Promise.all([
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
    ])

    const { limits } = await getUserPlanAndLimits(uid)
    const cap = limits.reportsPerMonth
    const reportsLimit = limitForJson(admin, cap)
    const generationsLimit = reportsLimit

    const now = new Date()
    const currentYear = now.getUTCFullYear()

    let renewalPrimary: string
    let renewalSecondary: string | null

    if (admin) {
      renewalPrimary = 'You have platform admin access — no paid subscription is required.'
      renewalSecondary = null
    } else if (!normalized || normalized === 'starter') {
      renewalPrimary = `You're on the free Starter plan.`
      renewalSecondary = `AI generation and report limits reset on ${firstOfNextMonthUtcFormatted()} (UTC).`
    } else {
      renewalPrimary = `You're on the ${planDisplayName(normalized, false)} plan.`
      renewalSecondary = `Usage limits reset each calendar month. Next reset: ${firstOfNextMonthUtcFormatted()} (UTC). Exact Stripe renewal dates will appear after checkout is connected.`
    }

    const body: BillingSummaryResponse = {
      planId: admin ? null : (normalized ?? 'starter'),
      planDisplayName: planDisplayName(normalized, admin),
      isAdmin: admin,
      renewalPrimary,
      renewalSecondary,
      currentYear,
      usage: {
        generationsUsedThisMonth: countFrom(genMonth),
        generationsLimit: generationsLimit,
        reportsUsedThisMonth: countFrom(repMonth),
        reportsLimit: reportsLimit,
      },
    }

    return NextResponse.json(body)
  } catch (e) {
    console.error('billing/summary', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
