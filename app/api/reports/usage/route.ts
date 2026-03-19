// GET /api/reports/usage - Returns current user's report usage and plan limits
// Used by new-research page before submit to check if user can create reports / use recurring

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserPlanAndLimits } from '@/lib/plan-helper'
import type { SubscriptionPlan } from '@/lib/plan-limits'

export interface UsageResponse {
  usedThisMonth: number
  limit: number
  canCreate: boolean
  plan: SubscriptionPlan | null
  recurringEnabled: boolean
}

function isAdmin(user: { email?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }) {
  const um = user.user_metadata as { role?: string } | undefined
  const am = user.app_metadata as { role?: string } | undefined
  return (
    um?.role === 'admin' ||
    am?.role === 'admin' ||
    user.email === 'admin@quantitva.com' ||
    user.email === 'pat2echo@gmail.com'
  )
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
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in to view usage.' },
        { status: 401 }
      )
    }

    const { plan, limits } = await getUserPlanAndLimits(user.id)

    // Admins bypass limits
    if (isAdmin(user)) {
      return NextResponse.json({
        usedThisMonth: 0,
        limit: Infinity,
        canCreate: true,
        plan: plan ?? 'enterprise',
        recurringEnabled: true,
      } satisfies UsageResponse)
    }

    // Count reports for user in current month (UTC)
    const now = new Date()
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

    const { count, error: countError } = await supabaseAdmin
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('run_at', startOfMonth)

    if (countError) {
      console.error('Error counting reports:', countError)
      return NextResponse.json(
        { error: 'Failed to fetch usage', details: countError.message },
        { status: 500 }
      )
    }

    const usedThisMonth = count ?? 0
    const canCreate = limits.reportsPerMonth === Infinity || usedThisMonth < limits.reportsPerMonth

    return NextResponse.json({
      usedThisMonth,
      limit: limits.reportsPerMonth === Infinity ? -1 : limits.reportsPerMonth,
      canCreate,
      plan,
      recurringEnabled: limits.recurringEnabled,
    } satisfies UsageResponse)
  } catch (err) {
    console.error('Unexpected error in GET /api/reports/usage:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
