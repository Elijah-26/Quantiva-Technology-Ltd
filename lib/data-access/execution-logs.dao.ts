// Data Access Object for execution logs - Server-side storage

import fs from 'fs'
import path from 'path'
import { ExecutionLog, ScheduleMetadata } from '../types/execution.types'

// Storage directory for execution logs
const STORAGE_DIR = path.join(process.cwd(), 'data', 'executions')
const METADATA_DIR = path.join(process.cwd(), 'data', 'schedules')

/**
 * Ensure storage directories exist
 */
function ensureStorageDirectories(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true })
  }
  if (!fs.existsSync(METADATA_DIR)) {
    fs.mkdirSync(METADATA_DIR, { recursive: true })
  }
}

/**
 * Get file path for a schedule's execution logs
 */
function getExecutionLogFilePath(scheduleId: string): string {
  return path.join(STORAGE_DIR, `${scheduleId}.json`)
}

/**
 * Get file path for a schedule's metadata
 */
function getMetadataFilePath(scheduleId: string): string {
  return path.join(METADATA_DIR, `${scheduleId}.json`)
}

/**
 * Generate unique execution ID
 */
export function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Save an execution log
 */
export function saveExecutionLog(log: ExecutionLog): void {
  try {
    ensureStorageDirectories()
    
    const filePath = getExecutionLogFilePath(log.schedule_id)
    let logs: ExecutionLog[] = []
    
    // Read existing logs if file exists
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      logs = JSON.parse(content)
    }
    
    // Add new log at the beginning (most recent first)
    logs.unshift(log)
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error saving execution log for schedule ${log.schedule_id}:`, error)
    throw new Error(`Failed to save execution log: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get all execution logs for a schedule, sorted by execution time (most recent first)
 */
export function getExecutionLogs(scheduleId: string): ExecutionLog[] {
  try {
    const filePath = getExecutionLogFilePath(scheduleId)
    
    if (!fs.existsSync(filePath)) {
      return []
    }
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const logs: ExecutionLog[] = JSON.parse(content)
    
    // Sort by run_at timestamp (most recent first)
    return logs.sort((a, b) => {
      return new Date(b.run_at).getTime() - new Date(a.run_at).getTime()
    })
  } catch (error) {
    console.error(`Error reading execution logs for schedule ${scheduleId}:`, error)
    throw new Error(`Failed to read execution logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Check if a schedule has any execution logs
 */
export function hasExecutionLogs(scheduleId: string): boolean {
  const filePath = getExecutionLogFilePath(scheduleId)
  return fs.existsSync(filePath)
}

/**
 * Get the latest execution log for a schedule
 */
export function getLatestExecutionLog(scheduleId: string): ExecutionLog | null {
  const logs = getExecutionLogs(scheduleId)
  return logs.length > 0 ? logs[0] : null
}

/**
 * Get schedule metadata
 */
export function getScheduleMetadata(scheduleId: string): ScheduleMetadata | null {
  try {
    const filePath = getMetadataFilePath(scheduleId)
    
    if (!fs.existsSync(filePath)) {
      return null
    }
    
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading metadata for schedule ${scheduleId}:`, error)
    return null
  }
}

/**
 * Save or update schedule metadata
 */
export function saveScheduleMetadata(metadata: ScheduleMetadata): void {
  try {
    ensureStorageDirectories()
    
    const filePath = getMetadataFilePath(metadata.schedule_id)
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error saving metadata for schedule ${metadata.schedule_id}:`, error)
    throw new Error(`Failed to save schedule metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Initialize a new schedule (create storage location and metadata)
 */
export function initializeSchedule(scheduleId: string): ScheduleMetadata {
  try {
    ensureStorageDirectories()
    
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
    
    saveScheduleMetadata(metadata)
    
    // Create empty execution log file
    const logFilePath = getExecutionLogFilePath(scheduleId)
    if (!fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, JSON.stringify([], null, 2), 'utf-8')
    }
    
    return metadata
  } catch (error) {
    console.error(`Error initializing schedule ${scheduleId}:`, error)
    throw new Error(`Failed to initialize schedule: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Update schedule metadata after an execution
 */
export function updateScheduleMetadataAfterExecution(
  scheduleId: string,
  isFirstRun: boolean,
  runAt: string
): void {
  try {
    let metadata = getScheduleMetadata(scheduleId)
    
    if (!metadata) {
      // If metadata doesn't exist, initialize it
      metadata = initializeSchedule(scheduleId)
    }
    
    const now = new Date().toISOString()
    
    metadata.total_executions += 1
    metadata.last_execution_at = runAt
    metadata.updated_at = now
    
    if (isFirstRun && !metadata.first_run_at) {
      metadata.first_run_at = runAt
      metadata.initialized = true
    }
    
    saveScheduleMetadata(metadata)
  } catch (error) {
    console.error(`Error updating metadata for schedule ${scheduleId}:`, error)
    throw new Error(`Failed to update schedule metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get count of executions for a schedule
 */
export function getExecutionCount(scheduleId: string): number {
  const logs = getExecutionLogs(scheduleId)
  return logs.length
}

/**
 * Check if schedule is initialized
 */
export function isScheduleInitialized(scheduleId: string): boolean {
  const metadata = getScheduleMetadata(scheduleId)
  return metadata !== null && metadata.initialized
}

