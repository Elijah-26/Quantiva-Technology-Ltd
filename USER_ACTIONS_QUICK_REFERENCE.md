# Quick Reference - User Actions & Triggers

## 🎯 How Users Trigger Each Action

### 1. **Forgot Password** (Not logged in)
**User Action**: Click "Forgot password?" on login page  
**Result**: Dialog opens → Enter email → Receive reset link  
**Email Sent**: Password reset link (expires in 1 hour)  
**Lands On**: `/auth/reset-password` after clicking email link

---

### 2. **Email Confirmation** (After signup or email change)
**User Action**: Click link in confirmation email  
**Result**: Auto-validates → Redirects to dashboard  
**Email Sent**: Confirmation link (expires in 24 hours)  
**Lands On**: `/auth/confirm-email` → then `/dashboard`

---

### 3. **Change Password** (Logged in)
**Path**: Avatar (top right) → "My Profile" → "Security" tab  
**User Action**: 
1. Click avatar dropdown
2. Select "My Profile"
3. Switch to "Security" tab
4. Enter new password twice
5. Click "Change Password"

**Result**: Password updated + success notification  
**Email Sent**: 🔔 **Automatic** "Password Changed" notification by Supabase  
**Stays On**: Same page (dialog remains open)

---

### 4. **Change Email** (Logged in)
**Path**: Avatar (top right) → "My Profile" → "Email" tab  
**User Action**:
1. Click avatar dropdown
2. Select "My Profile"
3. Switch to "Email" tab
4. Enter new email address
5. Click "Send Confirmation"

**Result**: Confirmation emails sent to both addresses  
**Emails Sent**: 
- Confirmation link to NEW email
- Notification to OLD email
- 🔔 **Automatic** "Email Changed" notification after confirmation

**Next Step**: User clicks link in email → lands on `/auth/confirm-email`

---

### 5. **Update Profile Info** (Logged in)
**Path**: Avatar (top right) → "My Profile" → "Profile" tab  
**User Action**:
1. Click avatar dropdown
2. Select "My Profile"
3. Edit full name and/or company name
4. Click "Save Changes"

**Result**: Profile updated + success notification  
**Email Sent**: None  
**Stays On**: Same page (dialog remains open)

---

### 6. **Invite User** (Admin only)
**Path**: Dashboard → Settings (sidebar)  
**User Action**:
1. Navigate to Settings page (admin only)
2. Click "Add User" button
3. Fill in email, password, name, role
4. Click "Create User"

**Result**: New user account created  
**Email Sent**: 🔔 Signup confirmation email to new user  
**Note**: New user must confirm email to activate account

---

## 📧 Email Notifications Summary

| Action | Email Type | Sent To | Automatic? |
|--------|-----------|---------|------------|
| **Signup** | Confirmation link | New user | ✅ Yes |
| **Forgot Password** | Reset link | User's email | ✅ Yes |
| **Password Changed** | Security alert | User's email | 🔔 Automatic |
| **Email Change Request** | Confirmation link | Both old & new | ✅ Yes |
| **Email Changed** | Security alert | Both addresses | 🔔 Automatic |
| **User Invited** | Signup confirmation | New user | ✅ Yes |

**Legend**:
- ✅ Yes = Triggered by user action
- 🔔 Automatic = Sent by Supabase automatically after successful change

---

## 🔑 Access Points in UI

### **Login Page** (`/login`)
```
┌─────────────────────────────────────┐
│  Email: [___________________]       │
│  Password: [___________________]    │
│           [Forgot password?] ←────  │ Triggers password reset
│                                     │
│  [ Sign In ]                        │
│  Don't have account? [Sign up]     │
└─────────────────────────────────────┘
```

### **Dashboard Header** (All pages when logged in)
```
┌─────────────────────────────────────┐
│  Dashboard          [Avatar ▼] ←────│ Click here
│                                     │
│  Dropdown:                          │
│  ┌─────────────────────┐           │
│  │ 👤 My Profile   ←────│────────  │ Opens profile dialog
│  │ ───────────────     │           │
│  │ 🚪 Logout           │           │
│  └─────────────────────┘           │
└─────────────────────────────────────┘
```

### **Profile Dialog** (After clicking "My Profile")
```
┌─────────────────────────────────────┐
│  Account Settings               [×] │
│                                     │
│  [ Profile | Security | Email ]     │ ← Three tabs
│   ↓         ↓          ↓            │
│   Edit      Change     Change       │
│   Info      Password   Email        │
└─────────────────────────────────────┘
```

