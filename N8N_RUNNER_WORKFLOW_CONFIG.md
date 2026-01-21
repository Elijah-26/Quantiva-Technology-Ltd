# 🔄 n8n Runner Workflow - Complete Configuration Guide

## 📋 Complete Workflow Structure

```
1. Schedule Trigger (Cron)
   ↓
2. Supabase: Get All Schedules
   ↓
3. Code: Filter Due Schedules
   ↓
4. Loop Over Items
   ↓
5. [Your AI Research Nodes]
   ↓
6. HTTP Request: POST /api/report-run (Save Report)
   ↓
7. HTTP Request: POST /api/schedules/{id}/update-run (Update Schedule)
```

---

## 🔧 Node Configurations

### **Node 1: Schedule Trigger**
```
Type: Schedule Trigger
Trigger Interval: Cron Expression
Cron: 0 0 * * *  (Daily at midnight)
```

---

### **Node 2: Supabase - Get All Schedules**
```
Operation: Select rows
Table: schedules
Return All: TRUE

Optional Filters:
- active: equals: true
- status: equals: "active"
```

**This returns all active schedules from Supabase.**

---

### **Node 3: Code - Filter Due Schedules**

**Language:** JavaScript

**Code to paste:**

```javascript
// This code filters schedules that are DUE to run now
const now = new Date();
const results = [];

// Get all schedules from Supabase node
const items = $input.all();

for (const item of items) {
  const schedule = item.json;
  
  // Skip if not active
  if (!schedule.active || schedule.status !== 'active') {
    continue;
  }
  
  // Check if next_run is in the past or now
  const nextRun = new Date(schedule.next_run);
  
  if (nextRun <= now) {
    // This schedule is DUE!
    results.push({
      json: {
        // Pass all data needed for report generation
        schedule_id: schedule.schedule_id,
        user_id: schedule.user_id,  // ✅ CRITICAL for user isolation
        industry: schedule.industry,
        sub_niche: schedule.sub_niche,
        geography: schedule.geography,
        email: schedule.email,
        frequency: schedule.frequency,
        notes: schedule.notes || '',
        
        // Metadata
        id: schedule.id,  // Database row ID (for updating later)
        last_run: schedule.last_run,
        next_run: schedule.next_run,
        execution_count: schedule.execution_count || 0,
        
        // Flags
        is_first_run: schedule.last_run === null,
        run_at: now.toISOString(),
        
        // Debug info
        daysOverdue: Math.floor((now - nextRun) / (1000 * 60 * 60 * 24))
      }
    });
  }
}

console.log(`Found ${results.length} due schedules out of ${items.length} total`);
return results;
```

---

### **Node 4: Loop Over Items**
```
Type: Split In Batches
Batch Size: 1
Options: 
  - Reset: false
```

---

### **Node 5: [Your AI Research Nodes]**

**YOUR EXISTING AI WORKFLOW NODES GO HERE**

The output should have a field called `final_report` with the generated HTML report.

---

### **Node 6: HTTP Request - Save Report**

**Method:** POST

**URL:** 
```
https://quantitva.vercel.app/api/report-run
```

**Authentication:** None

**Body Content Type:** JSON

**JSON Body:**

```json
{
  "schedule_id": "{{ $('Code').item.json.schedule_id }}",
  "user_id": "{{ $('Code').item.json.user_id }}",
  "industry": "{{ $('Code').item.json.industry }}",
  "sub_niche": "{{ $('Code').item.json.sub_niche }}",
  "frequency": "{{ $('Code').item.json.frequency }}",
  "run_at": "{{ $('Code').item.json.run_at }}",
  "is_first_run": {{ $('Code').item.json.is_first_run }},
  "final_report": {{ JSON.stringify($json.final_report) }}
}
```

**Important Notes:**
- `$('Code')` refers to the "Filter Due Schedules" code node
- `$json.final_report` refers to the output from your AI nodes
- Make sure your AI nodes output a field called `final_report`

**Expected Response:**
```json
{
  "success": true,
  "execution_id": "exec_1234567890_abc123",
  "schedule_id": "sched_abc123",
  "is_first_run": false,
  "message": "Execution logged successfully.",
  "timestamp": "2026-01-21T12:00:00.000Z"
}
```

---

### **Node 7: HTTP Request - Update Schedule**

**Method:** POST

**URL:** 
```
https://quantitva.vercel.app/api/schedules/{{ $('Code').item.json.id }}/update-run
```

**Authentication:** None

**Body Content Type:** JSON

**JSON Body:**

```json
{
  "executionId": "{{ $('HTTP Request').json.execution_id }}",
  "success": true
}
```

