# Authentication System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         QUANTIVA AUTHENTICATION SYSTEM              │
│                                                                     │
│  Frontend (Next.js)              Supabase                Email      │
│  ─────────────────              ────────                 ─────      │
│                                                                     │
│  ┌──────────────┐              ┌──────────┐           ┌─────────┐ │
│  │ Login Page   │──────────────▶│   Auth   │──────────▶│  Email  │ │
│  │              │              │  Service  │           │ Service │ │
│  │ • Sign In    │◀──────────────│          │◀──────────│         │ │
│  │ • Forgot PW  │              │ • Create │           │ • Send  │ │
│  └──────────────┘              │ • Verify │           │ • Track │ │
│                                │ • Update │           │ • Retry │ │
│  ┌──────────────┐              └──────────┘           └─────────┘ │
│  │ Reset Page   │                    │                             │
│  │              │                    │                             │
│  │ • Validate   │              ┌──────────┐                        │
│  │ • Set New PW │              │ Database │                        │
│  └──────────────┘              │          │                        │
│                                │ • Users  │                        │
│  ┌──────────────┐              │ • Tokens │                        │
│  │ Confirm Page │              │ • Audit  │                        │
│  │              │              └──────────┘                        │
│  │ • Auto-Check │                                                  │
│  │ • Redirect   │                                                  │
│  └──────────────┘                                                  │
│                                                                     │
│  ┌──────────────┐                                                  │
│  │ Dashboard    │                                                  │
│  │              │                                                  │
│  │ Profile Dialog:                                                 │
│  │ • Profile Tab                                                   │
│  │ • Security Tab                                                  │
│  │ • Email Tab                                                     │
│  └──────────────┘                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Journey Map

### Journey 1: New User Registration
```
START
  ↓
[Signup Page]
  ↓ (submits form)
[Supabase Auth]
  ↓ (creates account)
[Email Service] → ✉️ Confirmation Email
  ↓ (user clicks link)
[/auth/confirm-email]
  ↓ (validates token)
[Dashboard] ✅
  END
```

### Journey 2: Forgot Password
```
START (user on login)
  ↓
[Clicks "Forgot Password?"]
  ↓
[Dialog Opens]
  ↓ (enters email)
[Supabase Auth]
  ↓
[Email Service] → ✉️ Reset Link
  ↓ (user clicks link)
[/auth/reset-password]
  ↓ (enters new password)
[Supabase Auth] → Updates password
  ↓
[/login] → "Password reset successful"
  ↓ (user signs in)
[Dashboard] ✅
  END
```

### Journey 3: Change Password (Logged In)
```
START (user in dashboard)
  ↓
[Clicks Avatar]
  ↓
[Selects "My Profile"]
  ↓
[Switches to "Security" tab]
  ↓ (enters new password)
[Supabase Auth] → Updates password
  ├─→ Success Toast ✅
  └─→ [Email Service] → 🔔 Security Alert Email
  END (stays on page)
```

### Journey 4: Change Email
```
START (user in dashboard)
  ↓
[Clicks Avatar]
  ↓
[Selects "My Profile"]
  ↓
[Switches to "Email" tab]
  ↓ (enters new email)
[Supabase Auth]
  ↓
[Email Service] → ✉️ Confirmation to OLD email
                → ✉️ Confirmation to NEW email
  ↓ (user clicks link in NEW email)
[/auth/confirm-email]
  ↓ (validates token)
[Supabase Auth] → Updates email
  ├─→ [Dashboard] ✅
  └─→ [Email Service] → 🔔 Security Alert to BOTH
  END
```

---

## 📦 Component Structure

