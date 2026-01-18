# 📊 On-Demand Reports - Visual Flow Diagram

## 🔴 BEFORE (BROKEN)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SUBMITS FORM                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEND TO N8N WEBHOOK                         │
│              POST to n8n workflow URL                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              N8N PROCESSES & RETURNS REPORT                  │
│        { webReport: "<h2>...</h2>", emailReport: "..." }     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ❌ SAVE TO LOCALSTORAGE ❌                      │
│          localStorage.setItem('reports', ...)                │
│              (TEMPORARY, BROWSER ONLY)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              NAVIGATE TO REPORTS PAGE                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           ❌ FETCH FROM SUPABASE DATABASE ❌                 │
│              GET /api/reports (from Supabase)                │
│                   MISMATCH!                                  │
│     localStorage has data, Supabase is empty                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  ❌ NO REPORTS FOUND ❌                      │
│              Empty state displayed                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ AFTER (FIXED)

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SUBMITS FORM                         │
│   Market Category, Sub-niche, Geography, Email, Notes       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEND TO N8N WEBHOOK                         │
│              POST to n8n workflow URL                        │
│    { marketCategory, subNiche, geography, email, ... }       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              N8N PROCESSES & RETURNS REPORT                  │
│        { webReport: "<h2>...</h2>", emailReport: "..." }     │
│              Status: 200 OK                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            ✅ SAVE TO SUPABASE DATABASE ✅                   │
│          POST /api/reports/on-demand                         │
│    {                                                         │
│      industry: "Technology & Software",                      │
│      sub_niche: "AI CRM",                                    │
│      geography: "North America",                             │
│      email: "user@example.com",                              │
│      final_report: "<h2>...</h2>",                           │
│      email_report: "...",                                    │
│      notes: "..."                                            │
│    }                                                         │
│              (PERMANENT, SERVER-SIDE)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ✅ REPORT SAVED SUCCESSFULLY ✅                 │
│        Returns: execution_id = "ondemand_123_abc"            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│        NAVIGATE TO REPORT DETAIL PAGE                        │
│      router.push(`/dashboard/reports/${execution_id}`)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            ✅ REPORT DISPLAYS IMMEDIATELY ✅                 │
│   GET /api/reports/ondemand_123_abc (from Supabase)         │
│   - Full report HTML rendered                                │
│   - Email badge shown                                        │
│   - Geography displayed                                      │
│   - Download PDF button                                      │
│   - Share button (NEW!)                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              USER NAVIGATES TO REPORTS MENU                  │
│              /dashboard/reports                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         ✅ REPORT APPEARS IN LIST ✅                         │
│   GET /api/reports (from Supabase)                           │
│   - Shows in reports table                                   │
│   - Email, geography, date visible                           │
│   - "On-demand" badge shown                                  │
│   - Can view, share, download, delete                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Comparison

### BEFORE (localStorage)

```
Browser Memory (Temporary)
└── localStorage
    └── 'market_research_reports'
        └── [report1, report2, ...] ❌ LOST ON CLEAR

Database (Permanent)
└── Supabase
    └── reports table
        └── (empty) ❌ NOTHING SAVED
```

**Problem:** Reports page fetches from Supabase, but reports are in localStorage!

---

### AFTER (Supabase)

```
Browser Memory (Temporary)
└── (nothing stored) ✅

Database (Permanent)
└── Supabase ✅
    └── reports table
        ├── ondemand_1234_abc
        ├── ondemand_5678_def
        └── schedule_9012_ghi
```

**Solution:** Everything saved to Supabase, everything fetched from Supabase!

---

## 🎯 API Endpoints Flow

### On-Demand Report Submission

```
Client                          n8n                      Backend API                Supabase
  |                              |                           |                          |
  |-- POST (form data) --------->|                           |                          |
  |                              |                           |                          |
  |                              |-- AI Processing --------->|                          |
  |                              |                           |                          |
  |<-- { webReport, emailReport }|                           |                          |
  |                              |                           |                          |
  |-- POST /api/reports/on-demand ----------------------->   |                          |
  |    { industry, sub_niche,    |                           |                          |
  |      email, geography,       |                           |                          |
  |      final_report, ... }     |                           |                          |
  |                              |                           |-- INSERT INTO reports -->|
  |                              |                           |                          |
  |<-- { success, execution_id } ---------------------------|<-- Success --------------|
  |                              |                           |                          |
  |-- GET /api/reports/{id} ----------------------------->   |                          |
  |                              |                           |-- SELECT FROM reports -->|
  |<-- { report: {...} } -----------------------------------<-- Report data ----------|
  |                              |                           |                          |
```

### Reports List View

```
Client                                                    Backend API                Supabase
  |                                                           |                          |
  |-- GET /api/reports ----------------------------------->   |                          |
  |                                                           |-- SELECT * FROM -------->|
  |                                                           |   reports ORDER BY       |
  |                                                           |   run_at DESC            |
  |<-- { reports: [...] } ---------------------------------<-- All reports ------------|
  |                                                           |                          |
```

---

## 🗄️ Database Schema

### Reports Table Structure

