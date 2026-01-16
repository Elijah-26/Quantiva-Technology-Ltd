# Debugging Guide - Webhook Integration

## Issue: Data Not Displaying After Webhook Response

### Steps to Debug:

## 1. Check Browser Console

Open your browser's Developer Tools (F12) and go to the Console tab. After submitting the form, look for these logs:

```
🚀 Form submission started
Form submitted: {...}
Active webhooks: [...]
📤 Sending to webhook: http://...
📥 Response status from ...: 200
📊 All results: [...]
📄 Raw response text: {...}
✅ Parsed webhook response: {...}
Success count: 1
Final webhook response data: {...}
```

### What to Check:

1. **Response Status**: Should be `200` (or `201`)
2. **Raw Response Text**: Check the format of the response
3. **Parsed Response**: Make sure it parsed successfully

## 2. Check localStorage

In the browser console, type:

```javascript
localStorage.getItem('latestWebhookReport')
```

This should show the stored data. If it's `null`, the data wasn't stored.

To see it parsed:

```javascript
JSON.parse(localStorage.getItem('latestWebhookReport'))
```

## 3. Expected Webhook Response Format

Your n8n workflow's "Respond to Webhook" node should return:

### Format 1 (Array - Current Expected Format):
```json
[
  {
    "webReport": "<h2>Market Overview</h2>\n<p>Content here...</p>",
    "emailReport": "Email version..."
  }
]
```

### Format 2 (Object):
```json
{
  "webReport": "<h2>Market Overview</h2>\n<p>Content here...</p>",
  "emailReport": "Email version..."
}
```

## 4. Common Issues

### Issue A: Response is not in expected format

**Symptom**: Data shows in console but not on page

**Solution**: Check if your n8n response is wrapped in an array. The code expects `webhookData[0].webReport`.

If your n8n returns an object instead of an array, add this to your n8n workflow:

```javascript
// In a Function node before "Respond to Webhook"
return [
  {
    webReport: items[0].json.webReport,
    emailReport: items[0].json.emailReport
  }
];
```

### Issue B: CORS Error

**Symptom**: Console shows CORS error

**Solution**: Your n8n webhook needs to include CORS headers. In n8n, set response headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Issue C: Response body already read

**Symptom**: Error "Failed to execute 'json' on 'Response': body stream already read"

**Solution**: Already fixed in the updated code - we now use `.text()` and parse manually.

## 5. Test Your Webhook Directly

You can test your webhook URL directly using curl:

```bash
curl -X POST https://your-n8n-url.com/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "marketCategory": "Healthcare & Pharmaceuticals",
    "subNiche": "EMR and Care Management",
    "geography": "United States",
    "researchType": "on-demand",
    "frequency": "weekly",
    "notes": "",
    "submittedAt": "2026-01-10T12:00:00Z"
  }'
```

The response should be:
```json
[
  {
    "webReport": "<h2>...</h2>...",
    "emailReport": "..."
  }
]
```

## 6. Verify n8n Workflow Setup

Your n8n workflow should have:

1. **Webhook Trigger** - Receives the POST request
2. **Your Processing Nodes** - AI, research, etc.
3. **Respond to Webhook Node** - MUST return the data in the correct format

### Example Respond to Webhook Configuration:

**Response Body:**
```json
[
  {
    "webReport": "{{ $json.webReport }}",
    "emailReport": "{{ $json.emailReport }}"
  }
]
```

**Response Code:** `200`

**Response Headers:**
```json
{
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
}
```

## 7. Check Network Tab

In browser DevTools:
1. Go to **Network** tab
2. Submit the form
3. Look for your webhook URL request
4. Click on it
5. Check **Response** tab to see what was returned

## 8. Manual Test

To test if the display works, manually set data in console:

```javascript
localStorage.setItem('latestWebhookReport', JSON.stringify([
  {
    "webReport": "<h2>Test Report</h2><p>This is a test to see if display works.</p>",
    "emailReport": "Test"
  }
]))
```

Then refresh the page or navigate to `/dashboard/reports/1`

If you see "Test Report" displayed, the display code works fine - issue is with webhook response.

## 9. Check for JavaScript Errors

Look for any red errors in the console that might prevent the code from running.

## 10. Verify Button Animation

The button should show:
- Before click: "Submit Research Request"
- After click: Spinner icon + "Processing..."
- After success: Resets to "Submit Research Request"

If you don't see the spinner, there might be a CSS issue or the `Loader2` icon isn't imported.

---

## Updated Code Features

The updated code now includes:

1. ✅ Better error handling
2. ✅ Uses `.text()` instead of `.json()` to avoid "body already read" errors
3. ✅ Comprehensive console logging with emojis for easy debugging
4. ✅ Clear success/fail counts
5. ✅ Individual webhook status logging

---

## Quick Checklist

- [ ] Webhook URL is correct in Settings
- [ ] Webhook is marked as "Active"
- [ ] n8n workflow is activated
- [ ] n8n "Respond to Webhook" node returns array format
- [ ] Response includes `webReport` field with HTML content
- [ ] CORS headers are set (if needed)
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 response
- [ ] localStorage contains the data
- [ ] Page redirects to `/dashboard/reports/1` after 2 seconds

---

## Need More Help?

Share these console logs:
1. All logs starting with emojis (🚀 📤 📥 etc.)
2. The "Final webhook response data" log
3. What `localStorage.getItem('latestWebhookReport')` returns
4. Any error messages in red

