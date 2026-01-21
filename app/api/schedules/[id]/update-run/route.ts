// POST /api/schedules/[id]/update-run - Update schedule after execution

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * Calculate next run date based on frequency
 */
function calculateNextRun(lastRun: Date, frequency: string): Date {
  const next = new Date(lastRun)
  
  switch (frequency.toLowerCase()) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      // Proper month calculation (not just +30 days)
      next.setMonth(next.getMonth() + 1)
      break
    default:
      throw new Error(`Unknown frequency: ${frequency}`)
  }
  
  return next
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    console.log(`📝 Updating schedule after execution: ${id}`)
    
    // Get current schedule
    const { data: schedule, error: fetchError } = await supabaseAdmin
      .from('schedules')
      .select('frequency, execution_count, last_run')
      .eq('id', id)
      .single()
    
    if (fetchError || !schedule) {
      console.error(`❌ Schedule not found: ${id}`, fetchError)
      return NextResponse.json(
        { error: 'Schedule not found', details: fetchError?.message },
        { status: 404 }
      )
    }
    
    const now = new Date()
    const nextRun = calculateNextRun(now, schedule.frequency)
    
    // Update schedule
    const { error: updateError } = await supabaseAdmin
      .from('schedules')
      .update({
        last_run: now.toISOString(),
        next_run: nextRun.toISOString(),
        execution_count: (schedule.execution_count || 0) + 1,
        last_execution_id: body.executionId || null,
        updated_at: now.toISOString()
      })
      .eq('id', id)
    
    if (updateError) {
      console.error(`❌ Error updating schedule ${id}:`, updateError)
      return NextResponse.json(
        { error: 'Failed to update schedule', details: updateError.message },
        { status: 500 }
      )
    }
    
    console.log(`✅ Updated schedule ${id}:`)
    console.log(`   Frequency: ${schedule.frequency}`)
    console.log(`   Last run: ${now.toISOString()}`)
    console.log(`   Next run: ${nextRun.toISOString()}`)
    console.log(`   Execution count: ${(schedule.execution_count || 0) + 1}`)
    
    return NextResponse.json({
      success: true,
      scheduleId: id,
      lastRun: now.toISOString(),
      nextRun: nextRun.toISOString(),
      executionCount: (schedule.execution_count || 0) + 1,
      message: 'Schedule updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Error in update-run:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Only POST is allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}

