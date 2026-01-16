/**
 * Example API Client for Report Run System
 * 
 * This file demonstrates how to interact with the Report Run API
 * from a Node.js application or browser JavaScript.
 */

// ============================================
// Configuration
// ============================================

const API_BASE_URL = 'http://localhost:3000'

// ============================================
// API Client Functions
// ============================================

/**
 * Submit a report execution to the API
 * @param {Object} reportData - The report execution data
 * @returns {Promise<Object>} - API response
 */
async function submitReportExecution(reportData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/report-run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error} - ${data.details || ''}`)
    }
    
    return data
  } catch (error) {
    console.error('Error submitting report execution:', error)
    throw error
  }
}

/**
 * Get all executions for a specific schedule
 * @param {string} scheduleId - The schedule ID
 * @returns {Promise<Object>} - API response with executions
 */
async function getScheduleExecutions(scheduleId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${scheduleId}`)
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`API Error: ${data.error} - ${data.details || ''}`)
    }
    
    return data
  } catch (error) {
    console.error('Error getting schedule executions:', error)
    throw error
  }
}

// ============================================
// Example Usage
// ============================================

/**
 * Example 1: Submit a first run execution
 */
async function example1_FirstRun() {
  console.log('\n=== Example 1: First Run Execution ===\n')
  
  const reportData = {
    schedule_id: 'schedule_example_001',
    industry: 'Technology & Software',
    sub_niche: 'AI-powered CRM software',
    frequency: 'weekly',
    run_at: new Date().toISOString(),
    is_first_run: true,
    final_report: `
      <h1>Market Research Report</h1>
      <h2>Executive Summary</h2>
      <p>This is a comprehensive analysis of the AI-powered CRM software market.</p>
      <h2>Market Overview</h2>
      <p>The market is experiencing rapid growth...</p>
    `
  }
  
  try {
    const result = await submitReportExecution(reportData)
    console.log('✓ Success!')
    console.log('Execution ID:', result.execution_id)
    console.log('Schedule ID:', result.schedule_id)
    console.log('Is First Run:', result.is_first_run)
    console.log('Message:', result.message)
    return result
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
}

/**
 * Example 2: Submit a subsequent run execution
 */
async function example2_SubsequentRun() {
  console.log('\n=== Example 2: Subsequent Run Execution ===\n')
  
  const reportData = {
    schedule_id: 'schedule_example_001',
    industry: 'Technology & Software',
    sub_niche: 'AI-powered CRM software',
    frequency: 'weekly',
    run_at: new Date().toISOString(),
    is_first_run: false,
    final_report: `
      <h1>Weekly Market Update</h1>
      <h2>Recent Developments</h2>
      <p>Several new players have entered the market this week...</p>
      <h2>Trend Analysis</h2>
      <p>The shift towards AI integration continues to accelerate...</p>
    `
  }
  
  try {
    const result = await submitReportExecution(reportData)
    console.log('✓ Success!')
    console.log('Execution ID:', result.execution_id)
    console.log('Message:', result.message)
    return result
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
}

/**
 * Example 3: Retrieve all executions for a schedule
 */
async function example3_GetExecutions() {
  console.log('\n=== Example 3: Get All Executions ===\n')
  
  const scheduleId = 'schedule_example_001'
  
  try {
    const result = await getScheduleExecutions(scheduleId)
    console.log('✓ Success!')
    console.log('Schedule ID:', result.schedule_id)
    console.log('Total Executions:', result.total_executions)
    console.log('\nExecutions:')
    
    result.executions.forEach((execution, index) => {
      console.log(`\n  ${index + 1}. Execution ID: ${execution.execution_id}`)
      console.log(`     Run At: ${execution.run_at}`)
      console.log(`     Is First Run: ${execution.is_first_run}`)
      console.log(`     Status: ${execution.status}`)
    })
    
    return result
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
}

/**
 * Example 4: Handle validation errors
 */
async function example4_ValidationError() {
  console.log('\n=== Example 4: Handling Validation Errors ===\n')
  
  // Intentionally invalid data (missing required fields)
  const invalidData = {
    schedule_id: 'schedule_example_001'
    // Missing: industry, sub_niche, frequency, run_at, is_first_run, final_report
  }
  
  try {
    const result = await submitReportExecution(invalidData)
    console.log('Unexpected success:', result)
  } catch (error) {
    console.log('✓ Validation error caught as expected!')
    console.log('Error:', error.message)
  }
}

/**
 * Example 5: Batch processing multiple reports
 */
async function example5_BatchProcessing() {
  console.log('\n=== Example 5: Batch Processing ===\n')
  
  const schedules = [
    {
      schedule_id: 'schedule_tech_001',
      industry: 'Technology',
      sub_niche: 'Cloud Computing'
    },
    {
      schedule_id: 'schedule_health_001',
      industry: 'Healthcare',
      sub_niche: 'Telemedicine'
    },
    {
      schedule_id: 'schedule_finance_001',
      industry: 'Financial Services',
      sub_niche: 'FinTech'
    }
  ]
  
  console.log(`Processing ${schedules.length} reports...`)
  
  const results = await Promise.allSettled(
    schedules.map(schedule => submitReportExecution({
      ...schedule,
      frequency: 'weekly',
      run_at: new Date().toISOString(),
      is_first_run: true,
      final_report: `<h1>Report for ${schedule.sub_niche}</h1>`
    }))
  )
  
  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  
  console.log(`\n✓ Completed: ${successful} successful, ${failed} failed`)
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`  ✓ ${schedules[index].schedule_id}: ${result.value.execution_id}`)
    } else {
      console.log(`  ✗ ${schedules[index].schedule_id}: ${result.reason.message}`)
    }
  })
}

