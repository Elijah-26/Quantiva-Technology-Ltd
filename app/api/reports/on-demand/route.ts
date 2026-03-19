// POST /api/reports/on-demand - Save on-demand report to database
// This endpoint is called when webhook returns with report data
// Enforces plan-based report limits (403 with upgrade message when exceeded)

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getUserPlanAndLimits } from '@/lib/plan-helper'

const UPGRADE_URL = '/pricing'

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

export interface OnDemandReportRequest {
  user_id: string  // CRITICAL: Required for multi-user isolation
  industry: string
  sub_niche: string
  geography: string
  email: string
  final_report: string
  email_report?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: OnDemandReportRequest
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Request body must be valid JSON' },
        { status: 400 }
      )
    }

    console.log('📥 Received on-demand report:', body)

    // Validate required fields
    const errors: string[] = []
    if (!body.user_id) errors.push('user_id is required')
    if (!body.industry) errors.push('industry is required')
    if (!body.sub_niche) errors.push('sub_niche is required')
    if (!body.email) errors.push('email is required')
    if (!body.final_report) errors.push('final_report is required')

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors.join(', ') },
        { status: 400 }
      )
    }

    // ===== AUTH & PLAN LIMITS =====
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
        { error: 'Unauthorized', details: 'You must be logged in to save reports.' },
        { status: 401 }
      )
    }

    if (body.user_id !== user.id && !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Cannot save report for another user.' },
        { status: 403 }
      )
    }

    const { plan, limits } = await getUserPlanAndLimits(user.id)

    if (!isAdmin(user) && limits.reportsPerMonth !== Infinity) {
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
          { error: 'Failed to check usage', details: countError.message },
          { status: 500 }
        )
      }

      const usedThisMonth = count ?? 0
      if (usedThisMonth >= limits.reportsPerMonth) {
        return NextResponse.json(
          {
            error: "You've reached your plan limit. Please upgrade to continue.",
            code: 'REPORTS_LIMIT',
            upgradeUrl: UPGRADE_URL,
          },
          { status: 403 }
        )
      }
    }

    // Generate unique execution ID
    const execution_id = `ondemand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Save to Supabase reports table with user_id
    const { data: report, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert({
        execution_id,
        schedule_id: null, // On-demand reports don't have a schedule
        user_id: body.user_id, // CRITICAL: User isolation
        industry: body.industry,
        sub_niche: body.sub_niche,
        frequency: 'on-demand',
        run_at: new Date().toISOString(),
        is_first_run: true,
        final_report: body.final_report,
        email_report: body.email_report || body.final_report,
        geography: body.geography || 'Global',
        email: body.email,
        notes: body.notes || '',
        status: 'success',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error saving report to Supabase:', insertError)
      return NextResponse.json(
        { error: 'Failed to save report', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('✅ Report saved successfully:', execution_id)

    return NextResponse.json({
      success: true,
      execution_id,
      report_id: execution_id,
      message: 'On-demand report saved successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Unexpected error in POST /api/reports/on-demand:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

