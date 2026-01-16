// Business logic service for report execution

import {
  ExecutionLog,
  ReportRunRequest,
  ReportRunResponse,
  ReportsListResponse
} from '../types/execution.types'
import {
  saveExecutionLog,
  getExecutionLogs,
  generateExecutionId,
  initializeSchedule,
  updateScheduleMetadataAfterExecution,
  isScheduleInitialized,
  getExecutionCount
} from '../data-access/execution-logs.dao'

/**
 * Process a report run request from n8n
 * Handles both first runs and subsequent executions
 */
export async function processReportRun(request: ReportRunRequest): Promise<ReportRunResponse> {
  try {
    const { schedule_id, is_first_run, run_at } = request
    
    // Check if this is truly a first run
    const alreadyInitialized = isScheduleInitialized(schedule_id)
    
    if (is_first_run && alreadyInitialized) {
      // Log a warning but continue processing
      console.warn(`Schedule ${schedule_id} marked as first_run but already initialized`)
    }
    
    // Initialize schedule if it's a first run and not yet initialized
    if (is_first_run && !alreadyInitialized) {
      initializeSchedule(schedule_id)
      console.log(`✓ Initialized schedule: ${schedule_id}`)
    }
    
    // Create execution log entry
    const executionLog: ExecutionLog = {
      execution_id: generateExecutionId(),
      schedule_id: request.schedule_id,
      industry: request.industry,
      sub_niche: request.sub_niche,
      frequency: request.frequency,
      run_at: request.run_at,
      is_first_run: request.is_first_run,
      final_report: request.final_report,
      created_at: new Date().toISOString(),
      status: 'success'
    }
    
    // Save the execution log
    saveExecutionLog(executionLog)
    console.log(`✓ Saved execution log: ${executionLog.execution_id} for schedule: ${schedule_id}`)
    
    // Update schedule metadata
    updateScheduleMetadataAfterExecution(schedule_id, is_first_run, run_at)
    console.log(`✓ Updated metadata for schedule: ${schedule_id}`)
    
    // Prepare response
    const response: ReportRunResponse = {
      success: true,
      execution_id: executionLog.execution_id,
      schedule_id: schedule_id,
      is_first_run: is_first_run && !alreadyInitialized,
      message: is_first_run && !alreadyInitialized
        ? 'First execution logged successfully. Schedule initialized.'
        : 'Execution logged successfully.',
      timestamp: new Date().toISOString()
    }
    
    return response
  } catch (error) {
    console.error('Error processing report run:', error)
    throw new Error(
      `Failed to process report run: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Get all execution logs for a specific schedule
 */
export async function getReportsBySchedule(scheduleId: string): Promise<ReportsListResponse> {
  try {
    // Validate schedule_id
    if (!scheduleId || scheduleId.trim().length === 0) {
      throw new Error('Invalid schedule_id')
    }
    
    // Get execution logs
    const executions = getExecutionLogs(scheduleId)
    const totalExecutions = getExecutionCount(scheduleId)
    
    console.log(`✓ Retrieved ${totalExecutions} execution(s) for schedule: ${scheduleId}`)
    
    // Prepare response
    const response: ReportsListResponse = {
      success: true,
      schedule_id: scheduleId,
      total_executions: totalExecutions,
      executions: executions
    }
    
    return response
  } catch (error) {
    console.error(`Error getting reports for schedule ${scheduleId}:`, error)
    throw new Error(
      `Failed to retrieve reports: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Validate that a schedule exists and has been initialized
 */
export function validateScheduleExists(scheduleId: string): boolean {
  return isScheduleInitialized(scheduleId)
}

