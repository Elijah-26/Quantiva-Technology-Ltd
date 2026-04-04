# Quantiva AI - API Design

## Base URL
```
Production: https://api.quantiva.ai/v1
Staging: https://api-staging.quantiva.ai/v1
```

## Authentication

All API requests (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

---

## Authentication Endpoints

### POST /auth/signup
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "status": "pending_verification"
    },
    "message": "Verification email sent"
  }
}
```

### POST /auth/signin
Sign in with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/oauth/google
Sign in with Google OAuth.

**Request:**
```json
{
  "code": "google_auth_code",
  "redirectUri": "https://quantiva.ai/auth/callback"
}
```

### POST /auth/magic-link
Request magic link authentication.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "expiresIn": 3600
  }
}
```

---

## User Endpoints

### GET /users/me
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe",
      "avatarUrl": "https://..."
    },
    "businessProfile": {
      "companyName": "Acme Inc",
      "industry": { ... },
      "jurisdiction": { ... }
    },
    "subscription": {
      "plan": "pro",
      "status": "active",
      "currentPeriodEnd": "2026-04-26T00:00:00Z"
    },
    "onboardingCompleted": true
  }
}
```

### PUT /users/me
Update user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 123 456 7890",
  "jobTitle": "Compliance Manager"
}
```

### PUT /users/me/business-profile
Update business profile.

**Request:**
```json
{
  "companyName": "Acme Inc",
  "companySize": "11-50",
  "industryId": "uuid",
  "subindustryId": "uuid",
  "jurisdictionId": "uuid"
}
```

---

## Onboarding Endpoints

### GET /onboarding/status
Get onboarding completion status.

### POST /onboarding/step/:stepNumber
Submit onboarding step data.

**Step 1 - Profile:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 123 456 7890",
  "jobTitle": "Compliance Manager"
}
```

**Step 2 - Business:**
```json
{
  "companyName": "Acme Inc",
  "companySize": "11-50",
  "businessStage": "growth",
  "employeeCount": 25
}
```

**Step 3 - Industry:**
```json
{
  "industryId": "uuid",
  "subindustryId": "uuid",
  "niche": "Telemedicine",
  "jurisdictionId": "uuid",
  "additionalJurisdictions": ["uuid1", "uuid2"]
}
```

**Step 4 - Preferences:**
```json
{
  "businessGoals": ["compliance", "risk_management"],
  "templatePreferences": ["policies", "procedures"],
  "complianceFocusAreas": ["data_protection", "healthcare"],
  "researchInterest": false
}
```

---

## Document Library Endpoints

### GET /documents
List documents with filtering.

**Query Parameters:**
```
?page=1&limit=20&sort=newest&category=compliance&industry=healthcare&jurisdiction=UK&accessLevel=free&search=privacy+policy
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "slug": "gdpr-privacy-policy-template",
        "title": "GDPR Privacy Policy Template",
        "description": "Comprehensive privacy policy template compliant with GDPR...",
        "shortDescription": "GDPR-compliant privacy policy",
        "documentType": "compliance",
        "accessLevel": "free",
        "industries": [{ "id": "uuid", "name": "Healthcare" }],
        "jurisdictions": [{ "id": "uuid", "code": "UK", "name": "United Kingdom" }],
        "tags": [{ "id": "uuid", "name": "GDPR", "color": "#4F46E5" }],
        "version": 1,
        "viewCount": 1250,
        "downloadCount": 450,
        "publishedAt": "2026-03-01T00:00:00Z",
        "isFavorite": false
      }
    ],
    "filters": {
      "categories": [...],
      "industries": [...],
      "jurisdictions": [...],
      "documentTypes": [...]
    }
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### GET /documents/:id
Get document details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "gdpr-privacy-policy-template",
    "title": "GDPR Privacy Policy Template",
    "description": "...",
    "content": "# Privacy Policy\n\n## 1. Introduction...",
    "documentType": "compliance",
    "category": "data_protection",
    "accessLevel": "free",
    "industries": [...],
    "jurisdictions": [...],
    "tags": [...],
    "version": 1,
    "wordCount": 2500,
    "estimatedReadTime": 12,
    "complexityLevel": "moderate",
    "viewCount": 1250,
    "downloadCount": 450,
    "generationCount": 89,
    "relatedDocuments": [...],
    "canGenerate": true,
    "userQuota": {
      "generationsRemaining": 15,
      "generationsLimit": 20
    }
  }
}
```

### GET /documents/:id/preview
Get document preview (watermarked for free users).

### GET /documents/search
Search documents.

**Query Parameters:**
```
?q=privacy+policy&industry=healthcare&jurisdiction=UK
```

### GET /documents/categories
Get document categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Compliance & Regulatory",
        "slug": "compliance",
        "description": "...",
        "documentCount": 45,
        "subcategories": [...]
      }
    ]
  }
}
```

