# Supabase Configuration Guide for Quantiva

## 🚀 Quick Start - Production Setup

### Step 1: Update URL Configuration in Supabase Dashboard

1. Go to **Supabase Dashboard** (https://supabase.com/dashboard)
2. Select your **Quantiva** project
3. Navigate to **Authentication → URL Configuration**
4. Update the following:

#### Site URL:
```
https://quantiva.world
```

#### Redirect URLs (Add all of these):
```
https://quantiva.world/auth/reset-password
https://quantiva.world/auth/confirm-email
https://quantiva.world/dashboard
https://quantiva.world/login
https://quantiva.world/signup
```

**Important**: Click **Save** after updating!

---

## 📧 Email Templates Configuration

### Step 2: Configure Email Templates

Navigate to **Authentication → Email Templates** in Supabase Dashboard.

### 1. Confirm Signup Template

**Status**: ✅ Enable this template

**Subject**: `Confirm Your Email - Quantiva`

**Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to Quantiva!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea;">Confirm Your Email Address</h2>
    <p>Thank you for signing up with Quantiva. To complete your registration, please confirm your email address.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #667eea;">
      {{ .ConfirmationURL }}
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px;">
      If you didn't create this account, you can safely ignore this email.
    </p>
    <p style="color: #999; font-size: 12px;">
      This link will expire in 24 hours for security purposes.
    </p>
  </div>
</body>
</html>
```

**Available Variables**:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - Confirmation token
- `{{ .TokenHash }}` - Token hash

---

### 2. Reset Password Template

**Status**: ✅ Enable this template

**Subject**: `Reset Your Password - Quantiva`

**Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Reset Your Password</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea;">Password Reset Request</h2>
    <p>We received a request to reset your password for your Quantiva account.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #667eea;">
      {{ .ConfirmationURL }}
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ Security Notice</p>
      <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
        If you didn't request this password reset, please ignore this email and contact support immediately.
      </p>
    </div>
    
    <p style="color: #999; font-size: 12px;">
      This link will expire in 1 hour for security purposes.
    </p>
  </div>
</body>
</html>
```

**Available Variables**:
- `{{ .ConfirmationURL }}` - The password reset link
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - Reset token
- `{{ .TokenHash }}` - Token hash

---

### 3. Change Email Address Template

**Status**: ✅ Enable this template

**Subject**: `Confirm Email Change - Quantiva`

**Template**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm Email Change</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Confirm Email Change</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea;">Email Change Request</h2>
    <p>We received a request to change your email address for your Quantiva account.</p>
    
    <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Current Email:</strong> {{ .Email }}</p>
      <p style="margin: 5px 0;"><strong>New Email:</strong> {{ .NewEmail }}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Confirm Email Change
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 12px; color: #667eea;">
      {{ .ConfirmationURL }}
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #0c5460; font-weight: bold;">ℹ️ Important</p>
      <p style="margin: 5px 0 0 0; color: #0c5460; font-size: 14px;">
        You will receive this email at both your current and new email addresses for security.
      </p>
    </div>
    
    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404; font-weight: bold;">⚠️ Security Notice</p>
      <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
        If you didn't request this email change, please ignore this email and contact support immediately.
      </p>
    </div>
    
    <p style="color: #999; font-size: 12px;">
      This link will expire in 24 hours for security purposes.
    </p>
  </div>
</body>
</html>
```

**Available Variables**:
- `{{ .ConfirmationURL }}` - The email change confirmation link
- `{{ .Email }}` - Current email address
- `{{ .NewEmail }}` - New email address
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - Confirmation token

---

## 🔔 Enable Security Notifications

### Step 3: Enable Automatic Security Notifications

These emails are sent **automatically** by Supabase when security-related actions occur:

1. Navigate to **Authentication → Email Templates**
2. Look for these additional templates:
   - **Email Change** - Sent when email is successfully changed
   - **Password Changed** - Sent when password is updated
   - **Account Created** - Optional welcome email

3. For each template:
   - Toggle the **"Enable"** switch to ON
   - Customize the template if desired
   - Click **Save**

**Note**: Once enabled, these notifications are sent automatically. No code changes needed!

---

## ⚙️ Authentication Settings

### Step 4: Configure Authentication Options

Navigate to **Authentication → Settings**

#### Email Auth Settings:
- ✅ **Enable Email Signup** - ON
- ✅ **Enable Email Confirmations** - ON (IMPORTANT!)
- ✅ **Secure Email Change** - ON (Requires verification)
- ⏱️ **Email Confirmation Expiry** - 24 hours (recommended)
- ⏱️ **Password Reset Expiry** - 1 hour (recommended)

#### Security Settings:
- 🔒 **Minimum Password Length** - 8 characters (recommended)
- 🔒 **Password Strength** - Medium (recommended)
- 🛡️ **Enable Rate Limiting** - ON (prevents abuse)
- 🛡️ **Max Password Retries** - 5 attempts

---

## 🧪 Testing Checklist

### Test Each Flow:

#### 1. Sign Up Flow:
- [ ] User signs up with email/password
- [ ] Confirmation email arrives
- [ ] Click confirmation link
- [ ] Redirects to `/auth/confirm-email`
- [ ] Successfully redirects to dashboard

#### 2. Forgot Password Flow:
- [ ] Click "Forgot password?" on login page
- [ ] Enter email address
- [ ] Reset email arrives
- [ ] Click reset link
- [ ] Redirects to `/auth/reset-password`
- [ ] Enter new password with validation
- [ ] Password successfully updated
- [ ] Redirected to login page

#### 3. Change Password (Logged In):
- [ ] Click avatar → "My Profile"
- [ ] Navigate to "Security" tab
- [ ] Enter new password twice
- [ ] Click "Change Password"
- [ ] Success notification appears
- [ ] Security notification email arrives

#### 4. Change Email:
- [ ] Click avatar → "My Profile"
- [ ] Navigate to "Email" tab
- [ ] Enter new email address
- [ ] Click "Send Confirmation"
- [ ] Confirmation emails arrive at BOTH addresses
- [ ] Click confirmation link
- [ ] Redirects to `/auth/confirm-email`
- [ ] Email successfully changed

---

## 🐛 Troubleshooting

### Emails Not Arriving?

1. **Check Spam/Junk Folder**
   - Supabase emails might be flagged initially

2. **Verify Email Template is Enabled**
   - Go to Email Templates
   - Ensure toggle is ON for each template

3. **Check Supabase Logs**
   - Navigate to Logs → Edge Functions
   - Look for email sending errors

4. **SMTP Configuration**
   - For production, consider using custom SMTP
   - Go to Settings → Auth → SMTP Settings
   - Configure with services like SendGrid, Mailgun, etc.

### Redirect Issues?

1. **Verify Site URL is correct**
   - Must be `https://quantiva.world` (no trailing slash)

2. **Verify all redirect URLs are added**
   - Include all paths users might land on

3. **Clear Browser Cache**
   - Old cached redirects might cause issues

4. **Check for Typos**
   - Ensure URLs match exactly (case-sensitive)

### Link Expired Errors?

1. **Check Expiry Settings**
   - Email confirmation: 24 hours default
   - Password reset: 1 hour default
   - Adjust in Authentication → Settings if needed

2. **Request New Link**
   - All links are single-use
   - Generate a new link if expired

---

## 📋 Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Production** (Vercel, Netlify, etc.):
- Add these as environment variables in your hosting platform
- Never commit `.env.local` to git

---

## 🔐 Security Best Practices

1. **Rate Limiting**
   - Supabase provides built-in rate limiting
   - Prevents brute force attacks
   - Configure in Authentication → Settings

2. **Password Strength**
   - Enforce minimum 8 characters
   - Require mix of uppercase, lowercase, numbers
   - Client-side validation already implemented

3. **Session Management**
   - Sessions expire after inactivity
   - Configure timeout in Authentication → Settings
   - Recommended: 1 week for standard users, shorter for admins

4. **Two-Factor Authentication** (Optional)
   - Can be enabled in Authentication → Settings
   - Requires additional implementation in frontend

---

## 📞 Support & Resources

### Supabase Documentation:
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Auth Configuration](https://supabase.com/docs/guides/auth/auth-config)
- [Password Reset](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Email Change](https://supabase.com/docs/guides/auth/auth-email-change)

### Quantiva Implementation Files:
- `/app/auth/reset-password/page.tsx` - Password reset page
- `/app/auth/confirm-email/page.tsx` - Email confirmation page
- `/app/login/page.tsx` - Login with forgot password
- `/app/dashboard/layout.tsx` - Profile management dialog
- `AUTHENTICATION_IMPLEMENTATION.md` - Full feature documentation

---

## ✅ Production Deployment Checklist

Before going live:

- [ ] Site URL set to `https://quantiva.world`
- [ ] All redirect URLs added
- [ ] Email templates enabled and customized
- [ ] Security notifications enabled
- [ ] Email confirmations enabled
- [ ] Rate limiting enabled
- [ ] Password requirements configured
- [ ] SMTP configured (optional, for better deliverability)
- [ ] All flows tested end-to-end
- [ ] Spam folder checked during testing
- [ ] Error logging set up
- [ ] Environment variables set in production

---

**Configuration Complete!** 🎉

Your authentication system is now fully configured and ready for production use.

**Last Updated**: January 25, 2026
**Version**: 1.0.0