```
app/
├── auth/
│   ├── reset-password/
│   │   └── page.tsx          [Password Reset Page]
│   │       ├── Session validation
│   │       ├── Password strength checker
│   │       ├── Visual feedback (✓)
│   │       └── Suspense boundary
│   │
│   └── confirm-email/
│       └── page.tsx          [Email Confirmation Page]
│           ├── Auto-validation
│           ├── Success/error states
│           └── Suspense boundary
│
├── login/
│   └── page.tsx              [Login Page]
│       ├── Sign in form
│       ├── Forgot password dialog
│       └── Email validation
│
└── dashboard/
    └── layout.tsx            [Dashboard Layout]
        └── Profile Dialog (3 tabs)
            ├── Profile Tab   [Edit name/company]
            ├── Security Tab  [Change password]
            └── Email Tab     [Change email]
```

---

## 🔐 Security Flow

```
User Action
    ↓
┌─────────────────────────┐
│ Frontend Validation     │
│ • Email format          │
│ • Password strength     │
│ • Required fields       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Supabase Auth Service   │
│ • Rate limiting         │
│ • Token generation      │
│ • Session management    │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Database Operations     │
│ • Create/update user    │
│ • Store hashed password │
│ • Log audit trail       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Email Service           │
│ • Send confirmation     │
│ • Track delivery        │
│ • Handle bounces        │
└─────────────────────────┘
    ↓
User receives email
    ↓
Clicks link
    ↓
┌─────────────────────────┐
│ Token Validation        │
│ • Check expiry          │
│ • Verify signature      │
│ • One-time use check    │
└─────────────────────────┘
    ↓
Action Completed ✅
    ↓
┌─────────────────────────┐
│ Security Notifications  │
│ • Alert user of change  │
│ • Log security event    │
└─────────────────────────┘
```

---

## 📧 Email Flow Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    EMAIL SYSTEM FLOW                     │
└──────────────────────────────────────────────────────────┘

User Action
    ↓
┌─────────────────┐
│ Supabase Auth   │
│ Triggers Email  │
└─────────────────┘
    ↓
┌─────────────────────────────────┐
│ Email Template Selection        │
│                                 │
│ Types:                          │
│ 1. Confirm Signup               │
│ 2. Reset Password               │
│ 3. Change Email (Confirmation)  │
│ 4. Password Changed (Alert) 🔔  │
│ 5. Email Changed (Alert) 🔔     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Variable Substitution           │
│                                 │
│ {{ .Email }}                    │
│ {{ .ConfirmationURL }}          │
│ {{ .SiteURL }}                  │
│ {{ .Token }}                    │
│ {{ .NewEmail }}                 │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Email Delivery                  │
│                                 │
│ Supabase SMTP → User's Inbox   │
│                                 │
│ (Or custom SMTP like SendGrid)  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ User Action                     │
│                                 │
│ • Opens email                   │
│ • Clicks link                   │
│ • Lands on Quantiva page        │
└─────────────────────────────────┘
```

---

## 🎯 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION STATE                     │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐
│ Initial Load     │
│ • Check session  │
│ • Get user data  │
└──────────────────┘
        ↓
┌──────────────────┐       ┌──────────────────┐
│ Authenticated    │       │ Not Authenticated│
│ • Load profile   │       │ • Show login     │
│ • Enable actions │       │ • Public pages   │
└──────────────────┘       └──────────────────┘
        ↓                           ↓
┌──────────────────┐       ┌──────────────────┐
│ User Actions     │       │ Auth Actions     │
│ • Update profile │       │ • Sign up        │
│ • Change password│       │ • Sign in        │
│ • Change email   │       │ • Reset password │
└──────────────────┘       └──────────────────┘
        ↓                           ↓
┌──────────────────┐       ┌──────────────────┐
│ State Updates    │       │ Create Session   │
│ • Local state    │       │ • Store token    │
│ • Context update │       │ • Redirect       │
│ • UI refresh     │       └──────────────────┘
└──────────────────┘                ↓
        ↓                    ┌──────────────────┐
┌──────────────────┐        │ Authenticated    │
│ Success Feedback │        │ State            │
│ • Toast          │◄───────┘                  │
│ • Email alert    │                            │
└──────────────────┘                            
```