```sql
reports
├── id (UUID) - Primary key
├── execution_id (TEXT) - Unique identifier
├── schedule_id (TEXT, NULLABLE) - NULL for on-demand
├── industry (TEXT) - "Technology & Software"
├── sub_niche (TEXT) - "AI CRM"
├── geography (TEXT) - "North America" ✨ NEW
├── email (TEXT) - "user@example.com" ✨ NEW
├── frequency (TEXT) - "on-demand" or "daily/weekly/..."
├── run_at (TIMESTAMPTZ) - When report was generated
├── is_first_run (BOOLEAN) - True for on-demand
├── final_report (TEXT) - HTML content
├── email_report (TEXT) - Plain text version ✨ NEW
├── notes (TEXT) - User's notes ✨ NEW
├── status (TEXT) - "success" or "failed" ✨ NEW
└── created_at (TIMESTAMPTZ) - Row creation time
```

### Indexes

```sql
- idx_reports_schedule_id (schedule_id)
- idx_reports_run_at (run_at)
- idx_reports_execution_id (execution_id)
- idx_reports_email (email) ✨ NEW
```

---

## 🎨 UI Component Tree

```
/dashboard/new-research (Form)
    │
    ├── On-Demand Tab
    │   ├── Market Category (Select)
    │   ├── Sub-niche (Input)
    │   ├── Geography (Input)
    │   ├── Email (Input)
    │   ├── Notes (Textarea)
    │   └── Submit Button
    │       └── onClick: handleOnDemandSubmit()
    │           ├── 1. Call n8n webhook
    │           ├── 2. Save to Supabase
    │           └── 3. Navigate to report
    │
    └── Recurring Tab (separate flow)

/dashboard/reports (List)
    │
    ├── Stats Cards
    │   ├── Total Reports
    │   ├── This Month
    │   └── Latest Report
    │
    ├── Reports List (map over reports)
    │   └── For each report:
    │       ├── Title
    │       ├── Category Badge
    │       ├── Type Badge (On-demand/Recurring)
    │       ├── Email, Geography, Date
    │       ├── View Button
    │       └── Delete Button
    │
    └── Empty State (if no reports)

/dashboard/reports/[id] (Detail)
    │
    ├── Header Card
    │   ├── Title & Icon
    │   ├── Badges (Category, Type, Email)
    │   ├── Metadata (Date, Geography, Sub-niche)
    │   ├── Download PDF Button
    │   └── Share Button ✨ NEW
    │
    └── Report Content Card
        └── HTML Report (dangerouslySetInnerHTML)
```

---

## 🔐 Security & Permissions

### Supabase RLS Policies

```sql
reports table
├── INSERT: Public (for n8n webhook)
│   └── CREATE POLICY "Allow public insert for n8n"
│       FOR INSERT WITH CHECK (true)
│
├── SELECT: Authenticated users only
│   └── CREATE POLICY "Authenticated users can read reports"
│       FOR SELECT USING (auth.role() = 'authenticated')
│
├── UPDATE: Service role only
│   └── CREATE POLICY "Service role can manage all reports"
│       FOR ALL USING (auth.role() = 'service_role')
│
└── DELETE: Authenticated users (via API with validation)
```

---

## 📱 User Experience Flow

```
1. User Opens App
   └── Navigates to "New Research" tab

2. Fills Form
   ├── Selects market category
   ├── Enters sub-niche
   ├── Enters geography
   ├── Enters email
   └── Adds optional notes

3. Clicks "Submit Research"
   ├── Loading overlay appears
   ├── Button shows "Submitting..."
   └── Webhook call initiated

4. n8n Processes (5-30 seconds)
   ├── Runs market research workflow
   ├── Gathers data from sources
   ├── Generates HTML report
   └── Returns to app

5. App Receives Report
   ├── Saves to Supabase
   ├── Shows success toast
   └── Redirects to report page (1.5 seconds)

6. User Sees Report Immediately
   ├── Full HTML rendered beautifully
   ├── Can download as PDF
   ├── Can share via link
   └── Can navigate back to list

7. User Returns Later
   ├── Goes to "Reports" menu
   ├── Sees all reports (on-demand + recurring)
   ├── Can view, share, download, or delete
   └── Data persists permanently
```

---

## ✅ Success Indicators

### Console Logs (Happy Path)

```
🚀 On-Demand Research submission started
📤 Sending to webhook: https://n8n.example.com/webhook/...
📥 Response status: 200
📄 Raw response text: {"webReport":"<h2>...","emailReport":"..."}
✅ Parsed webhook response: {webReport: '...', emailReport: '...'}
💾 Saving report to database...
✅ Report saved to database with ID: ondemand_1705593600_xyz123
```

### Database State

```sql
SELECT execution_id, industry, sub_niche, email, geography, frequency
FROM reports
WHERE frequency = 'on-demand'
ORDER BY created_at DESC
LIMIT 1;

-- Expected Result:
-- execution_id: ondemand_1705593600_xyz123
-- industry: Technology & Software
-- sub_niche: AI CRM
-- email: user@example.com
-- geography: North America
-- frequency: on-demand
```

### UI State

- ✅ Report appears in `/dashboard/reports` list
- ✅ Title shows "Technology & Software - AI CRM"
- ✅ "On-demand" badge visible
- ✅ Email badge shows correct email
- ✅ Geography displays correctly
- ✅ View button navigates to report detail
- ✅ Report HTML renders properly
- ✅ Share button copies link
- ✅ PDF download works

---

## 🎉 Result

**Problem:** Reports saved to localStorage, fetched from Supabase → Mismatch → Nothing displayed

**Solution:** Reports saved to Supabase, fetched from Supabase → Match → Everything works!

**User Experience:**
- Submit form → See report immediately → Report saved permanently → Can access anytime ✅

