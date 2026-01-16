# Quick Reference Guide

## How to Use the New Features

### For End Users

#### Submitting a Research Request
1. Navigate to **Dashboard > New Research**
2. Fill in the form:
   - Market Category (required)
   - Sub-niche or Specific Focus (required)
   - Geographic Focus (optional)
   - Research Type: On-Demand or Recurring
   - Additional Notes (optional)
3. Click **"Submit Research Request"** button
4. Wait for the "Processing..." indicator
5. Success message appears: "The Report has been sent to your email"
6. Automatically redirected to your report

#### Viewing & Downloading Reports
1. Navigate to **Dashboard > Reports**
2. Click on a report to view it
3. Report displays with:
   - Professional formatting
   - Clickable links
   - Styled headings and content
   - "Sent to Email" badge (if from webhook)
4. Click **"Download PDF"** button to save report
5. PDF downloads automatically to your Downloads folder

---

## For Developers

### Key Code Snippets

#### 1. PDF Generation Function

```typescript
const handleDownloadPDF = async () => {
  setIsDownloading(true)
  try {
    const reportElement = document.getElementById('report-content')
    if (!reportElement) {
      toast.error('Report content not found')
      return
    }

    // Create canvas from HTML
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Download PDF
    const fileName = `Market_Research_Report_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
    
    toast.success('PDF downloaded successfully')
  } catch (error) {
    console.error('PDF generation error:', error)
    toast.error('Failed to generate PDF')
  } finally {
    setIsDownloading(false)
  }
}
```

#### 2. Webhook Response Handling

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  try {
    const activeWebhooks = getActiveWebhooks()
    
    // Send to webhooks
    const webhookPromises = activeWebhooks.map(webhook =>
      fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          webhookName: webhook.name,
        }),
      })
    )

    const results = await Promise.allSettled(webhookPromises)
    
    // Get response data
    let webhookResponseData = null
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.ok) {
        webhookResponseData = await result.value.json()
        break
      }
    }
    
    const successCount = results.filter(r => 
      r.status === 'fulfilled' && r.value.ok
    ).length
    
    if (successCount > 0) {
      // Store in localStorage
      if (webhookResponseData) {
        localStorage.setItem(
          'latestWebhookReport', 
          JSON.stringify(webhookResponseData)
        )
      }

      // Custom success message
      toast.success('Research request submitted successfully!', {
        description: 'The Report has been sent to your email',
        duration: 5000,
      })
      
      // Reset form
      setFormData({ /* reset values */ })

      // Auto-redirect
      setTimeout(() => {
        router.push('/dashboard/reports/1')
      }, 2000)
    }
  } catch (error) {
    toast.error('Submission failed')
  } finally {
    setIsSubmitting(false)
  }
}
```

#### 3. Displaying Webhook HTML

```typescript
{webhookData && webhookData[0]?.webReport && (
  <Card className="border-2 mb-6">
    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <CardTitle>AI-Generated Market Intelligence Report</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="pt-6">
      <div 
        className="prose prose-sm max-w-none
          prose-headings:text-gray-900 prose-headings:font-bold
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 
          prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-blue-600 prose-a:no-underline 
          hover:prose-a:underline
          prose-ul:my-4 prose-ul:space-y-2
          prose-li:text-gray-700
          prose-strong:text-gray-900 prose-strong:font-semibold"
        dangerouslySetInnerHTML={{ __html: webhookData[0].webReport }}
      />
    </CardContent>
  </Card>
)}
```

#### 4. Enhanced Submit Button

```typescript
<Button 
  type="submit" 
  size="lg" 
  className="gap-2" 
  disabled={isSubmitting}
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      <FileSearch className="w-5 h-5" />
      Submit Research Request
    </>
  )}
</Button>
```

#### 5. Download PDF Button

```typescript
<Button 
  variant="default" 
  size="sm" 
  className="gap-2 bg-blue-600 hover:bg-blue-700"
  onClick={handleDownloadPDF}
  disabled={isDownloading}
>
  <Download className="w-4 h-4" />
  {isDownloading ? 'Generating...' : 'Download PDF'}
</Button>
```

---

## Configuration

### Required Webhook Response Format

Your webhook should return JSON in this format:

```json
[
  {
    "webReport": "<h2>Market Overview</h2>\n<p>The U.S. healthcare sector is undergoing...</p>\n<h2>Market Size and Growth Outlook</h2>\n<p>While the full scope...</p>",
    "emailReport": "<strong>Market Overview</strong><br><br>The U.S. healthcare sector..."
  }
]
```

