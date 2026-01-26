# Field Naming Mismatch Fix

## Date: January 26, 2026

## Problem Identified

The n8n workflow was returning the correct report data but with **snake_case** field names:
```json
{
  "web_report": "<h2>Market Overview</h2>...",
  "email_report": "..."
}
```

However, the frontend code was expecting **camelCase** field names:
```json
{
  "webReport": "<h2>Market Overview</h2>...",
  "emailReport": "..."
}
```

This caused the report content to appear as empty/undefined, triggering the error:
> "Report generation failed - No content was generated. Please try again."

## Solution Applied

Updated the frontend code to support **both naming conventions** (snake_case and camelCase):

### File: `app/dashboard/new-research/page.tsx`

**Before:**
```typescript
const webReport = reportData.webReport || ''
const emailReport = reportData.emailReport || webReport
```

**After:**
```typescript
// Support both camelCase and snake_case naming
const webReport = reportData.webReport || reportData.web_report || ''
const emailReport = reportData.emailReport || reportData.email_report || webReport
```

This was applied in TWO places:
1. On-demand report submission (line ~248)
2. Recurring report submission (line ~444)

## Now Supported Formats

The application now accepts either format from your n8n webhook:

### ✅ Format 1: camelCase (JavaScript convention)
```json
[
  {
    "webReport": "<h2>Market Overview</h2>...",
    "emailReport": "..."
  }
]
```

### ✅ Format 2: snake_case (Python/database convention)
```json
[
  {
    "web_report": "<h2>Market Overview</h2>...",
    "email_report": "..."
  }
]
```

### ✅ Format 3: Object instead of array
```json
{
  "webReport": "...",
  "emailReport": "..."
}
```
or
```json
{
  "web_report": "...",
  "email_report": "..."
}
```

## No Changes Required to Your n8n Workflow

You can keep your current n8n workflow exactly as it is! The frontend now handles both naming conventions automatically.

## Testing

After this fix, test by:

1. **Submit an on-demand report** with your current n8n workflow
2. **Verify** the report displays immediately
3. **Check** that the report appears in the reports list
4. **Confirm** the report counter increments

The report should now display correctly with your existing n8n workflow configuration.

## Why This Happened

This is a common issue when integrating systems that follow different naming conventions:
- **JavaScript/Frontend**: Typically uses `camelCase`
- **Python/Backend/Databases**: Often use `snake_case`
- **n8n**: Allows either convention

The fix makes the system more flexible and tolerant of different naming styles.

## Related Files

- `app/dashboard/new-research/page.tsx` - Main fix location
- Report display will work with the naming from your n8n response

---

**Status**: ✅ Fixed - No n8n changes required