/**
 * Example 6: Get execution statistics
 */
async function example6_GetStatistics() {
  console.log('\n=== Example 6: Execution Statistics ===\n')
  
  const scheduleId = 'schedule_example_001'
  
  try {
    const result = await getScheduleExecutions(scheduleId)
    
    // Calculate statistics
    const stats = {
      total: result.total_executions,
      firstRuns: result.executions.filter(e => e.is_first_run).length,
      successful: result.executions.filter(e => e.status === 'success').length,
      failed: result.executions.filter(e => e.status === 'failed').length
    }
    
    // Get date range
    if (result.executions.length > 0) {
      const dates = result.executions.map(e => new Date(e.run_at))
      stats.earliestRun = new Date(Math.min(...dates)).toISOString()
      stats.latestRun = new Date(Math.max(...dates)).toISOString()
    }
    
    console.log('Statistics for', scheduleId)
    console.log('─'.repeat(50))
    console.log('Total Executions:', stats.total)
    console.log('First Runs:', stats.firstRuns)
    console.log('Successful:', stats.successful)
    console.log('Failed:', stats.failed)
    if (stats.earliestRun) {
      console.log('Earliest Run:', stats.earliestRun)
      console.log('Latest Run:', stats.latestRun)
    }
    
    return stats
  } catch (error) {
    console.error('✗ Failed:', error.message)
  }
}

// ============================================
// Run All Examples
// ============================================

async function runAllExamples() {
  console.log('\n' + '='.repeat(60))
  console.log('  API Client Examples - Report Run System')
  console.log('='.repeat(60))
  
  try {
    await example1_FirstRun()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await example2_SubsequentRun()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await example3_GetExecutions()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await example4_ValidationError()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await example5_BatchProcessing()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await example6_GetStatistics()
    
    console.log('\n' + '='.repeat(60))
    console.log('  All examples completed!')
    console.log('='.repeat(60) + '\n')
    
  } catch (error) {
    console.error('\nFatal error:', error)
  }
}

// ============================================
// Execute if run directly
// ============================================

if (typeof require !== 'undefined' && require.main === module) {
  // Node.js environment - check if fetch is available
  if (typeof fetch === 'undefined') {
    console.error('Error: fetch is not available.')
    console.error('Please use Node.js 18+ or install node-fetch:')
    console.error('  npm install node-fetch')
    console.error('  Then add: const fetch = require(\'node-fetch\')')
    process.exit(1)
  }
  
  runAllExamples()
}

// ============================================
// Export for use as module
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    submitReportExecution,
    getScheduleExecutions,
    example1_FirstRun,
    example2_SubsequentRun,
    example3_GetExecutions,
    example4_ValidationError,
    example5_BatchProcessing,
    example6_GetStatistics,
    runAllExamples
  }
}

