# Report Viewer Features Documentation

## Overview
Enhanced market research report display with webhook data integration and PDF export functionality.

## New Features

### 1. **Webhook Response Display**
When you submit a market research request through the "New Research" form, the system now:
- Captures the webhook response data containing the `webReport` HTML content
- Stores it in browser localStorage for persistence
- Automatically redirects to the report viewer page after successful submission

### 2. **Beautiful Report Rendering**
The webhook's `webReport` HTML content is displayed with:
- Professional typography using Tailwind CSS prose classes
- Proper spacing and readability
- Color-coded links (blue with hover effects)
- Styled headings with borders and hierarchy
- Clean bullet points and lists
- Semantic HTML rendering with `dangerouslySetInnerHTML`

### 3. **PDF Download Functionality**
Users can download the full report as a PDF:
- Click the "Download PDF" button in the header
- The system uses `html2canvas` to convert the report to images
- `jsPDF` assembles the images into a multi-page PDF
- Handles reports of any length with automatic pagination
- Downloads with a timestamped filename: `Market_Research_Report_YYYY-MM-DD.pdf`

### 4. **Enhanced User Experience**
- **Loading State**: Shows "Processing..." with animated spinner while submitting
- **Success Notification**: Custom toast message "The Report has been sent to your email"
- **Email Badge**: Green badge indicator showing report was sent to email
- **Auto-redirect**: Automatically navigates to report page after 2 seconds
- **Form Reset**: Clears form after successful submission

## Technical Implementation

### Files Modified

#### 1. `app/dashboard/reports/[id]/page.tsx`
- Added `jsPDF` and `html2canvas` imports
- Created `getWebhookReport()` function to retrieve stored webhook data
- Added `handleDownloadPDF()` function for PDF generation
- Enhanced UI to display webhook HTML content
- Added "Sent to Email" badge when webhook data exists
- Wrapped report content in `#report-content` div for PDF export

#### 2. `app/dashboard/new-research/page.tsx`
- Added `useRouter` for navigation
- Enhanced `handleSubmit()` to capture webhook response JSON
- Store webhook data in localStorage
- Updated success notification message
- Added auto-redirect to report page
- Enhanced submit button with loading spinner

### Dependencies Added
```json
{
  "jspdf": "^2.x.x",
  "html2canvas": "^1.x.x"
}
```

## User Flow

1. **User fills out the "Create New Market Research" form**
   - Selects market category, sub-niche, geography
   - Chooses research type (On-demand or Recurring)
   - Adds optional notes

2. **User clicks "Submit Research Request"**
   - Button shows "Processing..." with spinner
   - Form data sent to configured webhook(s)

3. **Webhook responds with data**
   ```json
   [
     {
       "webReport": "<h2>Market Overview</h2><p>...</p>",
       "emailReport": "..."
     }
   ]
   ```

4. **Success notification appears**
   - Toast: "Research request submitted successfully!"
   - Description: "The Report has been sent to your email"

5. **Auto-redirect to report page**
   - After 2 seconds, user navigated to `/dashboard/reports/1`
   - Report displays webhook HTML content beautifully formatted

6. **User can download as PDF**
   - Click "Download PDF" button
   - PDF generated and downloaded automatically

## Styling Details

### Report Content Styling
The `webReport` HTML is styled with Tailwind's prose classes:
```css
prose prose-sm max-w-none
prose-headings:text-gray-900 prose-headings:font-bold
prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 
prose-h2:border-b prose-h2:border-gray-200
prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
prose-ul:my-4 prose-ul:space-y-2
prose-li:text-gray-700
prose-strong:text-gray-900 prose-strong:font-semibold
```

This ensures:
- Consistent typography
- Proper spacing and readability
- Professional appearance
- Good print/PDF rendering

## PDF Generation Details

### How it Works
1. The entire report content is wrapped in a `div#report-content`
2. `html2canvas` converts the div to a high-resolution canvas (scale: 2)
3. Canvas is converted to PNG image data
4. `jsPDF` creates an A4 PDF document
5. Image is added to PDF, with automatic pagination for long reports
6. PDF is downloaded to user's device

### Configuration
- **PDF Size**: A4 (210mm x 297mm)
- **Orientation**: Portrait
- **Image Quality**: 2x scaling for crisp text
- **Background**: White (#ffffff)

## Testing

### Mock Webhook Response
To test the feature, configure a webhook that returns:
```json
[
  {
    "webReport": "<h2>Market Overview</h2>\n<p>The U.S. healthcare sector...</p>\n<h2>Market Size</h2>\n<p>...</p>",
    "emailReport": "<strong>Market Overview</strong><br><br>..."
  }
]
```

### What to Test
1. ✅ Form submission shows loading state
2. ✅ Success notification displays correct message
3. ✅ Auto-redirect to report page works
4. ✅ Webhook HTML content displays properly
5. ✅ "Sent to Email" badge appears
6. ✅ PDF download generates correctly
7. ✅ PDF contains all report content
8. ✅ Links are clickable in the web view

## Future Enhancements

### Potential Improvements
1. **Email Integration**: Add actual email sending functionality
2. **Report History**: Store multiple reports in database
3. **Custom Branding**: Add logo and company branding to PDFs
4. **Share Functionality**: Implement share button to email/link sharing
5. **Report Templates**: Different layouts for different report types
6. **Data Visualization**: Add charts and graphs to reports
7. **Export Formats**: Add Word/Excel export options
8. **Print Optimization**: Better print stylesheet for direct printing

## Troubleshooting

### Issue: PDF is blank or incomplete
- **Cause**: Report content not fully loaded
- **Solution**: Add loading delay before PDF generation

### Issue: Webhook data not displaying
- **Cause**: localStorage not persisted or invalid JSON
- **Solution**: Check browser console for errors, verify webhook response format

### Issue: Images not appearing in PDF
- **Cause**: CORS restrictions on external images
- **Solution**: Use `useCORS: true` option (already implemented)

### Issue: PDF text is blurry
- **Cause**: Low canvas resolution
- **Solution**: Increase `scale` parameter (currently set to 2)

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

### Requirements
- JavaScript enabled
- localStorage available
- Canvas API support
- File download capability

## Security Considerations

1. **XSS Protection**: Be cautious with `dangerouslySetInnerHTML`
   - Only use with trusted webhook sources
   - Consider sanitizing HTML with DOMPurify library

2. **Data Privacy**: Webhook data stored in localStorage
   - Cleared when user logs out (implement if not present)
   - Not shared across domains

3. **HTTPS**: Ensure all webhook URLs use HTTPS for secure data transmission

## Performance Notes

- **PDF Generation Time**: 2-5 seconds for typical reports
- **Memory Usage**: Proportional to report length
- **localStorage Limit**: 5-10MB (sufficient for most reports)
- **Optimization**: Consider compressing stored data for large reports

---

**Last Updated**: January 2026  
**Version**: 1.0.0