### **Settings Page** (Admin only - sidebar)
```
Dashboard Sidebar:
┌─────────────────┐
│ 🏠 Dashboard    │
│ 🔍 New Research │
│ 📄 Reports      │
│ 📅 Schedules    │
│ ⚙️  Settings ←──│ Admin only - User management
└─────────────────┘
```

---

## 🎬 User Flows

### **Flow 1: New User Signs Up**
```
1. User clicks "Sign up" on login page
2. Fills registration form
3. Submits form
   ↓
4. Account created
5. Confirmation email sent ✉️
6. User clicks link in email
   ↓
7. Lands on /auth/confirm-email
8. Auto-validates
9. Redirects to /dashboard ✅
```

### **Flow 2: User Forgets Password**
```
1. User on login page
2. Clicks "Forgot password?"
3. Dialog opens
4. Enters email
5. Clicks "Send Reset Link"
   ↓
6. Reset email sent ✉️
7. User clicks link in email
   ↓
8. Lands on /auth/reset-password
9. Enters new password (with validation)
10. Submits
    ↓
11. Password updated
12. Redirected to /login ✅
13. Signs in with new password
```

### **Flow 3: User Changes Password (Logged In)**
```
1. User clicks avatar
2. Selects "My Profile"
3. Switches to "Security" tab
4. Enters new password twice
5. Clicks "Change Password"
   ↓
6. Password updated ✅
7. Success notification shown
8. Security alert email sent 🔔
```

### **Flow 4: User Changes Email**
```
1. User clicks avatar
2. Selects "My Profile"
3. Switches to "Email" tab
4. Enters new email
5. Clicks "Send Confirmation"
   ↓
6. Confirmation emails sent ✉️ (to both)
7. User checks NEW email
8. Clicks confirmation link
   ↓
9. Lands on /auth/confirm-email
10. Auto-validates
11. Email updated ✅
12. Redirected to /dashboard
13. Security alerts sent 🔔 (to both)
```

### **Flow 5: Admin Invites User**
```
1. Admin navigates to Settings
2. Clicks "Add User"
3. Fills form (email, password, etc.)
4. Clicks "Create User"
   ↓
5. Account created
6. Confirmation email sent ✉️ to new user
7. New user clicks link
   ↓
8. Lands on /auth/confirm-email
9. Auto-validates
10. Account activated ✅
11. Can now login
```

---

## 🔒 Security Features by Action

| Action | Security Features |
|--------|-------------------|
| **Forgot Password** | • Link expires in 1 hour<br>• Single-use token<br>• Session validation |
| **Email Confirmation** | • Link expires in 24 hours<br>• Single-use token<br>• Auto-validation |
| **Change Password** | • 8+ characters required<br>• Uppercase/lowercase/number<br>• Real-time validation<br>• Security alert email |
| **Change Email** | • Double confirmation (both emails)<br>• Secure token<br>• Security alert emails<br>• 24-hour expiry |
| **Profile Update** | • Requires active session<br>• Validates input<br>• Role-based access |

---

## 💡 Quick Tips

### For Users:
- Check spam folder if emails don't arrive
- Links expire for security (request new if needed)
- Password must be strong (8+ chars, mixed case, numbers)
- Email changes need confirmation at both addresses
- Profile updates are instant (no email needed)

### For Admins:
- New users need to confirm email before first login
- Can reset any user's password via Settings
- Can change user roles and details
- Cannot delete own admin account
- All user actions are logged

### For Developers:
- All email templates configured in Supabase
- Security notifications are automatic
- Redirects must be whitelisted in Supabase
- Session validation happens automatically
- Rate limiting prevents abuse

---

## 📱 Mobile Access

All features work on mobile:
- ✅ Touch-friendly buttons (44px minimum)
- ✅ Responsive dialogs
- ✅ Mobile-optimized forms
- ✅ Works on all screen sizes

---

## 🆘 Common User Questions

**Q: I didn't receive the email**  
A: Check spam folder. If still not there, request a new link.

**Q: The link says it's expired**  
A: Links expire for security. Request a new one from the same place you got the original.

**Q: Can I change my email without confirming?**  
A: No, confirmation is required for security. You'll need to verify via both email addresses.

**Q: How do I change my password if I'm already logged in?**  
A: Click your avatar → My Profile → Security tab → Enter new password

**Q: Why do I need to confirm email changes?**  
A: For security. We verify both addresses to prevent unauthorized email changes.

**Q: Can I use the reset link multiple times?**  
A: No, all links are single-use. Request a new one if needed.

---

**Last Updated**: January 25, 2026  
**Quick Reference Version**: 1.0.0

