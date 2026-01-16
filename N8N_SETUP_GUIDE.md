# Market Research Automation - n8n Setup Guide

## Overview

This guide explains how to set up n8n workflows for both **On-Demand Research** and **Recurring Research** in the Market Intelligence Platform.

---

## Architecture Overview

### On-Demand Research Flow
```
User fills form → Submit → n8n Webhook → Process Research → Return Report → Save to App
```

### Recurring Research Flow
```
User creates schedule → Saved to app → n8n checks schedules → Executes research → Emails + Logs report
```

---

## 1. On-Demand Research Workflow (Current - Already Working)

### Workflow Structure
```
1. Webhook Node (Trigger)
   ↓
2. Search/Research Nodes (Your AI processing)
   ↓
3. Format Response Node
   ↓
4. Respond to Webhook Node (Return data to app)
```

### Configuration

#### Webhook Node
- **Webhook URL**: `https://your-n8n.com/webhook/market-research`
- **Method**: POST
- **Authentication**: None (or add if needed)

#### Expected Input (from app)
```json
{
  "marketCategory": "Technology & Software",
  "subNiche": "AI-powered CRM",
  "geography": "North America",
  "email": "user@example.com",
  "researchType": "on-demand",
  "notes": "Focus on SMB market",
  "submittedAt": "2026-01-10T..."
}
```

#### Response Format (to app)
```json
{
  "webReport": "<h2>Market Overview</h2><p>...</p><h2>Key Trends</h2>...",
  "emailReport": "Plain text or HTML for email"
}
```

**OR as an array:**
```json
[{
  "webReport": "<h2>Market Overview</h2>...",
  "emailReport": "Plain text..."
}]
```

---

## 2. Recurring Research Workflow (NEW - Automated)

### Option A: Polling Architecture (Recommended)

#### Workflow Structure
```
1. Schedule Trigger (Daily at midnight: 0 0 * * *)
   ↓
2. HTTP Request → GET localhost:3000/api/schedules/due
   ↓
3. Check if schedules exist
   ↓
4. Split In Batches (Loop through each schedule)
   ↓
5. For each schedule:
   a. Execute Research Nodes
   b. Format Report
   c. Send Email
   d. POST to App API to log report
   ↓
6. Update schedule lastRun timestamp
```

#### Node Configurations

**1. Schedule Trigger Node**
- **Mode**: Custom
- **Cron Expression**: `0 0 * * *` (runs daily at midnight)
- **Alternative**: `0 * * * *` (runs every hour for more frequent checks)

**2. HTTP Request Node - Get Due Schedules**
- **Method**: GET
- **URL**: `http://localhost:3000/api/schedules/due`
- **Response Format**: JSON

**Expected Response:**
```json
{
  "dueSchedules": [
    {
      "id": "schedule_123...",
      "marketCategory": "Technology",
      "subNiche": "AI Tools",
      "geography": "Global",
      "email": "user@example.com",
      "frequency": "weekly",
      "parameters": {...}
    }
  ]
}
```

**3. IF Node - Check if schedules exist**
- **Condition**: `{{ $json.dueSchedules.length > 0 }}`
- **If true**: Continue to Split In Batches
- **If false**: Stop workflow (nothing to do)

**4. Split In Batches Node**
- **Batch Size**: 1
- **Options**: Reset

**5. Execute Research (Your existing nodes)**
- Use: `{{ $json.parameters.marketCategory }}`
- Use: `{{ $json.parameters.subNiche }}`
- etc.

**6. Send Email Node**
- **To**: `{{ $json.email }}`
- **Subject**: `Scheduled Market Research Report: {{ $json.title }}`
- **Body**: Use your formatted emailReport

**7. HTTP Request Node - Log Report to App**
- **Method**: POST
- **URL**: `http://localhost:3000/api/reports/log`
- **Body**:
```json
{
  "scheduleId": "{{ $json.id }}",
  "webReport": "{{ $json.webReport }}",
  "emailReport": "{{ $json.emailReport }}"
}
```

**8. HTTP Request Node - Update Last Run**
- **Method**: POST
- **URL**: `http://localhost:3000/api/schedules/update-last-run`
- **Body**:
```json
{
  "scheduleId": "{{ $json.id }}"
}
```

---

### Option B: Direct Webhook Trigger (When First Schedule is Created)

#### Workflow Structure
```
1. Webhook Node (Triggered when user creates schedule)
   ↓
2. Set Node (Store schedule parameters)
   ↓
3. Wait Node (Wait for frequency duration)
   ↓
4. Loop back to execute research
```

**Issues with this approach:**
- ❌ Cannot handle multiple schedules simultaneously
- ❌ Hard to cancel/pause schedules
- ❌ n8n workflow needs to run continuously
- ❌ Not scalable

**Not recommended for production.**

---

## 3. Required API Endpoints in Your App

### Current Status
✅ **Already exists**: Webhook endpoint for on-demand research

### To Implement (for recurring research)

#### A. `GET /api/schedules/due`
Returns schedules that need to run now.

