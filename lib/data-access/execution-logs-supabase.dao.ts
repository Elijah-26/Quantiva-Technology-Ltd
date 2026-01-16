// Data Access Object for execution logs - Supabase implementation
// This replaces the file-based storage with Supabase PostgreSQL

import { supabaseAdmin } from '../supabase/server'
import { ExecutionLog, ScheduleMetadata } from '../types/execution.types'

/**
 * Validate Supabase environment variables at runtime
 */
function validateSupabaseConfig(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    )
  }
}

/**
 * Generate unique execution ID
 */
export function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Save an execution log to Supabase
 */
export async function saveExecutionLog(log: ExecutionLog): Promise<void> {
  try {
    validateSupabaseConfig()
    
    const { error } = await supabaseAdmin
      .from('executions')
      .insert([log])

    if (error) {
      console.error('Supabase error saving execution log:', error)
      throw new Error(`Failed to save execution log: ${error.message}`)
    }

    console.log(`✓ Saved execution log: ${log.execution_id} for schedule: ${log.schedule_id}`)
  } catch (error) {
    console.error(`Error saving execution log:`, error)
    throw error
  }
}

/**
 * Get all execution logs for a schedule, sorted by execution time (most recent first)
 */
export async function getExecutionLogs(scheduleId: string): Promise<ExecutionLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('executions')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('run_at', { ascending: false })

    if (error) {
      console.error('Supabase error getting execution logs:', error)
      throw new Error(`Failed to read execution logs: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error(`Error reading execution logs for schedule ${scheduleId}:`, error)
    throw error
  }
}

/**
 * Check if a schedule has any execution logs
 */
export async function hasExecutionLogs(scheduleId: string): Promise<boolean> {
  try {
    const { count, error } = await supabaseAdmin
      .from('executions')
      .select('execution_id', { count: 'exact', head: true })
      .eq('schedule_id', scheduleId)

    if (error) throw error
    return (count || 0) > 0
  } catch (error) {
    console.error(`Error checking execution logs for schedule ${scheduleId}:`, error)
    return false
  }
}

/**
 * Get the latest execution log for a schedule
 */
export async function getLatestExecutionLog(scheduleId: string): Promise<ExecutionLog | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('executions')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('run_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Supabase error getting latest execution log:', error)
      throw error
    }

    return data || null
  } catch (error) {
    console.error(`Error getting latest execution log for schedule ${scheduleId}:`, error)
    return null
  }
}

/**
 * Get schedule metadata from Supabase
 */
export async function getScheduleMetadata(scheduleId: string): Promise<ScheduleMetadata | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('schedule_metadata')
      .select('*')
      .eq('schedule_id', scheduleId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error reading metadata:', error)
      throw error
    }

    return data || null
  } catch (error) {
    console.error(`Error reading metadata for schedule ${scheduleId}:`, error)
    return null
  }
}

/**
 * Save or update schedule metadata in Supabase
 */
export async function saveScheduleMetadata(metadata: ScheduleMetadata): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('schedule_metadata')
      .upsert([metadata], { onConflict: 'schedule_id' })

    if (error) {
      console.error('Supabase error saving metadata:', error)
      throw new Error(`Failed to save schedule metadata: ${error.message}`)
    }

    console.log(`✓ Saved metadata for schedule: ${metadata.schedule_id}`)
  } catch (error) {
    console.error(`Error saving metadata for schedule ${metadata.schedule_id}:`, error)
    throw error
  }
}

/**
 * Initialize a new schedule in Supabase
 */
export async function initializeSchedule(scheduleId: string): Promise<ScheduleMetadata> {
  try {
    const now = new Date().toISOString()
    const metadata: ScheduleMetadata = {
      schedule_id: scheduleId,
      initialized: true,
      first_run_at: null,
      total_executions: 0,
      last_execution_at: null,
      created_at: now,
      updated_at: now
    }

    await saveScheduleMetadata(metadata)
    console.log(`✓ Initialized schedule: ${scheduleId}`)

    return metadata
  } catch (error) {
    console.error(`Error initializing schedule ${scheduleId}:`, error)
    throw error
  }
}

/**
 * Update schedule metadata after an execution
 */
export async function updateScheduleMetadataAfterExecution(
  scheduleId: string,
  isFirstRun: boolean,
  runAt: string
): Promise<void> {
  try {
    let metadata = await getScheduleMetadata(scheduleId)

    if (!metadata) {
      metadata = await initializeSchedule(scheduleId)
    }

    const now = new Date().toISOString()
    const updates: Partial<ScheduleMetadata> = {
      total_executions: (metadata.total_executions || 0) + 1,
      last_execution_at: runAt,
      updated_at: now
    }

    if (isFirstRun && !metadata.first_run_at) {
      updates.first_run_at = runAt
      updates.initialized = true
    }

    const { error } = await supabaseAdmin
      .from('schedule_metadata')
      .update(updates)
      .eq('schedule_id', scheduleId)

    if (error) {
      console.error('Supabase error updating metadata:', error)
      throw new Error(`Failed to update schedule metadata: ${error.message}`)
    }

    console.log(`✓ Updated metadata for schedule: ${scheduleId}`)
  } catch (error) {
    console.error(`Error updating metadata for schedule ${scheduleId}:`, error)
    throw error
  }
}

/**
 * Get count of executions for a schedule
 */
export async function getExecutionCount(scheduleId: string): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('executions')
      .select('execution_id', { count: 'exact', head: true })
      .eq('schedule_id', scheduleId)

    if (error) {
      console.error('Supabase error getting execution count:', error)
      throw error
    }
    
    return count || 0
  } catch (error) {
    console.error(`Error getting execution count for schedule ${scheduleId}:`, error)
    return 0
  }
}

/**
 * Check if schedule is initialized
 */
export async function isScheduleInitialized(scheduleId: string): Promise<boolean> {
  const metadata = await getScheduleMetadata(scheduleId)
  return metadata !== null && metadata.initialized
}

/**
 * Log user activity to Supabase
 */
export async function logActivity(activity: {
  user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: any
  ip_address?: string
  user_agent?: string
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('activity_logs')
      .insert([{
        ...activity,
        created_at: new Date().toISOString()
      }])

    if (error) {
      console.error('Error logging activity:', error)
    }
  } catch (error) {
    // Don't throw - activity logging shouldn't break the main flow
    console.error('Error logging activity:', error)
  }
}

