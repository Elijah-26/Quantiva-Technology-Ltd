# Backend API Documentation

## Overview

This backend API is designed for a scheduled reporting system that receives execution data from n8n for recurring jobs. Each job is uniquely identified by a `schedule_id`.

## Architecture

The system follows a clean architecture pattern with clear separation of concerns:

```
├── app/api/                          # API Route Handlers (Next.js App Router)
│   ├── report-run/
│   │   └── route.ts                  # POST endpoint for receiving execution data
│   └── reports/
│       └── [schedule_id]/
│           └── route.ts              # GET endpoint for retrieving reports
├── lib/
│   ├── types/
│   │   └── execution.types.ts        # TypeScript interfaces and types
│   ├── validation/
│   │   └── report-run.validation.ts  # Request validation logic
│   ├── data-access/
│   │   └── execution-logs.dao.ts     # Data Access Object for file storage
│   ├── services/
│   │   └── report-run.service.ts     # Business logic layer
│   └── utils/
│       └── error-handler.ts          # Error handling utilities
└── data/                             # Server-side storage (created at runtime)
    ├── executions/                   # Execution logs (one file per schedule)
    └── schedules/                    # Schedule metadata
```

## API Endpoints

### 1. POST /api/report-run

Receives execution data from n8n for recurring jobs.

#### Request

**Method:** `POST`  
**Content-Type:** `application/json`

**Body:**
```json
{
  "schedule_id": "string",
  "industry": "string",
  "sub_niche": "string",
  "frequency": "daily|weekly|biweekly|monthly",
  "run_at": "2026-01-15T10:30:00Z",
  "is_first_run": true,
  "final_report": "string (HTML or text content)"
}
```

**Field Descriptions:**
- `schedule_id` *(required)*: Unique identifier for the schedule (generated upstream, e.g., by n8n)
- `industry` *(required)*: Industry or market category
- `sub_niche` *(required)*: Specific sub-niche or focus area
- `frequency` *(required)*: How often the report runs (daily, weekly, biweekly, monthly)
- `run_at` *(required)*: ISO 8601 timestamp indicating when the execution occurred
- `is_first_run` *(required)*: Boolean flag indicating if this is the first execution
- `final_report` *(required)*: The generated report content

#### Response

**Success (200):**
```json
{
  "success": true,
  "execution_id": "exec_1705318200000_abc123def",
  "schedule_id": "schedule_xyz789",
  "is_first_run": true,
  "message": "First execution logged successfully. Schedule initialized.",
  "timestamp": "2026-01-15T10:30:05Z"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": "schedule_id: schedule_id is required; frequency: frequency must be one of: daily, weekly, biweekly, monthly",
  "timestamp": "2026-01-15T10:30:05Z"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Failed to save execution log: Permission denied",
  "timestamp": "2026-01-15T10:30:05Z"
}
```

#### Behavior

**When `is_first_run === true`:**
1. Creates a storage directory for the schedule
2. Initializes schedule metadata with `initialized: true`
3. Creates empty execution log file
4. Logs the execution with `is_first_run` flag
5. Returns response indicating successful initialization

**For subsequent runs:**
1. Validates that the schedule exists
2. Logs the execution
3. Updates schedule metadata (total executions, last execution time)
4. Returns success response

#### Example: cURL

```bash
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "schedule_abc123",
    "industry": "Technology & Software",
    "sub_niche": "AI-powered CRM software",
    "frequency": "weekly",
    "run_at": "2026-01-15T10:30:00Z",
    "is_first_run": true,
    "final_report": "<h1>Market Report</h1><p>Analysis content...</p>"
  }'
```

#### Example: JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/api/report-run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    schedule_id: 'schedule_abc123',
    industry: 'Technology & Software',
    sub_niche: 'AI-powered CRM software',
    frequency: 'weekly',
    run_at: new Date().toISOString(),
    is_first_run: true,
    final_report: '<h1>Market Report</h1><p>Analysis content...</p>'
  })
})

const result = await response.json()
console.log(result)
```

#### Example: n8n Workflow

In your n8n workflow, use the **HTTP Request** node with:

**Configuration:**
- Method: POST
- URL: `http://your-domain.com/api/report-run`
- Authentication: None (or configure as needed)
- Body Content Type: JSON

**Body:**
```json
{
  "schedule_id": "{{ $json.schedule_id }}",
  "industry": "{{ $json.industry }}",
  "sub_niche": "{{ $json.sub_niche }}",
  "frequency": "{{ $json.frequency }}",
  "run_at": "{{ $now.toISO() }}",
  "is_first_run": {{ $json.is_first_run }},
  "final_report": "{{ $json.report_content }}"
}
```

---

### 2. GET /api/reports/:schedule_id

Retrieves all execution logs for a specific schedule.

#### Request

**Method:** `GET`  
**Path Parameter:** `schedule_id` - The unique identifier of the schedule

