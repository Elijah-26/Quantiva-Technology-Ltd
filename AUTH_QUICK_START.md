# 🎯 Quick Start: User Authentication

## ⚡ One-Time Setup (5 minutes)

### **1. Run SQL in Supabase**

1. Open: https://supabase.com/dashboard/project/kcaviraiykmbkcfhpfg/sql/new
2. Copy & paste all of `supabase-auth-setup.sql`
3. Click **Run** (F5)
4. See: "Supabase Auth configuration complete!" ✅

### **2. Enable Email Auth**

1. Go to: https://supabase.com/dashboard/project/kcaviraiykmbkcfhpfg/auth/providers
2. Make sure **Email** is enabled ✅
3. Click **Save**

### **3. Test It!**

```powershell
npm run dev
```

**Sign up:**
- Visit: http://localhost:3000/signup
- Create account
- Should redirect to login ✅

**Log in:**
- Visit: http://localhost:3000/login
- Use your credentials
- Should see dashboard with your name ✅

**Edit profile:**
- Click **Settings** in sidebar
- Update your name/company
- Click **Save Changes** ✅

**Done!** 🎉

---

## 🚀 Deploy

Already configured! Just push:

```powershell
git add .
git commit -m "Add user authentication"
git push origin main
```

---

## 📋 What You Got

✅ User signup with email/password  
✅ User login with sessions  
✅ Protected dashboard pages  
✅ Profile management in settings  
✅ Sign out functionality  
✅ Database integration (users table)  
✅ Row Level Security enabled  

---

## 📚 Full Docs

See `USER_AUTH_GUIDE.md` for:
- Detailed setup steps
- Security features
- API integration examples
- Troubleshooting
- Advanced features

---

**Your app now has complete user authentication!** 🔐

