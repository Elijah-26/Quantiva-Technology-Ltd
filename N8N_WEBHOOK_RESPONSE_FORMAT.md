# n8n Webhook Response Format - Official Documentation

## Date: January 26, 2026

## Required Response Format

Your n8n "Respond to Webhook" node should return this exact format:

```json
[
  {
    "web_report": "<h2>Your Report Title</h2><p>Report content in HTML format...</p>",
    "email_report": "Email-friendly version of the report (can be plain text or HTML)",
    "subject": "The Report Title/Topic"
  }
]
```

## Field Descriptions

### 1. `web_report` (REQUIRED)
- **Purpose**: Main report content for web display
- **Format**: HTML string
- **Usage**: Displayed in the report detail page
- **Example**:
  ```html
  "<h2>Market Overview</h2><p>The satellite internet market is entering a transformative phase...</p>"
  ```

### 2. `email_report` (REQUIRED)
- **Purpose**: Email-friendly version of the report
- **Format**: Plain text or simple HTML (no complex CSS)
- **Usage**: Sent via email to the user
- **Example**:
  ```
  "Market Overview\n\nThe satellite internet market is entering a transformative phase..."
  ```

### 3. `subject` (OPTIONAL but RECOMMENDED)
- **Purpose**: Report title/topic
- **Format**: Plain text string
- **Usage**: Used as the report sub-niche/title in the database
- **Example**:
  ```
  "Starlink's 2026 IPO and the Growing Satellite Internet Market"
  ```
- **If not provided**: Falls back to the form's sub-niche field

## How the Frontend Uses This Data

### On-Demand Reports:
1. **web_report** → Saved as `final_report` in database
2. **email_report** → Saved as `email_report` in database
3. **subject** → Saved as `sub_niche` (report title)

### Recurring Reports:
Same mapping as on-demand reports.

## n8n Configuration Example

### In your "Respond to Webhook" node:

**Response Body:**
```json
[
  {
    "web_report": "={{ $json.web_report }}",
    "email_report": "={{ $json.email_report }}",
    "subject": "={{ $json.subject }}"
  }
]
```

**Response Headers:**
```json
{
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
}
```

**Response Code:** `200`

## Alternative Naming (Also Supported)

The frontend also supports camelCase naming:

```json
[
  {
    "webReport": "...",
    "emailReport": "...",
    "subject": "..."
  }
]
```

Both naming conventions work! Use whichever is more convenient for your workflow.

## Complete Example

Here's a complete real-world example from your workflow:

```json
[
  {
    "web_report": "<h2>Market Overview</h2><p>The satellite internet market is entering a transformative phase, marked by Starlink's anticipated transition towards a public listing in 2026. This move signals a maturation of the sector and heightened scrutiny regarding regulatory compliance, governance, and transparency standards typical of public companies. Satellite internet continues to rise as a compelling alternative to traditional broadband, appealing to users in diverse segments including residential, transportation, emergency, and remote-access settings.</p><h2>Market Size and Growth Outlook</h2><p>The growing global demand for internet connectivity, especially in underserved and remote locations, fuels the expansion of satellite internet solutions. Starlink, as an early and prominent player, is expanding its service capabilities rapidly, positioning itself for sustained growth. This expansion is bolstered by increasing acceptance of satellite internet's viability relative to conventional broadband providers.</p><h2>Key Trends Shaping the Market</h2><p>Several key trends define the current market landscape: the impending public listing of Starlink in 2026, which will introduce greater transparency and governance; intensifying competition within satellite communications, with both traditional broadband providers and telecom companies contesting market share; and closer comparison and convergence of service expectations between satellite-based and terrestrial internet providers.</p><h2>Competitive Landscape</h2><p>Starlink faces competition not only from established traditional broadband providers but also from telecom companies expanding their offerings. This multi-faceted competition underscores the evolving nature of the connectivity market, where satellite internet must demonstrate clear advantages in coverage, reliability, and value to differentiate itself.</p><h2>Market Drivers and Constraints</h2><p>Primary drivers include increased global internet access demand and accelerated development of Starlink's technology and coverage. The broader industry recognition of satellite internet as a credible and scalable alternative further propels growth. Conversely, regulatory conditions governing space operations and communications remain a critical constraint, adding complexity to market access and commercialization. Additionally, successful navigation of IPO execution risks will be essential for Starlink's transition to a public entity.</p><h2>Opportunities and Strategic Implications</h2><p>Starlink's IPO presents opportunities to redefine industry standards, particularly concerning transparency and governance—potentially setting benchmarks that influence broader market practices. Growth prospects are significant in providing global connectivity solutions, particularly in regions where terrestrial infrastructure is limited. Strategic focus on regulatory engagement and technology innovation will be key to capitalizing on these opportunities.</p><h2>Forward-Looking Outlook</h2><p>The satellite internet market is poised for robust expansion driven by technological advancements and increased industry legitimacy. Starlink's public listing in 2026 will likely be a pivotal event, shaping investor confidence and competitive dynamics. Firms that can effectively address regulatory challenges while scaling service capabilities stand to gain significant market advantage.</p><p><strong>Sources:</strong> <a href=\"https://finance.yahoo.com/news/starlink-2026-ipo-plans-broader-132500098.html\" target=\"_blank\">Yahoo Finance</a></p>",
    
    "email_report": "<strong>Market Overview</strong><br><br>The satellite internet market is evolving rapidly with Starlink's planned public listing in 2026, signaling industry maturation. Satellite internet is increasingly recognized as a viable alternative to traditional broadband, serving diverse segments such as residential, transportation, emergency, and remote-access.<br><br><strong>Market Size and Growth</strong><br><br>Demand for global connectivity is driving growth. Starlink continues expanding its coverage and service capabilities, benefiting from greater market acceptance.<br><br><strong>Key Trends</strong><br><br>Key trends include Starlink's IPO, heightened competition from traditional broadband and telecoms, and increased governance and transparency for public companies.<br><br><strong>Competitive Landscape</strong><br><br>Starlink competes with established broadband providers and telecom companies, emphasizing the need to demonstrate clear advantages in coverage and reliability.<br><br><strong>Drivers and Constraints</strong><br><br>Growth is driven by expanding global internet needs and technological advances but constrained by regulatory challenges and IPO execution risks.<br><br><strong>Opportunities</strong><br><br>The IPO offers a chance to set new industry standards post-listing and to capitalize on demand in underserved regions.<br><br><strong>Outlook</strong><br><br>The satellite internet space is positioned for significant growth. Starlink's IPO will be a key milestone influencing market dynamics and investor confidence.<br><br><strong>Source:</strong> <a href=\"https://finance.yahoo.com/news/starlink-2026-ipo-plans-broader-132500098.html\" target=\"_blank\">Yahoo Finance</a>",
    
    "subject": "Starlink's 2026 IPO and the Growing Satellite Internet Market"
  }
]
```