#### Response

**Success (200):**
```json
{
  "success": true,
  "schedule_id": "schedule_abc123",
  "total_executions": 5,
  "executions": [
    {
      "execution_id": "exec_1705318200000_abc123def",
      "schedule_id": "schedule_abc123",
      "industry": "Technology & Software",
      "sub_niche": "AI-powered CRM software",
      "frequency": "weekly",
      "run_at": "2026-01-15T10:30:00Z",
      "is_first_run": false,
      "final_report": "<h1>Market Report</h1><p>Analysis content...</p>",
      "created_at": "2026-01-15T10:30:05Z",
      "status": "success"
    },
    {
      "execution_id": "exec_1704713400000_def456ghi",
      "schedule_id": "schedule_abc123",
      "industry": "Technology & Software",
      "sub_niche": "AI-powered CRM software",
      "frequency": "weekly",
      "run_at": "2026-01-08T10:30:00Z",
      "is_first_run": true,
      "final_report": "<h1>Market Report</h1><p>Initial analysis...</p>",
      "created_at": "2026-01-08T10:30:03Z",
      "status": "success"
    }
  ]
}
```

**Note:** Executions are sorted by `run_at` timestamp, with the most recent first.

**No Executions Found (200):**
```json
{
  "success": true,
  "schedule_id": "schedule_xyz999",
  "total_executions": 0,
  "executions": []
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Invalid schedule_id",
  "details": "schedule_id parameter is required and cannot be empty",
  "timestamp": "2026-01-15T10:30:05Z"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Failed to read execution logs: File read error",
  "timestamp": "2026-01-15T10:30:05Z"
}
```

#### Example: cURL

```bash
curl -X GET http://localhost:3000/api/reports/schedule_abc123
```

#### Example: JavaScript/Fetch

```javascript
const scheduleId = 'schedule_abc123'
const response = await fetch(`http://localhost:3000/api/reports/${scheduleId}`)
const result = await response.json()

console.log(`Total executions: ${result.total_executions}`)
result.executions.forEach(execution => {
  console.log(`- ${execution.execution_id} at ${execution.run_at}`)
})
```

#### Example: n8n Workflow

In your n8n workflow, use the **HTTP Request** node with:

**Configuration:**
- Method: GET
- URL: `http://your-domain.com/api/reports/{{ $json.schedule_id }}`
- Authentication: None (or configure as needed)

---

## Data Storage

The system uses file-based storage for simplicity and portability:

### Storage Structure

```
data/
├── executions/
│   ├── schedule_abc123.json      # All executions for schedule_abc123
│   ├── schedule_xyz789.json      # All executions for schedule_xyz789
│   └── ...
└── schedules/
    ├── schedule_abc123.json      # Metadata for schedule_abc123
    ├── schedule_xyz789.json      # Metadata for schedule_xyz789
    └── ...
```

### Execution Log Format

Each schedule has a JSON file containing an array of execution logs:

```json
[
  {
    "execution_id": "exec_1705318200000_abc123def",
    "schedule_id": "schedule_abc123",
    "industry": "Technology & Software",
    "sub_niche": "AI-powered CRM software",
    "frequency": "weekly",
    "run_at": "2026-01-15T10:30:00Z",
    "is_first_run": false,
    "final_report": "...",
    "created_at": "2026-01-15T10:30:05Z",
    "status": "success"
  }
]
```

### Schedule Metadata Format

Each schedule has a metadata file:

```json
{
  "schedule_id": "schedule_abc123",
  "initialized": true,
  "first_run_at": "2026-01-08T10:30:00Z",
  "total_executions": 5,
  "last_execution_at": "2026-01-15T10:30:00Z",
  "created_at": "2026-01-08T10:30:00Z",
  "updated_at": "2026-01-15T10:30:05Z"
}
```

### Migration to Database

For production environments with high volume, consider migrating to a database:

**Recommended Options:**
- **PostgreSQL** - Best for structured data with complex queries
- **MongoDB** - Good for document-based storage
- **Supabase** - PostgreSQL with built-in APIs
- **PlanetScale** - Serverless MySQL

The data access layer (`execution-logs.dao.ts`) is designed to be easily replaced with database implementations.

---

## Error Handling

The API follows a consistent error handling pattern:

### Error Response Structure

All errors return this format:
```json
{
  "success": false,
  "error": "Error category",
  "details": "Specific error message",
  "timestamp": "ISO 8601 timestamp"
}
```

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid request body or parameters |
| 405 | Method Not Allowed | Wrong HTTP method used |
| 500 | Internal Server Error | Server-side error (storage, processing, etc.) |

### Common Validation Errors

