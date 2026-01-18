# 🚀 Deployment & Testing Guide - On-Demand Reports Fix

## 📋 Pre-Deployment Checklist

### 1. Database Schema Update

**CRITICAL:** You must run this SQL in Supabase before deploying!

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of `supabase-reports-update.sql`
5. Click **Run**
6. Verify success message appears

**Expected Output:**
```
Reports table updated successfully for on-demand reports!
```

### 2. Environment Variables Check

Ensure these are set in your environment (Vercel/local):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Code Changes Summary

Files modified/created:
- ✅ `app/api/reports/on-demand/route.ts` (NEW)
- ✅ `app/dashboard/new-research/page.tsx` (MODIFIED)
- ✅ `app/api/reports/route.ts` (MODIFIED)
- ✅ `app/api/reports/[id]/route.ts` (MODIFIED)
- ✅ `app/dashboard/reports/[id]/page.tsx` (MODIFIED)
- ✅ `supabase-reports-update.sql` (NEW)

---

## 🧪 Testing Plan

### Phase 1: Database Verification

```sql
-- Check if new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;
```

**Expected columns:**
- execution_id
- schedule_id (nullable)
- industry
- sub_niche
- geography ✨ NEW
- email ✨ NEW
- frequency
- run_at
- is_first_run
- final_report
- email_report ✨ NEW
- notes ✨ NEW
- status ✨ NEW
- created_at

### Phase 2: API Endpoint Testing

#### Test 1: On-Demand Report Creation

```bash
# Test the new endpoint
curl -X POST http://localhost:3000/api/reports/on-demand \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Technology & Software",
    "sub_niche": "AI Testing Tools",
    "geography": "North America",
    "email": "test@example.com",
    "final_report": "<h2>Test Report</h2><p>This is a test report.</p>",
    "email_report": "Test Report - This is a test report.",
    "notes": "Test submission"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "execution_id": "ondemand_1234567890_xyz123",
  "report_id": "ondemand_1234567890_xyz123",
  "message": "On-demand report saved successfully",
  "timestamp": "2026-01-18T..."
}
```

#### Test 2: Fetch Reports

```bash
# Should include the newly created report
curl http://localhost:3000/api/reports
```

**Expected:** Array of reports with email and geography fields populated

#### Test 3: Fetch Single Report

```bash
# Replace {id} with execution_id from Test 1
curl http://localhost:3000/api/reports/{id}
```

**Expected:** Single report object with all fields

#### Test 4: Delete Report

```bash
curl -X DELETE http://localhost:3000/api/reports/{id}
```

**Expected:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### Phase 3: UI Flow Testing

#### Test Case 1: Submit On-Demand Report

1. **Navigate:** Go to `/dashboard/new-research`
2. **Select:** Click "On-Demand Research" tab
3. **Fill Form:**
   - Market Category: "Technology & Software"
   - Sub-niche: "AI-powered Analytics"
   - Geography: "Europe"
   - Email: "your-email@example.com"
   - Notes: "Testing new flow"
4. **Submit:** Click "Submit Research"
5. **Observe:**
   - Loading overlay should appear
   - Console logs should show webhook call
   - Success toast should appear
   - Redirect to report page (within 2 seconds)

**Expected Console Logs:**
```
🚀 On-Demand Research submission started
📤 Sending to webhook: [url]
📥 Response status from [name]: 200
📄 Raw response text: {...}
✅ Parsed webhook response: {...}
💾 Saving report to database...
✅ Report saved to database with ID: ondemand_...
```

#### Test Case 2: View Reports List

1. **Navigate:** Go to `/dashboard/reports`
2. **Verify:**
   - New report appears at the top
   - Title shows "Technology & Software - AI-powered Analytics"
   - Geography shows "Europe"
   - Type badge shows "On-demand"
   - Stats update (Total Reports count)

#### Test Case 3: View Report Details

1. **Click:** "View Report" button on any report
2. **Verify:**
   - Report HTML renders correctly
   - Email badge shows correct email
   - Geography displays correctly
   - Date is formatted properly
   - Share button is clickable
   - Download PDF button works

#### Test Case 4: Share Functionality