## What Gets Saved to Database

When the webhook returns the above data, here's what gets saved:

```
Table: reports
---
execution_id: "ondemand_1738005432_abc123xyz"
user_id: "f0c6bdf9-8b8c-4324-8864-798ed3f037c0"
industry: "Technology & Software" (from form)
sub_niche: "Starlink's 2026 IPO and the Growing Satellite Internet Market" (from subject)
geography: "Global" (from form)
email: "kaytoba72@gmail.com" (from form)
frequency: "on-demand"
final_report: "<h2>Market Overview</h2>..." (from web_report)
email_report: "<strong>Market Overview</strong>..." (from email_report)
run_at: "2026-01-26T12:19:00Z"
status: "success"
```

## Frontend Processing

The frontend code extracts the data like this:

```typescript
// Extract fields from webhook response
const reportData = Array.isArray(webhookResponseData) 
  ? webhookResponseData[0] 
  : webhookResponseData

// Support both naming conventions
const webReport = reportData.webReport || reportData.web_report || ''
const emailReport = reportData.emailReport || reportData.email_report || webReport
const reportSubject = reportData.subject || ''

// Use subject as the report title if provided
const reportTitle = reportSubject || formData.subNiche
```

## Debugging Your Webhook

If reports aren't showing up, check the browser console for these logs:

```
📊 Extracted from webhook: {
  hasWebReport: true,
  hasEmailReport: true,
  subject: "Starlink's 2026 IPO and the Growing Satellite Internet Market"
}
```

If `hasWebReport` is `false`, your webhook isn't returning the `web_report` field correctly.

## Testing Your n8n Workflow

Use this curl command to test your webhook:

```bash
curl -X POST https://your-n8n-url.com/webhook/your-webhook-id \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "marketCategory": "Technology & Software",
    "subNiche": "Satellite Internet",
    "geography": "Global",
    "email": "test@example.com",
    "researchType": "on-demand"
  }'
```

Expected response:
```json
[
  {
    "web_report": "<h2>...</h2><p>...</p>",
    "email_report": "...",
    "subject": "..."
  }
]
```

## Key Points

✅ **Focus on these 3 fields**: `web_report`, `email_report`, `subject`  
✅ **web_report**: Main HTML content for web display  
✅ **email_report**: Email-friendly version  
✅ **subject**: Report title (optional but recommended)  
✅ **Format**: Must be an array with one object `[{...}]`  
✅ **Naming**: Both snake_case and camelCase are supported  

---

**Status**: ✅ Complete - This is the official webhook format