| Field | Error |
|-------|-------|
| `schedule_id` | Required, must be non-empty string |
| `industry` | Required, must be non-empty string |
| `sub_niche` | Required, must be non-empty string |
| `frequency` | Required, must be one of: daily, weekly, biweekly, monthly |
| `run_at` | Required, must be valid ISO 8601 timestamp |
| `is_first_run` | Required, must be boolean |
| `final_report` | Required, must be non-empty string |

---

## Logging

The API includes comprehensive logging for debugging and monitoring:

### Request Logging

Every request is logged with:
- HTTP method
- Path
- Request body (for POST)
- Timestamp

Example:
```
═══════════════════════════════════════════════════
📥 API REQUEST
Method: POST
Path: /api/report-run
Timestamp: 2026-01-15T10:30:00Z
Body: {
  "schedule_id": "schedule_abc123",
  ...
}
═══════════════════════════════════════════════════
```

### Response Logging

Every response is logged with:
- HTTP method
- Path
- Status code
- Response body
- Timestamp

Example:
```
═══════════════════════════════════════════════════
📤 API RESPONSE
Method: POST
Path: /api/report-run
Status: 200
Timestamp: 2026-01-15T10:30:05Z
Body: {
  "success": true,
  "execution_id": "exec_1705318200000_abc123def",
  ...
}
═══════════════════════════════════════════════════
```

### Operation Logging

Key operations are logged:
- `✓ Initialized schedule: schedule_abc123`
- `✓ Saved execution log: exec_123 for schedule: schedule_abc123`
- `✓ Updated metadata for schedule: schedule_abc123`
- `✓ Retrieved 5 execution(s) for schedule: schedule_abc123`

---

## Testing

### Testing with cURL

**Test POST endpoint:**
```bash
# First run
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test_schedule_001",
    "industry": "Healthcare",
    "sub_niche": "Telemedicine platforms",
    "frequency": "weekly",
    "run_at": "2026-01-15T10:30:00Z",
    "is_first_run": true,
    "final_report": "<h1>Healthcare Market Report</h1>"
  }'

# Subsequent run
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test_schedule_001",
    "industry": "Healthcare",
    "sub_niche": "Telemedicine platforms",
    "frequency": "weekly",
    "run_at": "2026-01-22T10:30:00Z",
    "is_first_run": false,
    "final_report": "<h1>Updated Healthcare Report</h1>"
  }'

# Get all reports
curl -X GET http://localhost:3000/api/reports/test_schedule_001
```

### Testing with Postman

**Collection Setup:**
1. Create a new collection "Report API"
2. Add requests:
   - POST Report Run (First)
   - POST Report Run (Subsequent)
   - GET Reports by Schedule

**Environment Variables:**
- `base_url`: `http://localhost:3000`
- `schedule_id`: `test_schedule_001`

### Testing Error Cases

```bash
# Missing required field
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test_001"
  }'

# Invalid frequency
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test_001",
    "industry": "Tech",
    "sub_niche": "AI",
    "frequency": "hourly",
    "run_at": "2026-01-15T10:30:00Z",
    "is_first_run": true,
    "final_report": "Report"
  }'

# Invalid JSON
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d 'not valid json'
```

---

## Security Considerations

### Current Implementation

The current implementation is designed for internal use with n8n and does not include authentication. For production use, consider adding:

1. **API Key Authentication**
   - Add API key validation to endpoints
   - Store keys securely in environment variables

2. **Rate Limiting**
   - Implement rate limiting per schedule_id
   - Prevent abuse and DoS attacks

3. **Input Sanitization**
   - Sanitize HTML in `final_report` field
   - Prevent XSS attacks if reports are displayed

4. **CORS Configuration**
   - Currently allows all origins (`*`)
   - Restrict to specific domains in production

5. **HTTPS**
   - Always use HTTPS in production
   - Encrypt data in transit

### Example: Adding API Key Authentication

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const validKey = process.env.API_KEY
  
  if (!apiKey || apiKey !== validKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}
```

---

## Deployment

### Environment Variables

No environment variables are currently required. For enhanced security, you may want to add:

```env
# Optional: API authentication
API_KEY=your-secret-api-key

# Optional: Storage path override
DATA_STORAGE_PATH=/path/to/data

# Optional: CORS configuration
ALLOWED_ORIGINS=https://your-n8n-instance.com
```

### Next.js Deployment

The API is compatible with all Next.js deployment platforms:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Self-hosted** (Node.js server)

**Note:** File-based storage requires a persistent file system. For serverless platforms like Vercel, consider using:
- Vercel Postgres
- Supabase
- MongoDB Atlas
- Any other database service

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Support

For questions or issues:
1. Check this documentation
2. Review the inline code comments
3. Check the console logs for detailed error messages
4. Verify your request payload matches the expected format

---

## Changelog

### Version 1.0.0 (2026-01-15)
- Initial release
- POST /api/report-run endpoint
- GET /api/reports/:schedule_id endpoint
- File-based storage implementation
- Comprehensive validation and error handling
- Production-grade logging

