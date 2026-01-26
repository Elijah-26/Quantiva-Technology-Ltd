# Legal Pages Setup Guide

## Files Created

I've created two professional legal pages for your Quantiva platform:

### 1. Terms of Service
**File:** `app/terms/page.tsx`  
**URL:** https://quantiva.world/terms

### 2. Privacy Policy
**File:** `app/privacy/page.tsx`  
**URL:** https://quantiva.world/privacy

---

## What's Included

### Terms of Service Covers:
- ✅ Acceptance of Terms
- ✅ Description of Service
- ✅ User Accounts & Responsibilities
- ✅ Acceptable Use Policy
- ✅ Intellectual Property Rights
- ✅ Disclaimer of Warranties
- ✅ Limitation of Liability
- ✅ Indemnification
- ✅ Termination Rights
- ✅ Changes to Terms
- ✅ Governing Law
- ✅ Contact Information

### Privacy Policy Covers:
- ✅ Introduction & Scope
- ✅ Information Collection (Personal, Usage, Cookies)
- ✅ How We Use Information
- ✅ Data Storage & Security
- ✅ Data Sharing & Disclosure
- ✅ Data Retention
- ✅ User Rights (GDPR-compliant)
- ✅ Third-Party Services
- ✅ Children's Privacy
- ✅ International Data Transfers
- ✅ Policy Updates
- ✅ Contact Information

---

## Adding Footer Links

### Option 1: Update Your Landing Page Footer

Add this HTML to your landing page footer:

```html
<footer class="bg-gray-900 text-white py-8">
  <div class="container mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <!-- Your existing footer content -->
      <div class="text-center md:text-left mb-4 md:mb-0">
        <p>&copy; 2026 Quantiva. All rights reserved.</p>
      </div>
      
      <!-- Legal Links -->
      <div class="flex gap-6">
        <a href="/terms" class="hover:text-blue-400 transition-colors">
          Terms of Service
        </a>
        <a href="/privacy" class="hover:text-blue-400 transition-colors">
          Privacy Policy
        </a>
      </div>
    </div>
  </div>
</footer>
```

### Option 2: Minimal Footer Links

```html
<div class="text-center text-sm text-gray-600 py-4">
  <a href="/terms" class="hover:underline">Terms</a>
  <span class="mx-2">•</span>
  <a href="/privacy" class="hover:underline">Privacy</a>
</div>
```

### Option 3: For Next.js/React (if your landing page is React-based)

```tsx
<footer className="bg-gray-900 text-white py-8">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm">&copy; 2026 Quantiva. All rights reserved.</p>
      <div className="flex gap-6 mt-4 md:mt-0">
        <Link href="/terms" className="text-sm hover:text-blue-400 transition-colors">
          Terms of Service
        </Link>
        <Link href="/privacy" className="text-sm hover:text-blue-400 transition-colors">
          Privacy Policy
        </Link>
      </div>
    </div>
  </div>
</footer>
```

---

## Styling Features

Both pages include:
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Professional Styling**: Clean, readable typography
- ✅ **Consistent Branding**: Matches your Quantiva color scheme
- ✅ **Easy Navigation**: Back to home button
- ✅ **Accessibility**: Proper heading hierarchy and contrast
- ✅ **Print-Friendly**: Good for when users want to print

---

## Testing the Pages

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the pages:**
   - http://localhost:3000/terms
   - http://localhost:3000/privacy

3. **Test on mobile:**
   - Use Chrome DevTools (F12 → Toggle Device Toolbar)
   - Test on actual mobile devices

---

## Deployment

Once you're satisfied with the pages:

```bash
# Build for production
npm run build

# Deploy (if using Vercel)
vercel --prod

# Or push to GitHub (if auto-deployed)
git add app/terms app/privacy
git commit -m "Add Terms of Service and Privacy Policy pages"
git push
```

The pages will be automatically available at:
- https://quantiva.world/terms
- https://quantiva.world/privacy

---

## Customization

### Update Contact Email
Both pages use placeholder emails. Replace these in the files:
- `support@quantiva.world`
- `privacy@quantiva.world`

With your actual support email address.

### Update Company Information
If you need to add:
- Physical address
- Phone number
- Additional legal entity information

Edit the "Contact Information" section in both files.

### Change Last Updated Date
The pages show "Last Updated: January 26, 2026". Update this whenever you make changes.

---

## Legal Disclaimer

⚠️ **Important:** These are general templates suitable for most SaaS services. However, you should:

1. **Review with a lawyer** - Every business is unique, and these templates may not cover all your specific needs
2. **Update regularly** - As your service evolves, update these policies
3. **Comply with local laws** - Ensure compliance with GDPR (EU), CCPA (California), and other applicable regulations
4. **Keep records** - Maintain dated versions of policy changes

---

## Additional Recommendations

### 1. Cookie Consent Banner
Consider adding a cookie consent banner to your site:

```tsx
// components/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          {' '}
          <a href="/privacy" className="underline">Learn more</a>
        </p>
        <Button onClick={acceptCookies} size="sm">
          Accept
        </Button>
      </div>
    </div>
  )
}
```

### 2. Add to Layout
Add the cookie consent to your root layout:

```tsx
// app/layout.tsx
import { CookieConsent } from '@/components/CookieConsent'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}
```

### 3. Link from Login/Signup
Add links to these pages on your authentication screens:

```tsx
<div className="text-xs text-center text-gray-600 mt-4">
  By signing up, you agree to our{' '}
  <Link href="/terms" className="text-blue-600 hover:underline">
    Terms of Service
  </Link>
  {' '}and{' '}
  <Link href="/privacy" className="text-blue-600 hover:underline">
    Privacy Policy
  </Link>
</div>
```

---

## Support

If you need to customize these pages further or have questions:
1. Edit the `.tsx` files directly
2. The pages use Tailwind CSS for styling
3. All content is in plain English, easy to modify

**Status:** ✅ Ready to deploy
**Last Updated:** January 26, 2026

