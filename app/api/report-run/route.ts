// POST /api/report-run - Endpoint to receive execution data from n8n

import { NextRequest, NextResponse } from 'next/server'
import { ReportRunRequest, ReportRunResponse } from '@/lib/types/execution.types'
import { validateReportRunRequest } from '@/lib/validation/report-run.validation'
import { processReportRun } from '@/lib/services/report-run.service'
import {
  createValidationErrorResponse,
  createErrorResponse,
  handleUnexpectedError,
  logApiRequest,
  logApiResponse
} from '@/lib/utils/error-handler'

/**
 * POST /api/report-run
 * 
 * Accepts execution data from n8n for recurring jobs
 * 
 * Request body:
 * {
 *   "schedule_id": "string",
 *   "industry": "string",
 *   "sub_niche": "string",
 *   "frequency": "string",
 *   "run_at": "ISO timestamp string",
 *   "is_first_run": boolean,
 *   "final_report": "string"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "execution_id": "string",
 *   "schedule_id": "string",
 *   "is_first_run": boolean,
 *   "message": "string",
 *   "timestamp": "ISO timestamp"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      logApiRequest('POST', '/api/report-run', 'Invalid JSON')
      return createErrorResponse(
        'Invalid request body',
        'Request body must be valid JSON',
        400
      )
    }
    
    // Log incoming request
    logApiRequest('POST', '/api/report-run', body)
    
    // Validate request payload
    const validationErrors = validateReportRunRequest(body)
    if (validationErrors.length > 0) {
      const response = createValidationErrorResponse(validationErrors)
      logApiResponse('POST', '/api/report-run', 400, await response.json())
      return response
    }
    
    // Type assertion after validation
    const validatedRequest = body as ReportRunRequest
    
    // Process the report run
    const result: ReportRunResponse = await processReportRun(validatedRequest)
    
    // Log response
    logApiResponse('POST', '/api/report-run', 200, result)
    
    // Return success response
    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    // Handle unexpected errors
    const errorResponse = handleUnexpectedError(error)
    logApiResponse('POST', '/api/report-run', 500, await errorResponse.json())
    return errorResponse
  }
}

/**
 * GET /api/report-run - Not allowed
 * Only POST method is supported
 */
export async function GET() {
  return createErrorResponse(
    'Method not allowed',
    'Only POST requests are allowed on this endpoint',
    405
  )
}

/**
 * OPTIONS /api/report-run - CORS preflight support
 */
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

