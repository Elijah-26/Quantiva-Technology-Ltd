// Error handling utilities for API endpoints

import { NextResponse } from 'next/server'
import { ErrorResponse, ValidationError } from '../types/execution.types'

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  details?: string,
  statusCode: number = 500
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString()
  }
  
  console.error(`[${statusCode}] ${error}${details ? ': ' + details : ''}`)
  
  return NextResponse.json(errorResponse, { status: statusCode })
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  errors: ValidationError[]
): NextResponse<ErrorResponse> {
  const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join('; ')
  
  return createErrorResponse(
    'Validation failed',
    errorMessages,
    400
  )
}

/**
 * Handle unexpected errors and return appropriate response
 */
export function handleUnexpectedError(error: unknown): NextResponse<ErrorResponse> {
  if (error instanceof Error) {
    // Known error with message
    return createErrorResponse(
      'Internal server error',
      error.message,
      500
    )
  }
  
  // Unknown error type
  return createErrorResponse(
    'Internal server error',
    'An unexpected error occurred',
    500
  )
}

/**
 * Log API request for debugging
 */
export function logApiRequest(method: string, path: string, body?: any): void {
  console.log(`
═══════════════════════════════════════════════════
📥 API REQUEST
Method: ${method}
Path: ${path}
Timestamp: ${new Date().toISOString()}
${body ? `Body: ${JSON.stringify(body, null, 2)}` : ''}
═══════════════════════════════════════════════════
  `)
}

/**
 * Log API response for debugging
 */
export function logApiResponse(method: string, path: string, statusCode: number, body?: any): void {
  console.log(`
═══════════════════════════════════════════════════
📤 API RESPONSE
Method: ${method}
Path: ${path}
Status: ${statusCode}
Timestamp: ${new Date().toISOString()}
${body ? `Body: ${JSON.stringify(body, null, 2)}` : ''}
═══════════════════════════════════════════════════
  `)
}

