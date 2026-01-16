# Quick Test Script

## Test the Display Without n8n

To test if the display functionality works, open your browser console on the report page (`/dashboard/reports/1`) and run:

### Test 1: Array Format (Expected)
```javascript
localStorage.setItem('latestWebhookReport', JSON.stringify([
  {
    "webReport": "<h2>Test Market Overview</h2>\n<p>This is a <strong>test report</strong> to verify the display functionality works correctly.</p>\n<h3>Test Section</h3>\n<ul>\n<li>Test item 1</li>\n<li>Test item 2</li>\n<li>Test item 3</li>\n</ul>\n<p>Link test: <a href='https://example.com' target='_blank'>Click here</a></p>",
    "emailReport": "Email version"
  }
]));

// Reload the page
location.reload();
```

**Expected Result:** You should see a blue/purple gradient card with "Test Market Overview" heading and formatted content.

### Test 2: Object Format (Alternative)
```javascript
localStorage.setItem('latestWebhookReport', JSON.stringify({
  "webReport": "<h2>Alternative Format Test</h2>\n<p>This tests if the system handles object format (not array).</p>",
  "emailReport": "Email version"
}));

// Reload the page
location.reload();
```

**Expected Result:** Should also display correctly with the updated code.

### Test 3: Clear Data
```javascript
localStorage.removeItem('latestWebhookReport');
location.reload();
```

**Expected Result:** Webhook report section should not appear (only default tabs visible).

---

## Check What n8n Returns

### In Browser Network Tab:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Clear it (🚫 icon)
4. Submit the form
5. Look for your webhook URL
6. Click on it
7. Go to **Response** tab
8. Copy the entire response

### Paste Response Here to Analyze:

The response should look like ONE of these:

**Option A (Array - Preferred):**
```json
[
  {
    "webReport": "<h2>Market Overview</h2>...",
    "emailReport": "..."
  }
]
```

**Option B (Object - Also Works Now):**
```json
{
  "webReport": "<h2>Market Overview</h2>...",
  "emailReport": "..."
}
```

**Option C (Nested - Won't Work):**
```json
{
  "data": {
    "webReport": "...",
    "emailReport": "..."
  }
}
```
If you get Option C, you need to modify your n8n workflow.

---

## Console Logs to Check

After submitting the form, you should see these in console:

```
🚀 Form submission started
Form submitted: {marketCategory: "...", ...}
Active webhooks: [{name: "...", url: "...", active: true}]
📤 Sending to webhook: https://...
📥 Response status from ...: 200
📊 All results: [...]
📄 Raw response text: [{"webReport":"...","emailReport":"..."}]
✅ Parsed webhook response: [{...}]
Success count: 1
Final webhook response data: [{...}]
✓ Research request submitted successfully!
  The Report has been sent to your email
```

Then after redirect to report page:

```
🔄 Report page mounted, loading webhook data...
🔍 Checking localStorage for webhook report: Found
✅ Successfully parsed webhook report: [{...}]
✅ Webhook data loaded successfully: [{...}]
📄 Using array format: webhookData[0].webReport
```

---

## Common Issues & Solutions

### Issue 1: Button Doesn't Show Spinner

**Symptoms:**
- Button text changes to "Submitting..." but no spinner animation
- Or button doesn't change at all

**Causes:**
- CSS not loaded
- Loader2 icon not rendering

**Check:**
```javascript
// In console while on the form page:
import('lucide-react').then(m => console.log('Loader2:', m.Loader2))
```

**Solution:**
Already fixed in code - the spinner should now work.

---

### Issue 2: Data Sent But Not Displayed

**Symptoms:**
- Console shows "Success count: 1"
- Console shows "Final webhook response data: [...]"
- localStorage has data
- But report page shows nothing

**Check Console on Report Page:**
Look for:
```
📄 Using array format: webhookData[0].webReport
```
or
```
📄 Using object format: webhookData.webReport
```

If you see:
```
⚠️ Webhook data found but no webReport field
```

Then your response format is wrong. Check what structure it actually has.

**Debug:**
```javascript
// On report page console:
const data = JSON.parse(localStorage.getItem('latestWebhookReport'))
console.log('Structure:', data)
console.log('Has webReport?', !!data.webReport)
console.log('Has array[0]?', !!data[0])
console.log('Has array[0].webReport?', !!data[0]?.webReport)
```

---

### Issue 3: CORS Error

**Symptoms:**
```
Access to fetch at 'https://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solution:**

In your n8n "Respond to Webhook" node, add headers:

**Response Headers:**
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
}
```

---

### Issue 4: "Body Already Read" Error

**Symptoms:**
```
Failed to execute 'json' on 'Response': body stream already read
```

**Solution:**
Already fixed! The code now uses `.text()` and manually parses.

---

## Verification Checklist

Run through this checklist:

### Form Submission:
- [ ] Fill out form completely (all required fields)
- [ ] Click Submit button
- [ ] Button changes to show spinner + "Processing..."
- [ ] Console shows "🚀 Form submission started"
- [ ] Console shows "📤 Sending to webhook"
- [ ] Console shows "📥 Response status: 200"
- [ ] Console shows "✅ Parsed webhook response"
- [ ] Toast appears: "Research request submitted successfully!"
- [ ] Toast description: "The Report has been sent to your email"
- [ ] Form fields clear
- [ ] After 2 seconds, redirects to `/dashboard/reports/1`

### Report Display:
- [ ] Page loads at `/dashboard/reports/1`
- [ ] Console shows "🔄 Report page mounted"
- [ ] Console shows "✅ Webhook data loaded successfully"
- [ ] Console shows "📄 Using array format" (or object format)
- [ ] Blue/purple gradient card appears
- [ ] Title: "AI-Generated Market Intelligence Report"
- [ ] HTML content renders with proper formatting
- [ ] Headings are styled correctly
- [ ] Links are blue and clickable
- [ ] Lists have proper spacing
- [ ] "Download PDF" button is visible and blue

### PDF Download:
- [ ] Click "Download PDF" button
- [ ] Button text changes to "Generating..."
- [ ] Button is disabled during generation
- [ ] After a few seconds, PDF downloads
- [ ] PDF opens and shows content
- [ ] Toast appears: "PDF downloaded successfully"

---

## Still Not Working?

Please provide:

1. **Full console log** from form submission (copy all text from console)
2. **Full console log** from report page load
3. **Network tab response** (the actual JSON returned by webhook)
4. **localStorage value**: 
   ```javascript
   localStorage.getItem('latestWebhookReport')
   ```
5. **Any error messages** in red

With this information, I can pinpoint the exact issue!