---

## 🔄 Session & Token Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│              TOKEN & SESSION LIFECYCLE                  │
└─────────────────────────────────────────────────────────┘

ACTION TRIGGERED
    ↓
┌──────────────────┐
│ Token Created    │
│ • Unique ID      │
│ • Timestamp      │
│ • User ID        │
│ • Type (reset/   │
│   confirm/etc)   │
│ • Expiry time    │
└──────────────────┘
    ↓
┌──────────────────┐
│ Token Sent       │
│ • Via email      │
│ • In URL         │
│ • Encrypted      │
└──────────────────┘
    ↓
┌──────────────────────────────┐
│ Time Window                  │
│                              │
│ Reset PW: 1 hour             │
│ Confirm Email: 24 hours      │
│                              │
│ ⏰ Countdown starts...       │
└──────────────────────────────┘
    ↓
┌──────────────────┐
│ User Clicks Link │
└──────────────────┘
    ↓
┌──────────────────────────────┐
│ Validation Checks            │
│                              │
│ ✓ Token exists?              │
│ ✓ Not expired?               │
│ ✓ Not used before?           │
│ ✓ Valid signature?           │
│ ✓ Correct user?              │
└──────────────────────────────┘
    ↓
┌──────────────────┐     ┌──────────────────┐
│ VALID ✅         │     │ INVALID ❌       │
│ • Create session │     │ • Show error     │
│ • Mark token used│     │ • Offer retry    │
│ • Perform action │     │ • Redirect       │
└──────────────────┘     └──────────────────┘
    ↓                           ↓