### GET /documents/trending
Get trending documents.

### GET /documents/recommended
Get personalized document recommendations.

---

## Generation Endpoints

### POST /generate
Generate a customized document.

**Request:**
```json
{
  "templateId": "uuid",
  "parameters": {
    "companyName": "Acme Inc",
    "jurisdiction": "UK",
    "riskLevel": "moderate",
    "tone": "professional",
    "additionalRequirements": "Include section on employee data handling"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "queued",
    "estimatedTime": 30,
    "positionInQueue": 2
  }
}
```

### GET /generate/jobs/:id
Get generation job status.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "progress": 100,
    "outputDocument": {
      "id": "uuid",
      "title": "Acme Inc Privacy Policy",
      "content": "...",
      "wordCount": 2800
    },
    "startedAt": "2026-03-26T10:00:00Z",
    "completedAt": "2026-03-26T10:00:25Z"
  }
}
```

### POST /generate/:id/regenerate
Regenerate a document with modifications.

**Request:**
```json
{
  "modifications": {
    "section": "section_3",
    "instruction": "Make this section more detailed"
  }
}
```

---

## Workspace Endpoints

### GET /workspace/documents
List user's workspace documents.

**Query Parameters:**
```
?folderId=uuid&status=saved&sort=updated&search=privacy
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "title": "Acme Inc Privacy Policy",
        "templateId": "uuid",
        "templateTitle": "GDPR Privacy Policy Template",
        "folderId": "uuid",
        "status": "saved",
        "isFavorite": true,
        "wordCount": 2800,
        "createdAt": "2026-03-26T10:00:00Z",
        "updatedAt": "2026-03-26T10:30:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### POST /workspace/documents
Save a generated document to workspace.

**Request:**
```json
{
  "generatedDocumentId": "uuid",
  "folderId": "uuid",
  "customTitle": "My Custom Title",
  "tags": ["gdpr", "privacy"],
  "notes": "For website launch"
}
```

### GET /workspace/documents/:id
Get workspace document details.

### PUT /workspace/documents/:id
Update workspace document.

**Request:**
```json
{
  "content": "updated content...",
  "customTitle": "New Title",
  "folderId": "uuid"
}
```

### DELETE /workspace/documents/:id
Delete workspace document.

### GET /workspace/folders
List workspace folders.

### POST /workspace/folders
Create a new folder.

**Request:**
```json
{
  "name": "Compliance Documents",
  "parentId": "uuid",
  "color": "#4F46E5",
  "description": "All compliance-related documents"
}
```

### GET /workspace/favorites
List favorite documents.

### GET /workspace/downloads
List download history.

---

## Export Endpoints

### POST /export
Export a document.

**Request:**
```json
{
  "documentId": "uuid",
  "format": "pdf",
  "options": {
    "includeWatermark": false,
    "pageSize": "A4"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.quantiva.ai/exports/uuid.pdf",
    "expiresAt": "2026-03-26T11:00:00Z",
    "fileSize": 125000
  }
}
```

**Supported Formats:**
- `pdf` - PDF document
- `docx` - Microsoft Word
- `txt` - Plain text
- `markdown` - Markdown format

---

## Research Endpoints

### GET /research/templates
List research templates.

### POST /research/generate
Generate a research document.

**Request:**
```json
{
  "templateType": "dissertation",
  "fieldId": "uuid",
  "educationLevel": "phd",
  "topic": "AI in Healthcare Diagnostics",
  "researchType": "mixed",
  "methodology": "case_study",
  "citationStyle": "apa",
  "expectedLength": 50000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "processing",
    "estimatedTime": 60
  }
}
```