**Example Response:**
```json
{
  "dueSchedules": [
    {
      "id": "schedule_123",
      "title": "Tech - AI CRM",
      "marketCategory": "Technology",
      "subNiche": "AI CRM",
      "geography": "USA",
      "email": "user@example.com",
      "frequency": "weekly",
      "lastRun": "2026-01-03T00:00:00Z",
      "nextRun": "2026-01-10T00:00:00Z",
      "parameters": {
        "marketCategory": "Technology",
        "subNiche": "AI CRM",
        "geography": "USA",
        "email": "user@example.com",
        "notes": ""
      }
    }
  ]
}
```

#### B. `POST /api/reports/log`
Logs a completed scheduled report.

**Request Body:**
```json
{
  "scheduleId": "schedule_123",
  "webReport": "<h2>Report HTML...</h2>",
  "emailReport": "Plain text version..."
}
```

#### C. `POST /api/schedules/update-last-run`
Updates the schedule's last run timestamp.

**Request Body:**
```json
{
  "scheduleId": "schedule_123"
}
```

---

## 4. Cancelling Recurring Reports

### From the App UI
User can:
1. **Pause Schedule**: Set `active: false` in the Schedules page
2. **Delete Schedule**: Remove from localStorage
3. **Resume Schedule**: Set `active: true` again

### How n8n Handles It
- When n8n calls `/api/schedules/due`, the API only returns **active** schedules
- If a schedule is paused, it won't be returned
- If a schedule is deleted, it won't exist in the response
- **No manual intervention in n8n needed**

---

## 5. Implementation Steps

### Phase 1: Keep Current Setup Working ✅
- On-demand research works as-is
- No changes needed to existing n8n workflow

### Phase 2: Add Recurring Support (To Do)

**In App:**
1. ✅ Create `lib/schedules.ts` - Schedule management utilities
2. ✅ Update form to separate on-demand vs recurring
3. ✅ Create `/dashboard/schedules` page to manage schedules
4. ⏳ Implement API endpoints:
   - `/api/schedules/due`
   - `/api/reports/log`
   - `/api/schedules/update-last-run`

**In n8n:**
1. Create new workflow: "Recurring Research Scheduler"
2. Add Schedule Trigger (daily at midnight)
3. Add HTTP Request to get due schedules
4. Add Split In Batches to process each
5. Copy your existing research nodes
6. Add email sending
7. Add report logging back to app
8. Test with a daily schedule

---

## 6. Testing Plan

### Test On-Demand (Already Working)
1. Fill form with "On-Demand Research"
2. Submit
3. Verify webhook receives data
4. Verify report appears in Reports section

### Test Recurring
1. Fill form with "Recurring Research" → Frequency: Daily
2. Submit
3. Verify schedule appears in Schedules section
4. Verify schedule is marked "Active"
5. Manually trigger n8n workflow (or wait for scheduled time)
6. Verify n8n fetches the schedule
7. Verify email is sent
8. Verify report is logged to app
9. Verify schedule's "Last Run" is updated

---

## 7. Production Considerations

### Current Setup (Client-Side Schedules)
- ✅ **Pro**: Simple, no database needed
- ❌ **Con**: Schedules stored in browser localStorage
- ❌ **Con**: Can't access schedules from server API
- ❌ **Con**: User must keep browser tab open (not really, but data is local)

### Recommended: Move to Server-Side Storage
For production, migrate schedules to:
- **Supabase** (free tier, PostgreSQL)
- **MongoDB Atlas** (free tier)
- **Vercel Postgres** (if using Vercel)
- **Any database you prefer**

Then:
- API endpoints can truly fetch schedules
- Multiple users can have schedules
- Schedules persist across devices
- n8n can reliably access them

---

## 8. Summary

### Current State
✅ **On-Demand Research**: Fully working
- Form → Webhook → n8n → Return data → Save report
- User sees report immediately

✅ **Recurring Research**: UI ready
- Form → Save schedule locally
- Schedules page to manage them
- Dashboard shows active schedule count

⏳ **Recurring Research**: Backend needed
- Need API endpoints for n8n to call
- Need server-side schedule storage (or accept limitations)
- Need n8n workflow to check and execute

### Next Steps
1. Decide: Client-side schedules (quick) or server-side (production-ready)?
2. Implement the 3 API endpoints
3. Create n8n "Recurring Research" workflow
4. Test end-to-end

---

## Questions?

**Q: Can I use Schedule Trigger with multiple frequencies?**
A: Yes, but one workflow handles ALL schedules. The app logic determines which are "due" based on their individual frequencies.

**Q: How do I cancel a schedule?**
A: Just pause or delete it in the app UI. n8n will stop processing it automatically.

**Q: Do I need separate n8n workflows for daily/weekly/monthly?**
A: No! One workflow handles all frequencies. The app's `/api/schedules/due` endpoint filters which schedules should run.

**Q: What if n8n is down when a schedule is due?**
A: The schedule will run on the next n8n check. You can add logic to prevent "stale" schedules from running (e.g., only if due within last 24 hours).

---

## Support

For implementation help:
1. Test on-demand research first (should already work)
2. Create one test recurring schedule
3. Check browser console and Network tab
4. Verify schedule appears in Schedules page
5. Then move to n8n implementation

Good luck! 🚀