**Important Notes:**
- `$('Code').item.json.id` is the database row ID (UUID)
- `$('HTTP Request')` refers to the previous "Save Report" node
- This updates `last_run`, `next_run`, and `execution_count`

**Expected Response:**
```json
{
  "success": true,
  "scheduleId": "8307b981-d653-4443-ae85-77795c623dd4",
  "lastRun": "2026-01-21T12:00:00.000Z",
  "nextRun": "2026-01-28T12:00:00.000Z",
  "executionCount": 1,
  "message": "Schedule updated successfully"
}
```

---

## 🎯 Quick Copy/Paste Reference

### For Node 6 (Save Report):
```json
{
  "schedule_id": "{{ $('Code').item.json.schedule_id }}",
  "user_id": "{{ $('Code').item.json.user_id }}",
  "industry": "{{ $('Code').item.json.industry }}",
  "sub_niche": "{{ $('Code').item.json.sub_niche }}",
  "frequency": "{{ $('Code').item.json.frequency }}",
  "run_at": "{{ $('Code').item.json.run_at }}",
  "is_first_run": {{ $('Code').item.json.is_first_run }},
  "final_report": {{ JSON.stringify($json.final_report) }}
}
```

### For Node 7 (Update Schedule):
```json
{
  "executionId": "{{ $('HTTP Request').json.execution_id }}",
  "success": true
}
```

---

## ✅ Testing Checklist

### **1. Test Filter Logic**

In Supabase SQL Editor, set a schedule to be overdue:

```sql
UPDATE schedules 
SET next_run = NOW() - INTERVAL '1 day',
    active = true,
    status = 'active'
WHERE schedule_id = 'sched_ac8c04ae-4476-414a-b872-c1c86a01c012';
```

### **2. Manually Trigger Workflow**

In n8n, click "Execute Workflow" and watch the output of each node.

### **3. Verify Results**

**In Supabase:**

Check reports table:
```sql
SELECT execution_id, schedule_id, user_id, industry, sub_niche, run_at
FROM reports
ORDER BY run_at DESC
LIMIT 5;
```

Check schedules table (should be updated):
```sql
SELECT schedule_id, last_run, next_run, execution_count
FROM schedules
WHERE schedule_id = 'sched_ac8c04ae-4476-414a-b872-c1c86a01c012';
```

**In Your Dashboard:**
- Go to `/dashboard/reports`
- You should see the new report
- Each user should only see their own reports

---

## 🔧 Troubleshooting

### Error: "user_id is required"
**Solution:** Make sure Node 3 (Filter Code) includes `user_id` in the output

### Error: "Schedule not found" (Node 7)
**Solution:** Make sure you're using `$('Code').item.json.id` (the UUID), not `schedule_id`

### Schedule runs multiple times
**Solution:** Verify Node 7 is executing successfully and updating `next_run`

### User sees reports from other users
**Solution:** Verify `user_id` is being sent correctly in Node 6

---

## 📊 Expected Data Flow

```
Day 1: Jan 26, 2026
─────────────────────
schedules table BEFORE:
  next_run: "2026-01-26T00:00:00Z"
  last_run: null
  execution_count: 0

→ n8n runs at midnight
→ Filter finds schedule is due
→ AI generates report
→ Node 6: Saves to reports table (with user_id)
→ Node 7: Updates schedule

schedules table AFTER:
  next_run: "2026-02-02T00:00:00Z"  ← Updated!
  last_run: "2026-01-26T00:00:00Z"  ← Updated!
  execution_count: 1                ← Updated!

reports table (NEW ROW):
  execution_id: "exec_1737849600_abc123"
  schedule_id: "sched_ac8c04ae-4476-414a-b872-c1c86a01c012"
  user_id: "a4ee9aa8-e761-4061-a3ed-b24def49e8c1"
  industry: "Technology & Software"
  run_at: "2026-01-26T00:00:00Z"

─────────────────────
Day 2: Jan 27, 2026
─────────────────────
schedules table:
  next_run: "2026-02-02T00:00:00Z"  ← In future

→ n8n runs at midnight
→ Filter: next_run (Feb 2) > today (Jan 27)
→ SKIPPED! ✅

No report generated (correct behavior)
```

---

## 🎉 Success Indicators

✅ Filter code finds only schedules where `next_run <= now`
✅ Each report has `user_id` attached
✅ Schedules table updates after each run
✅ Users only see their own reports in dashboard
✅ Schedules don't run multiple times per day
✅ Paused schedules are skipped
✅ Deleted schedules never run

---

**You're all set! Copy the configurations above into your n8n workflow.** 🚀

