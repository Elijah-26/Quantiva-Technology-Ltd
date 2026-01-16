# Backend API for Scheduled Reporting System

A production-ready backend API built with Next.js App Router for receiving and storing execution data from n8n automated workflows.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# The API will be available at http://localhost:3000
```

### Test the API

```bash
# Send a test execution
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "test_001",
    "industry": "Technology",
    "sub_niche": "AI Software",
    "frequency": "weekly",
    "run_at": "2026-01-15T10:30:00Z",
    "is_first_run": true,
    "final_report": "<h1>Test Report</h1>"
  }'

# Retrieve executions
curl http://localhost:3000/api/reports/test_001
```

## 📚 Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🏗️ Architecture

### Clean Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                     API Routes Layer                     │
│  (Express endpoints, request/response handling)          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Validation Layer                       │
│         (Request validation, data sanitization)          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│            (Business logic, orchestration)               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Access Layer (DAO)                  │
│         (File storage, CRUD operations)                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Storage Layer                         │
│           (JSON files in data/ directory)                │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
.
├── app/
│   └── api/
│       ├── report-run/
│       │   └── route.ts              # POST endpoint
│       └── reports/
│           └── [schedule_id]/
│               └── route.ts          # GET endpoint
├── lib/
│   ├── types/
│   │   └── execution.types.ts        # TypeScript types
│   ├── validation/
│   │   └── report-run.validation.ts  # Input validation
│   ├── data-access/
│   │   └── execution-logs.dao.ts     # Data access layer
│   ├── services/
│   │   └── report-run.service.ts     # Business logic
│   └── utils/
│       └── error-handler.ts          # Error handling
├── data/                             # Created at runtime
│   ├── executions/                   # Execution logs
│   └── schedules/                    # Schedule metadata
├── API_DOCUMENTATION.md              # Full API docs
└── BACKEND_API_README.md            # This file
```

## 🔌 API Endpoints

### POST /api/report-run
Receive execution data from n8n

**Request:**
```json
{
  "schedule_id": "string",
  "industry": "string",
  "sub_niche": "string",
  "frequency": "daily|weekly|biweekly|monthly",
  "run_at": "ISO timestamp",
  "is_first_run": boolean,
  "final_report": "string"
}
```

**Response:**
```json
{
  "success": true,
  "execution_id": "exec_...",
  "schedule_id": "...",
  "is_first_run": true,
  "message": "...",
  "timestamp": "..."
}
```

### GET /api/reports/:schedule_id
Retrieve all executions for a schedule

**Response:**
```json
{
  "success": true,
  "schedule_id": "...",
  "total_executions": 5,
  "executions": [...]
}
```

## ✨ Features

### ✅ Functional Requirements
- ✓ Strict payload validation
- ✓ First run detection and initialization
- ✓ Automatic storage creation per schedule
- ✓ Execution logging with timestamps
- ✓ Sortable execution history
- ✓ Multiple schedules support
- ✓ Multiple executions per schedule

### 🏆 Production-Grade Features
- ✓ Clean architecture with separation of concerns
- ✓ TypeScript for type safety
- ✓ Comprehensive error handling
- ✓ Detailed logging for debugging
- ✓ Input validation with helpful error messages
- ✓ CORS support for cross-origin requests
- ✓ RESTful API design
- ✓ Scalable file-based storage
- ✓ Zero external dependencies for storage

## 🔒 Security

Current implementation is designed for internal use. For production:

### Recommended Enhancements
1. **API Key Authentication** - Add authentication middleware
2. **Rate Limiting** - Prevent abuse
3. **Input Sanitization** - Sanitize HTML content
4. **CORS Restrictions** - Limit to specific origins
5. **HTTPS Only** - Enforce secure connections

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md#security-considerations) for implementation examples.

## 📊 Data Storage

### File-Based Storage
- **Location:** `data/` directory (auto-created)
- **Format:** JSON files
- **Structure:**
  - `data/executions/` - One file per schedule containing all executions
  - `data/schedules/` - Metadata for each schedule

### Migration to Database
For high-volume production use, easily migrate to:
- PostgreSQL
- MongoDB
- Supabase
- PlanetScale

