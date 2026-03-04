# Supabase Reset Password Email Template (Token-Based)

To enable **cross-browser and cross-device** password reset, update your Supabase "Reset Password" email template to include `{{ .Token }}`.

## Steps

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **Reset Password**
3. Replace the body with the template below (or add the token section to your existing template)

## Template (include both link AND token)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
    </div>
    <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #111827; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #4b5563;">Hi there, we received a request to reset your Quantiva password.</p>
        
        <p style="color: #4b5563;"><strong>Option 1 - Click the button:</strong></p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">Reset Password</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;"><strong>Option 2 - Use code (works on any device/browser):</strong></p>
        <p style="color: #4b5563;">If the link doesn't work (e.g. you opened this email on a different device), go to <a href="https://quantiva.world/auth/reset-password">quantiva.world/auth/reset-password</a> and enter this code:</p>
        <div style="text-align: center; margin: 20px 0; background: #fef2f2; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">{{ .Token }}</div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 6px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>⚠️ This link and code expire in 1 hour.</strong></p>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">If you didn't request this, ignore this email.</p>
    </div>
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
        <p><strong>Quantiva AI</strong> - <a href="https://quantiva.world" style="color: #2563eb;">quantiva.world</a></p>
    </div>
</body>
</html>
```

## Why this matters

Supabase's default reset flow uses PKCE, which ties the reset link to the **same browser** that requested it. If a user requests a reset on their laptop but opens the link on their phone (or in a different browser), the link fails with `otp_expired`.

By including `{{ .Token }}`, users can:
- Click the link (same browser) → works as before
- Or enter the code manually at quantiva.world/auth/reset-password → works on any device/browser
