# 🚀 Supabase Quick Start Guide

## ✅ Installation Complete!

All code has been created and configured. Here's what you need to do next:

---

## 📝 Step 1: Create `.env.local` File

In your project root directory (`C:\cursor_projects\market_research`), create a file named `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kcaviraiykmbkcfhpfg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste your anon public key here>
SUPABASE_SERVICE_ROLE_KEY=<paste your service_role secret key here>
NODE_ENV=development
```

### Where to get the keys:

1. Go to: https://supabase.com/dashboard/project/kcaviraiykmbkcfhpfg/settings/api
2. **anon public** - Copy the full key (starts with `eyJ...`)
3. **service_role** - Click "Reveal" button, then copy the full key

---

## 🧪 Step 2: Test Locally

```powershell
# Start dev server
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/report-run `
  -H "Content-Type: application/json" `
  -d '{
    "schedule_id": "test_local_001",
    "industry": "Technology",
    "sub_niche": "AI",
    "frequency": "weekly",
    "run_at": "2026-01-17T03:30:00Z",
    "is_first_run": true,
    "final_report": "<h1>Local Test Report</h1>"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "execution_id": "exec_...",
  "schedule_id": "test_local_001",
  "is_first_run": true,
  "message": "First execution logged successfully. Schedule initialized.",
  "timestamp": "2026-01-17T03:30:05Z"
}
```

---

## ✅ Step 3: Verify in Supabase

1. Go to https://supabase.com/dashboard/project/kcaviraiykmbkcfhpfg
2. Click **Table Editor** (left sidebar)
3. Click **executions** table
4. You should see your test data! ✅
5. Also check **schedule_metadata** table

---

## 🌐 Step 4: Add to Vercel

1. Go to https://vercel.com/kayode-daniels-projects/quantitva/settings/environment-variables
2. Add these 3 variables:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kcaviraiykmbkcfhpfg.supabase.co` | All ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | All ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key | All ✓ |

3. Click **Save** for each

---

## 🚀 Step 5: Deploy

```powershell
git add .
git commit -m "Integrate Supabase database for persistent storage"
git push origin main
```

Vercel will auto-deploy! ✨

---

## 🎯 Step 6: Test with n8n

Once deployed:

1. **Update n8n HTTP Request URL:**
   ```
   https://quantitva.vercel.app/api/report-run
   ```

2. **Execute your workflow**

3. **Check Supabase Table Editor:**
   - Should see new execution logs
   - Data persists! ✅

---

## 🎉 You're Done!

Your backend now uses Supabase PostgreSQL with:
- ✅ Persistent data storage
- ✅ Automatic backups
- ✅ Row Level Security
- ✅ Activity logging
- ✅ Scalability

---

## 📚 Files Created

All these files are ready:

```
lib/
├── supabase/
│   ├── client.ts          ← Client-side Supabase
│   └── server.ts          ← Server-side Supabase admin
└── data-access/
    └── execution-logs-supabase.dao.ts  ← Database operations
```

Service layer (`lib/services/report-run.service.ts`) updated automatically!

---

## 🔍 Troubleshooting

**Build works but API fails:**
- Make sure `.env.local` has real keys (not placeholders)
- Restart dev server after creating `.env.local`

**Vercel deployment fails:**
- Check environment variables are set in Vercel
- Make sure you selected "All" environments

**No data in Supabase:**
- Check Supabase project isn't paused
- Verify service_role key is correct
- Check Vercel logs for errors

---

## 📞 Need Help?

Check the full documentation: `SUPABASE_SETUP_COMPLETE.md`

