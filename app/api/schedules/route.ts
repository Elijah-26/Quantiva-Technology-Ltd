// POST /api/schedules — create a recurring research schedule (Supabase)

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { calculateNextRun, generateScheduleId } from '@/lib/schedules'

const FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly'] as const

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in' },
        { status: 401 }
      )
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const marketCategory = typeof body.marketCategory === 'string' ? body.marketCategory.trim() : ''
    const subNiche = typeof body.subNiche === 'string' ? body.subNiche.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const frequency = typeof body.frequency === 'string' ? body.frequency.toLowerCase() : ''
    const geography =
      typeof body.geography === 'string' && body.geography.trim() !== ''
        ? body.geography.trim()
        : 'Global'
    const notes = typeof body.notes === 'string' ? body.notes : ''

    if (!marketCategory || !subNiche || !email) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'marketCategory, subNiche, and email are required' },
        { status: 400 }
      )
    }

    if (!FREQUENCIES.includes(frequency as (typeof FREQUENCIES)[number])) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'frequency must be daily, weekly, biweekly, or monthly' },
        { status: 400 }
      )
    }

    const now = new Date()
    const nextRun = calculateNextRun(now, frequency as (typeof FREQUENCIES)[number])
    const schedule_id = generateScheduleId()

    const row = {
      user_id: user.id,
      schedule_id,
      title: `${marketCategory} - ${subNiche}`,
      industry: marketCategory,
      sub_niche: subNiche,
      geography,
      email,
      frequency,
      notes,
      active: true,
      status: 'active',
      last_run: null as string | null,
      next_run: nextRun.toISOString(),
      execution_count: 0,
      paused_at: null as string | null,
      updated_at: now.toISOString(),
    }

    const { data: schedule, error: insertError } = await supabase
      .from('schedules')
      .insert(row)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating schedule:', insertError)
      return NextResponse.json(
        { error: 'Failed to create schedule', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, schedule }, { status: 201 })
  } catch (error) {
    console.error('POST /api/schedules:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