### GET /research/my-papers
List user's research papers.

---

## Billing Endpoints

### GET /billing/plans
List available plans.

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "uuid",
        "slug": "pro",
        "name": "Pro",
        "description": "For professionals and small teams",
        "priceMonthly": 19,
        "priceAnnual": 190,
        "currency": "GBP",
        "features": [
          "25 downloads per month",
          "50 AI generations per month",
          "All templates",
          "Email support"
        ],
        "limits": {
          "downloadsPerMonth": 25,
          "aiGenerationsPerMonth": 50
        }
      }
    ]
  }
}
```

### GET /billing/subscription
Get current subscription.

### POST /billing/subscription
Create or update subscription.

**Request:**
```json
{
  "planId": "uuid",
  "billingCycle": "annual",
  "paymentMethodId": "pm_stripe_id"
}
```

### DELETE /billing/subscription
Cancel subscription.

### GET /billing/invoices
List invoices.

### GET /billing/usage
Get usage statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPeriod": {
      "start": "2026-03-01T00:00:00Z",
      "end": "2026-03-31T23:59:59Z"
    },
    "downloads": {
      "used": 12,
      "limit": 25,
      "remaining": 13
    },
    "aiGenerations": {
      "used": 8,
      "limit": 50,
      "remaining": 42
    },
    "history": [
      {
        "date": "2026-03-26",
        "downloads": 2,
        "generations": 1
      }
    ]
  }
}
```

---

## Extension Endpoints

### POST /extension/auth
Authenticate extension session.

**Request:**
```json
{
  "deviceName": "MacBook Pro - Chrome",
  "browser": "Chrome 123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionToken": "ext_session_token",
    "expiresAt": "2026-04-26T00:00:00Z"
  }
}
```

### POST /extension/capture
Submit captured content from extension.

**Request:**
```json
{
  "sourceUrl": "https://ico.org.uk/...",
  "sourceTitle": "New GDPR Guidance",
  "capturedContent": "...",
  "contentType": "regulation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "captureId": "uuid",
    "suggestedDocuments": [
      {
        "id": "uuid",
        "title": "GDPR Compliance Checklist",
        "relevanceScore": 0.95
      }
    ]
  }
}
```

### POST /extension/heartbeat
Extension heartbeat ping.

---

## Admin Endpoints

### GET /admin/users
List all users (admin only).

**Query Parameters:**
```
?page=1&limit=50&status=active&search=john
```

### GET /admin/users/:id
Get user details.

### PUT /admin/users/:id
Update user (suspend, change role, etc.).

### GET /admin/documents
List all documents.

### POST /admin/documents
Create new document.

### PUT /admin/documents/:id
Update document.

### POST /admin/documents/:id/approve
Approve AI-generated document.

### POST /admin/documents/:id/reject
Reject AI-generated document.

### GET /admin/ai-jobs
List AI generation jobs.

### GET /admin/analytics
Get platform analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 15000,
      "activeToday": 850,
      "newThisWeek": 120
    },
    "documents": {
      "total": 2500,
      "generatedThisMonth": 4500
    },
    "revenue": {
      "thisMonth": 25000,
      "growth": 15
    },
    "topIndustries": [...],
    "topDocuments": [...]
  }
}
```

---

## Webhooks

### Document Generation Complete

**Payload:**
```json
{
  "event": "document.generation.completed",
  "data": {
    "jobId": "uuid",
    "userId": "uuid",
    "documentId": "uuid",
    "documentTitle": "Acme Inc Privacy Policy",
    "completedAt": "2026-03-26T10:00:25Z"
  }
}
```

### Subscription Events

- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `subscription.payment_failed`

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Auth | 10 req/min |
| Generate | 5 req/min (Free), 20 req/min (Pro) |
| Search | 30 req/min |
| Other | 60 req/min |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1711459200
```

---

## Pagination

All list endpoints support pagination:

```
?page=1&limit=20
```

Response includes:
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

Cursor-based pagination for real-time data:
```
?cursor=eyJpZCI6InV1aWQifQ&limit=20
```
