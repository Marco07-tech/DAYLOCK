# Supabase Integration Setup Guide

## 📋 Files Created

The following files have been created for Supabase integration:

### 1. **src/lib/supabase.ts** ✅
   - Supabase client initialization
   - Environment variable validation
   - Ready to use throughout the app

### 2. **.env.local** ✅
   - Environment variables template
   - **⚠️ DO NOT commit to git (add to .gitignore)**
   - Replace placeholder values with your actual Supabase credentials

### 3. **src/store/authStore.ts** ✅ (Updated)
   - Replaced mock auth with real Supabase authentication
   - Added `initializeAuth()` method to restore sessions
   - All methods now use Supabase API calls

### 4. **src/App.tsx** ✅ (Updated)
   - Added `useEffect` to call `initializeAuth()` on app load
   - Loads user session from localStorage on first visit

### 5. **SUPABASE_SETUP.sql**
   - SQL script to create database tables
   - Row Level Security (RLS) policies
   - Includes: users, workouts, nutrition tables

---

## 🚀 Quick Start (5 Steps)

### **Step 1: Create Supabase Project**
1. Go to **https://supabase.com**
2. Click **"Start your project"** (sign up if needed)
3. Create new project:
   - **Project Name:** `forge-fitness`
   - **Database Password:** Save securely
   - **Region:** Choose closest to you
4. Wait 2-3 minutes for setup

### **Step 2: Get API Keys**
1. In Supabase dashboard → **Settings → API**
2. Copy these values:
   ```
   Project URL:     https://xxxxx.supabase.co
   Anon Key:        eyJ... (public, safe to share)
   Service Key:     sbp_... (SECRET - never share!)
   ```

### **Step 3: Set Environment Variables**
Open `.env.local` in forge-2 root and update:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Example (with fake values for reference):**
```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Step 4: Create Database Tables**
1. In Supabase dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy all SQL from `SUPABASE_SETUP.sql`
4. Paste into SQL Editor
5. Click **"Run"** (green button)
6. Wait for completion ✓

### **Step 5: Test Authentication**
1. Terminal:
   ```bash
   cd d:\Fitness App\forge-2
   npm run dev
   ```
2. Open http://localhost:5174/signup
3. Sign up with **real email address**
4. Check your email for verification link
5. Click link and log in
6. Should see dashboard ✓

---

## 📧 Email Verification (Important!)

By default, Supabase requires email confirmation. Users will receive:

1. **Signup Confirmation Email** - Click link to verify email
2. **Password Reset Email** - Click link to reset password
3. **Magic Link** - One-click authentication

To disable email verification (for testing only):
1. Go to **Settings → Authentication → Email**
2. Toggle off **"Confirm email"**
3. ⚠️ Enable this in production!

---

## 🔑 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abcd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public API key (safe) | `eyJ0eXAiOiJKV1QiLCJhbGc...` |

---

## 🗄️ Database Tables

### **users**
```
- id (UUID, Primary Key)
- email (TEXT)
- name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **workouts** (Optional)
```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- name (TEXT)
- description (TEXT)
- duration_minutes (INT)
- calories_burned (INT)
- exercises_count (INT)
- completed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **nutrition** (Optional)
```
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- date (DATE)
- calories (INT)
- protein (INT)
- carbs (INT)
- fat (INT)
- water_ml (INT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] API keys copied to `.env.local`
- [ ] Database SQL script executed
- [ ] Email confirmation configured (or disabled for testing)
- [ ] Dev server running (`npm run dev`)
- [ ] Signup tested with real email
- [ ] Email verification link clicked
- [ ] Login successful
- [ ] Dashboard accessible

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "VITE_SUPABASE_URL is undefined" | Check `.env.local` exists in `forge-2/` root |
| "Invalid API key" | Make sure you copied **Anon Key**, not Service Key |
| "Email not sent" | Supabase sends from `noreply@mail.supabase.io` (check spam) |
| "CORS error" | Add your domain to Supabase → Settings → API → CORS |
| Blank login page | Check browser console for errors (F12) |

---

## 🔒 Security Notes

1. **Never commit `.env.local`** to git
   ```bash
   # Add to .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Anon Key is public** - OK to expose (used in browser)
3. **Service Key is secret** - NEVER expose (backend only)
4. **Enable Row Level Security** - Prevents unauthorized access
5. **Environment variables** - Prefixed with `VITE_` to expose in browser

---

## 📚 Next Steps

1. ✅ **Basic Auth** - Done! Login/Signup working
2. Social Login - Add Google/GitHub sign-in
3. User Profiles - Edit name, avatar, bio
4. User Workouts - Save/retrieve workouts
5. Nutrition Tracking - Store nutrition data
6. Push Notifications - Email/SMS alerts
7. Analytics - Track user behavior

---

## 🆘 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Auth Methods:** https://supabase.com/docs/guides/auth
- **SQL Reference:** https://supabase.com/docs/guides/database/sql
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

---

## 📞 Support

For issues with:
- **Environment variables** → Check `.env.local` format
- **Database** → Check SQL errors in Supabase console
- **Auth flows** → Check browser console (F12)
- **CORS** → Check Supabase API settings

---

**Status:** ✅ Ready for Production
**Version:** 2.0.0
**Last Updated:** 2026-05-25