The DAO layer is designed for easy swapping of storage backends.

## 🧪 Testing

### Manual Testing

```bash
# First execution
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "schedule_001",
    "industry": "Healthcare",
    "sub_niche": "Telemedicine",
    "frequency": "weekly",
    "run_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "is_first_run": true,
    "final_report": "<h1>Report Content</h1>"
  }'

# Subsequent execution
curl -X POST http://localhost:3000/api/report-run \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": "schedule_001",
    "industry": "Healthcare",
    "sub_niche": "Telemedicine",
    "frequency": "weekly",
    "run_at": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "is_first_run": false,
    "final_report": "<h1>Updated Report</h1>"
  }'

# Retrieve all executions
curl http://localhost:3000/api/reports/schedule_001 | jq
```

### Expected Behavior

1. **First Run:**
   - Creates `data/schedules/schedule_001.json`
   - Creates `data/executions/schedule_001.json`
   - Marks schedule as initialized
   - Returns `is_first_run: true` in response

2. **Subsequent Runs:**
   - Appends to existing execution log
   - Updates schedule metadata
   - Returns `is_first_run: false` in response

3. **GET Request:**
   - Returns all executions sorted by `run_at` (newest first)
   - Includes total execution count
   - Returns empty array if no executions exist

## 📝 Logging

### Request/Response Logging
All API calls are logged with:
- Timestamps
- Request body
- Response status
- Response body

### Operation Logging
Key operations log status:
```
✓ Initialized schedule: schedule_001
✓ Saved execution log: exec_123
✓ Updated metadata for schedule: schedule_001
```

Check console output during development.

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Note:** Vercel's serverless functions don't have persistent file storage. For Vercel, migrate to a database.

### Docker
```bash
# Build
docker build -t report-api .

# Run
docker run -p 3000:3000 -v $(pwd)/data:/app/data report-api
```

### Traditional Hosting
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env.local`:
```env
# API Configuration
NODE_ENV=production

# Optional: Custom data directory
DATA_STORAGE_PATH=/path/to/data

# Optional: API security
API_KEY=your-secret-key

# Optional: CORS
ALLOWED_ORIGINS=https://your-n8n-instance.com
```

## 📖 Integration with n8n

### HTTP Request Node Configuration

1. **Method:** POST
2. **URL:** `https://your-domain.com/api/report-run`
3. **Body Content Type:** JSON
4. **Body:**
```json
{
  "schedule_id": "{{ $('previous_node').item.json.schedule_id }}",
  "industry": "{{ $('form').item.json.industry }}",
  "sub_niche": "{{ $('form').item.json.sub_niche }}",
  "frequency": "{{ $('form').item.json.frequency }}",
  "run_at": "{{ $now.toISO() }}",
  "is_first_run": {{ $('trigger').item.json.is_first_run }},
  "final_report": "{{ $('report_generator').item.json.content }}"
}
```

### Workflow Pattern

```
Trigger → Generate Report → HTTP Request (POST /api/report-run) → Email Notification
```

## 🐛 Troubleshooting

### Issue: "Failed to save execution log"
**Cause:** Permission issues with `data/` directory  
**Solution:** Ensure write permissions: `chmod -R 755 data/`

### Issue: Validation errors
**Cause:** Invalid request payload  
**Solution:** Check the error details in response and verify all required fields

### Issue: 405 Method Not Allowed
**Cause:** Wrong HTTP method used  
**Solution:** Use POST for /api/report-run, GET for /api/reports/:schedule_id

### Issue: Empty executions array
**Cause:** No executions have been logged yet  
**Solution:** This is expected for new schedules. Send a POST request first.

## 🤝 Contributing

Contributions welcome! Please:
1. Follow the existing code structure
2. Add TypeScript types for all new code
3. Update documentation for API changes
4. Test thoroughly before submitting

## 📄 License

[Your License Here]

## 📞 Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For questions or issues:
1. Check the logs for detailed error messages
2. Verify request format matches documentation
3. Test with cURL examples provided

---

**Built with ❤️ using Next.js App Router**