**Important:**
- Must be an array with at least one object
- `webReport` field contains HTML content
- HTML can include: `<h2>`, `<h3>`, `<p>`, `<ul>`, `<li>`, `<a>`, `<strong>`, etc.

### localStorage Keys

```typescript
// Storing webhook response
localStorage.setItem('latestWebhookReport', JSON.stringify(data))

// Retrieving webhook response
const data = JSON.parse(localStorage.getItem('latestWebhookReport'))
```

---

## Styling Reference

### Tailwind Prose Classes Used

```css
.prose                          /* Base prose styling */
.prose-sm                       /* Smaller text size */
.max-w-none                    /* Remove max-width constraint */
.prose-headings:text-gray-900  /* Dark headings */
.prose-headings:font-bold      /* Bold headings */
.prose-h2:text-2xl            /* Large h2 headings */
.prose-h2:mt-8                /* Top margin */
.prose-h2:mb-4                /* Bottom margin */
.prose-h2:pb-2                /* Bottom padding */
.prose-h2:border-b            /* Bottom border */
.prose-h2:border-gray-200     /* Border color */
.prose-h3:text-xl             /* Medium h3 headings */
.prose-h3:mt-6                /* Top margin */
.prose-h3:mb-3                /* Bottom margin */
.prose-p:text-gray-700        /* Paragraph color */
.prose-p:leading-relaxed      /* Line height */
.prose-p:mb-4                 /* Bottom margin */
.prose-a:text-blue-600        /* Link color */
.prose-a:no-underline         /* No underline default */
.hover:prose-a:underline      /* Underline on hover */
.prose-ul:my-4                /* List margin */
.prose-ul:space-y-2           /* List item spacing */
.prose-li:text-gray-700       /* List item color */
.prose-strong:text-gray-900   /* Bold text color */
.prose-strong:font-semibold   /* Bold weight */
```

---

## Troubleshooting

### PDF Generation Issues

**Problem:** PDF is blank
```typescript
// Solution: Ensure element exists
const element = document.getElementById('report-content')
if (!element) {
  console.error('Report content element not found')
  return
}
```

**Problem:** PDF text is blurry
```typescript
// Solution: Increase scale (already set to 2)
const canvas = await html2canvas(reportElement, {
  scale: 2, // Increase to 3 for even higher quality
  // ...
})
```

**Problem:** Images not showing in PDF
```typescript
// Solution: Enable CORS (already enabled)
const canvas = await html2canvas(reportElement, {
  useCORS: true, // Allow cross-origin images
  // ...
})
```

### Webhook Data Issues

**Problem:** Report not displaying
```typescript
// Debug: Check localStorage
console.log('Stored data:', 
  localStorage.getItem('latestWebhookReport')
)

// Debug: Check webhook response
console.log('Webhook response:', webhookResponseData)
```

**Problem:** XSS warning with dangerouslySetInnerHTML
```typescript
// Solution: Sanitize HTML (optional, not implemented)
import DOMPurify from 'dompurify'

const cleanHTML = DOMPurify.sanitize(webhookData[0].webReport)
<div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
```

---

## Testing Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

---

## Browser DevTools Testing

### Check localStorage
```javascript
// In browser console
localStorage.getItem('latestWebhookReport')

// Parse and view
JSON.parse(localStorage.getItem('latestWebhookReport'))

// Clear if needed
localStorage.removeItem('latestWebhookReport')
```

### Test PDF Generation
```javascript
// Get report element
const element = document.getElementById('report-content')
console.log('Element found:', !!element)

// Check dimensions
console.log('Width:', element.offsetWidth)
console.log('Height:', element.offsetHeight)
```

---

## Performance Optimization Tips

1. **Large Reports**: Add loading indicator for PDF generation
2. **Images**: Compress images before including in HTML
3. **localStorage**: Clear old reports periodically
4. **Memory**: Consider pagination for very long reports

---

## Security Best Practices

1. **Validate Webhook Source**: Ensure webhook URLs are trusted
2. **Sanitize HTML**: Consider using DOMPurify for user-generated content
3. **HTTPS Only**: Always use HTTPS for webhook endpoints
4. **Rate Limiting**: Implement rate limits on webhook endpoints
5. **Input Validation**: Validate all form inputs before submission

---

**Questions or Issues?** Check the full documentation in `REPORT_VIEWER_FEATURES.md`