1. **On report detail page**, click "Share" button
2. **Expected Behavior:**
   - **On Mobile:** Native share dialog opens
   - **On Desktop:** "Link copied to clipboard!" toast appears
3. **Verify:** Copied link opens the same report

#### Test Case 5: PDF Download

1. **On report detail page**, click "Download PDF"
2. **Verify:**
   - Button shows "Generating..." during creation
   - Success toast appears
   - PDF file downloads
   - PDF contains report content
   - Filename format: `Market_Research_Report_YYYY-MM-DD.pdf`

#### Test Case 6: Delete Report

1. **On reports list page**, click trash icon
2. **Confirm:** Click "OK" in confirmation dialog
3. **Verify:**
   - Success toast appears
   - Report disappears from list
   - Stats update correctly

### Phase 4: Error Handling Tests

#### Test 1: Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/reports/on-demand \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "Technology"
  }'
```

**Expected:** 400 error with validation details

#### Test 2: Invalid Report ID

```bash
curl http://localhost:3000/api/reports/invalid_id_123
```

**Expected:** 404 error "Report not found"

#### Test 3: Network Failure Simulation

1. Turn off network
2. Try to submit on-demand report
3. **Expected:** Error toast appears with retry message

---

## 🚨 Common Issues & Solutions

### Issue 1: "Report not found" after submission

**Cause:** Database insert failed or report wasn't saved

**Solution:**
1. Check Supabase logs for errors
2. Verify `email`, `geography`, `notes` columns exist
3. Check RLS policies allow inserts

### Issue 2: Reports page is empty

**Cause:** API fetch failed or reports table is empty

**Solution:**
1. Open DevTools → Network tab
2. Check `/api/reports` request
3. Look for errors in response
4. Verify Supabase connection

### Issue 3: Share button doesn't work

**Cause:** Browser doesn't support clipboard API

**Solution:**
- Use HTTPS (clipboard API requires secure context)
- Test on different browser
- Check browser permissions

### Issue 4: PDF download fails

**Cause:** html2canvas library issue

**Solution:**
1. Check console for errors
2. Ensure report content renders properly
3. Try on different browser
4. Check if images have CORS issues

---

## 📊 Monitoring & Logs

### What to Monitor

1. **Supabase Dashboard:**
   - New rows in `reports` table
   - Query performance
   - Storage usage

2. **Vercel Logs:**
   - API endpoint responses
   - Error rates
   - Response times

3. **Browser Console:**
   - Webhook call success/failure
   - Database save confirmation
   - Navigation events

### Important Console Logs

**Successful Flow:**
```
🚀 On-Demand Research submission started
📤 Sending to webhook: [url]
📥 Response status: 200
✅ Parsed webhook response
💾 Saving report to database...
✅ Report saved to database with ID: ondemand_xxx
```

**Failed Flow:**
```
❌ Webhook returned non-OK status: 500
❌ Failed to save report to database
```

---

## 🔄 Rollback Plan

If something goes wrong:

### Option 1: Revert Code Changes

```bash
git revert HEAD
git push origin main
```

### Option 2: Fix Forward

Most issues can be fixed by:
1. Updating database schema
2. Adjusting RLS policies
3. Fixing API endpoint logic

The old localStorage system is still in the codebase (`lib/reports.ts`) but not imported, so it won't interfere.

---

## ✅ Success Criteria

Your deployment is successful when:

- [x] New on-demand reports save to database
- [x] Reports appear immediately in Reports list
- [x] Report detail page displays correctly
- [x] Email and geography show in UI
- [x] Share button works (copies link)
- [x] PDF download works
- [x] Delete functionality works
- [x] No console errors
- [x] All API endpoints return 200 OK
- [x] Supabase logs show successful inserts

---

## 📞 Support

If you encounter issues:

1. Check console logs for errors
2. Verify database schema is updated
3. Test API endpoints directly with cURL
4. Check Supabase RLS policies
5. Review the full documentation in `ON_DEMAND_REPORTS_FIX.md`

---

## 🎉 Post-Deployment

After successful deployment:

1. ✅ Test with real n8n webhook
2. ✅ Submit actual research request
3. ✅ Verify report quality
4. ✅ Share with team members
5. ✅ Monitor for a few days

**Your on-demand reports system is now production-ready!** 🚀

