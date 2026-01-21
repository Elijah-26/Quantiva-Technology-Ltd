# Webhooks Migration Guide
## From localStorage to Supabase Database

### 🎯 **What Changed**

**Before:**
- ❌ Webhooks stored in browser localStorage
- ❌ Per-device/browser configuration
- ❌ Users lost config when clearing cache
- ❌ Inconsistent across devices
- ❌ Not production-ready

**After:**
- ✅ Webhooks stored in Supabase database
- ✅ Global configuration (all users share same webhooks)
- ✅ Persistent and reliable
- ✅ Centrally managed by admins
- ✅ Production-ready

---

## 📋 **Migration Steps**

### **For Client Deployment:**

#### **Step 1: Run Database Migration**

Execute the SQL script in Supabase SQL Editor:

```sql
-- File: migrate-webhooks-to-supabase.sql
-- Creates webhooks table and inserts default active webhooks
```

**What it does:**
1. Creates `webhooks` table
2. Sets up RLS policies
3. Inserts 2 default active webhooks:
   - On-Demand Research Handler
   - Recurring Research Handler
4. All webhooks are **active by default**

#### **Step 2: Configure Webhook URLs**

After migration, admin needs to update webhook URLs in Settings:

1. Login as admin (`pat2echo@gmail.com` or `admin@quantitva.com`)
2. Go to **Settings** → **Webhooks** tab
3. Edit each webhook
4. Update URL with actual n8n webhook endpoints
5. Save changes

**Example URLs:**
```
On-Demand: https://n8n.quantitva.com/webhook/on-demand
Recurring: https://n8n.quantitva.com/webhook/recurring
```

#### **Step 3: Deploy Code**

Push code changes to Vercel:

```bash
git push client main
```

Vercel will automatically deploy.

---

## 🔐 **Security & Access**

### **Who Can Do What:**

| Action | Admin | Regular User |
|--------|-------|--------------|
| View webhooks | ✅ | ✅ (read-only via API) |
| Edit webhooks | ✅ | ❌ |
| Delete webhooks | ✅ | ❌ |
| Toggle active/inactive | ✅ | ❌ |
| Use webhooks (generate reports) | ✅ | ✅ |

### **RLS Policies:**

- ✅ All authenticated users can **read** webhooks
- ✅ Only service role (backend API) can **modify** webhooks
- ✅ Admin check enforced in API routes

---

## 🎨 **How It Works**

### **For Users:**

1. User generates on-demand report
2. App fetches active webhook of type "on-demand" from database
3. Sends request to that webhook URL
4. n8n processes the request
5. Report appears on dashboard

### **For Admins:**

1. Admin updates webhook URL in Settings
2. Changes saved to Supabase database
3. All users instantly use new webhook URL
4. No need for users to update anything

---

## 🚀 **Benefits**

### **For Users:**
- ✅ Works immediately on any device
- ✅ No configuration needed
- ✅ Consistent experience
- ✅ Webhooks always active

### **For Admins:**
- ✅ Central configuration management
- ✅ Update once, applies to all users
- ✅ Can pause/resume webhooks globally
- ✅ Track webhook status

### **For Production:**
- ✅ Reliable and persistent
- ✅ No data loss
- ✅ Proper database storage
- ✅ Audit trail (created_at, updated_at)

---

## 📊 **Database Schema**

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('on-demand', 'recurring')),
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(type) -- Only one webhook per type
);
```

**Key Design Decisions:**
- `UNIQUE(type)` - Ensures only one webhook per type
- `active: true` default - All webhooks work out of the box
- Global table (no user_id) - All users share same configuration

---

## 🔄 **Migration Impact**

### **Existing Users:**
- ✅ Will automatically use database webhooks
- ✅ Old localStorage data becomes obsolete
- ✅ No action required from users
- ✅ Seamless transition

### **New Users:**
- ✅ Immediately get active webhooks
- ✅ Can start generating reports right away
- ✅ No configuration needed

---

## 🧪 **Testing**

### **After Migration:**

1. **Test as Regular User:**
   ```
   - Login as regular user
   - Go to dashboard
   - Generate on-demand report
   - Verify it reaches n8n
   - Check report appears on Reports tab
   ```

2. **Test as Admin:**
   ```
   - Login as admin
   - Go to Settings → Webhooks
   - Verify webhooks are listed
   - Edit a webhook URL
   - Toggle active/inactive
   - Delete and recreate webhook
   ```

3. **Test Schedules:**
   ```
   - Create recurring schedule
   - Wait for scheduled run
   - Verify n8n receives request
   - Check report appears on dashboard
   ```

---

## 🛠️ **Troubleshooting**

### **Webhooks not working:**

**Check:**
1. Are webhooks active in database?
   ```sql
   SELECT name, type, active FROM webhooks;
   ```

2. Are URLs correct?
   - Go to Settings → Webhooks
   - Verify URLs point to correct n8n endpoints

3. Is n8n receiving requests?
   - Check n8n execution logs
   - Verify webhook endpoints are active

### **Admin can't modify webhooks:**

**Check:**
1. User has admin role:
   ```sql
   SELECT email, role FROM users WHERE email = 'admin@example.com';
   ```

2. Check browser console for API errors
3. Verify Supabase service role key is set in env vars

---

## 📝 **API Endpoints**

### **GET /api/webhooks**
- Returns all webhooks
- Available to all authenticated users
- Used by app to find webhook URLs

### **POST /api/webhooks**
- Create new webhook
- Admin only
- Body: `{ name, url, type, description }`

### **PUT /api/webhooks/[id]**
- Update existing webhook
- Admin only
- Body: `{ name?, url?, type?, description?, active? }`

### **DELETE /api/webhooks/[id]**
- Delete webhook
- Admin only

---

## ✅ **Checklist for Client**

```
□ Run migrate-webhooks-to-supabase.sql in Supabase
□ Verify webhooks table created
□ Verify default webhooks inserted (2 rows)
□ Push code to Vercel
□ Login as admin
□ Go to Settings → Webhooks
□ Update webhook URLs with actual n8n endpoints
□ Test on-demand report generation
□ Test recurring schedule execution
□ Verify reports appear for all users
```

---

## 🎉 **Success Criteria**

- ✅ All users can generate reports immediately
- ✅ Webhooks persist across browser sessions
- ✅ Admin can manage webhooks centrally
- ✅ No localStorage dependencies
- ✅ Production-ready and scalable

---

**Questions?** Contact your development team or refer to the implementation files:
- `migrate-webhooks-to-supabase.sql`
- `app/api/webhooks/route.ts`
- `app/api/webhooks/[id]/route.ts`
- `lib/webhooks.ts`