┌──────────────────┐     ┌──────────────────┐
│ Session Active   │     │ Request New Token│
│ • Access granted │     └──────────────────┘
│ • Token expired  │
└──────────────────┘
```

---

## 🛡️ Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY ARCHITECTURE                 │
└─────────────────────────────────────────────────────────┘

Layer 1: Frontend Validation
├─ Email format validation
├─ Password strength checking
├─ Required field validation
└─ Real-time feedback

Layer 2: Transport Security
├─ HTTPS only
├─ Secure cookies
├─ CORS protection
└─ CSRF tokens

Layer 3: Supabase Auth
├─ Rate limiting (prevents brute force)
├─ Token-based authentication
├─ Session management
├─ Password hashing (bcrypt)
└─ Row Level Security (RLS)

Layer 4: Database
├─ Encrypted at rest
├─ Audit logging
├─ Row-level policies
└─ Secure backups

Layer 5: Email Security
├─ Token expiry
├─ One-time use links
├─ Signed URLs
└─ SPF/DKIM verification

Layer 6: Monitoring
├─ Failed login attempts
├─ Suspicious activity detection
├─ Alert system
└─ Audit trail
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      DATA FLOW                          │
└─────────────────────────────────────────────────────────┘

User Input
    ↓
┌──────────────────┐
│ React Component  │ ◄──── State Management
│ (Form/Dialog)    │       (useState, Context)
└──────────────────┘
    ↓
┌──────────────────┐
│ Client Validation│ ◄──── Validation Rules
└──────────────────┘
    ↓
┌──────────────────┐
│ Supabase Client  │ ◄──── SDK Methods
│ (Browser)        │       (auth.signIn, etc)
└──────────────────┘
    ↓
┌──────────────────┐
│ API Request      │ ◄──── HTTPS
│ (Authenticated)  │       (JWT Token)
└──────────────────┘
    ↓
┌──────────────────┐
│ Supabase Server  │ ◄──── Auth Service
│ (Backend)        │       Rate Limiting
└──────────────────┘
    ↓
┌──────────────────┐
│ Database Write   │ ◄──── RLS Policies
│ (PostgreSQL)     │       Triggers
└──────────────────┘
    ↓
┌──────────────────┐
│ Email Trigger    │ ◄──── Template Engine
│ (If applicable)  │       Variable Substitution
└──────────────────┘
    ↓
┌──────────────────┐
│ Response         │ ◄──── Success/Error
│ (JSON)           │       Status Codes
└──────────────────┘
    ↓
┌──────────────────┐
│ UI Update        │ ◄──── Toast Notification
│ (React)          │       State Refresh
└──────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
DashboardLayout (app/dashboard/layout.tsx)
│
├── Sidebar (Desktop)
│   ├── Logo
│   ├── Navigation Links
│   └── User Profile Button
│       └── → Opens Profile Dialog
│
├── Mobile Menu (Sheet)
│   ├── Logo
│   ├── Navigation Links
│   └── User Profile Button
│       └── → Opens Profile Dialog
│
├── Top Bar
│   ├── Hamburger Menu (Mobile)
│   ├── Page Title
│   └── User Dropdown
│       ├── Profile Info Display
│       ├── "My Profile" MenuItem → Opens Dialog
│       └── "Logout" MenuItem
│
├── Profile Dialog (Modal)
│   │
│   ├── Tab Bar
│   │   ├── Profile Tab
│   │   ├── Security Tab
│   │   └── Email Tab
│   │
│   ├── Profile Tab Content
│   │   ├── Avatar Display
│   │   ├── Email (Read-only)
│   │   ├── Full Name Input
│   │   ├── Company Input
│   │   ├── Account Info Display
│   │   └── Save Button
│   │
│   ├── Security Tab Content
│   │   ├── Password Requirements Info
│   │   ├── New Password Input
│   │   │   └── Show/Hide Toggle
│   │   ├── Confirm Password Input
│   │   │   └── Show/Hide Toggle
│   │   ├── Validation Feedback
│   │   └── Change Password Button
│   │
│   └── Email Tab Content
│       ├── Process Info Box
│       ├── Current Email (Read-only)
│       ├── New Email Input
│       └── Send Confirmation Button
│
└── Page Content (children)

LoginPage (app/login/page.tsx)
│
├── Header
│   ├── Logo
│   └── Back to Home Link
│
├── Login Card
│   ├── Title & Description
│   ├── Success Message (if any)
│   ├── Error Message (if any)
│   ├── Login Form
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Forgot Password Link → Opens Dialog
│   │   ├── Remember Me Checkbox
│   │   └── Sign In Button
│   └── Sign Up Link
│
└── Forgot Password Dialog
    ├── Title & Description
    ├── Email Input
    ├── Expiry Info Box
    └── Action Buttons
        ├── Cancel
        └── Send Reset Link

ResetPasswordPage (app/auth/reset-password/page.tsx)
│
├── Header
│   ├── Logo
│   └── Back to Login Link
│
└── Reset Card
    ├── Title & Description
    ├── Session Validation Spinner (if validating)
    ├── Reset Form
    │   ├── New Password Input
    │   │   └── Show/Hide Toggle
    │   ├── Confirm Password Input
    │   │   └── Show/Hide Toggle
    │   ├── Requirements Box
    │   │   ├── Length Check (✓/✗)
    │   │   ├── Uppercase Check (✓/✗)
    │   │   ├── Lowercase Check (✓/✗)
    │   │   ├── Number Check (✓/✗)
    │   │   └── Match Check (✓/✗)
    │   └── Reset Button
    └── Sign In Link

ConfirmEmailPage (app/auth/confirm-email/page.tsx)
│
├── Header
│   └── Logo
│
└── Confirmation Card
    ├── Title & Description
    └── Status Display
        ├── Loading State
        │   ├── Spinner
        │   └── "Validating..." message
        ├── Success State
        │   ├── Success Icon (✓)
        │   ├── Success Message
        │   └── Go to Dashboard Button
        └── Error State
            ├── Error Icon (✗)
            ├── Error Message
            └── Action Buttons
                ├── Back to Login
                └── Sign Up Again
```

---

**System Architecture Version**: 1.0.0  
**Last Updated**: January 25, 2026  
**Status**: Production Ready ✅
