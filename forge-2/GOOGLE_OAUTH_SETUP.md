# Google OAuth Setup Guide

## ✅ Code Changes (Already Done)

- ✅ Added `loginWithGoogle()` method to authStore
- ✅ Added Google OAuth provider in Supabase configuration  
- ✅ Created SocialLogin component with Google button
- ✅ Integrated Google sign-in on Login & Signup screens
- ✅ Added OAuth state management

---

## 📋 Setup Steps (Manual - Do This!)

### **Step 1: Create Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project:
   - Click **"Select a project"** → **"New Project"**
   - Name: `FORGE 2.0` (or your project name)
   - Click **"Create"**
3. Wait for project to be created, then select it

### **Step 2: Enable Google+ API**

1. In Google Cloud Console → **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it → **"Enable"**

### **Step 3: Create OAuth Credentials**

1. Go to **"Credentials"** (left menu)
2. Click **"Create Credentials"** → **"OAuth Client ID"**
3. If prompted for **"Configure OAuth Consent Screen"**:
   - Click **"Configure"**
   - Choose **"External"** 
   - Fill in:
     - **App name:** FORGE 2.0
     - **User support email:** your-email@gmail.com
     - **Developer email:** your-email@gmail.com
   - **Scopes:** Add `email` and `profile`
   - **Save and Continue**
   - Add yourself as test user (optional but recommended)
   - **Save & Continue** → **Back to Credentials**

4. Now click **"Create Credentials"** → **"OAuth Client ID"** again
5. Application type: **"Web application"**
6. Name: `FORGE 2.0 Web`
7. **Add Authorized JavaScript origins:**
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:5175
   ```
8. **Add Authorized redirect URIs:**
   ```
   https://[YOUR-PROJECT].supabase.co/auth/v1/callback
   ```
   (Replace `[YOUR-PROJECT]` with your actual Supabase project name)

9. Click **"Create"**
10. Copy the **Client ID** and **Client Secret** (you'll need these)

### **Step 4: Add Google Provider to Supabase**

1. Go to Supabase Dashboard → **Settings → Authentication → Providers**
2. Find **"Google"** 
3. Toggle **"Enable Google"**
4. Paste:
   - **Client ID:** (from Google Cloud Console)
   - **Client Secret:** (from Google Cloud Console)
5. Click **"Save"**

---

## ✨ Test Google Sign-In

1. Start dev server: `npm run dev`
2. Go to `/login` or `/signup`
3. Click **"Google"** button
4. Sign in with your Google account
5. Should redirect to dashboard! 🎉

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid OAuth redirect" | Check your redirect URI matches exactly in Supabase. Include the full URL ending with `/auth/v1/callback` |
| "Client ID not found" | Make sure you're copying from Google Cloud Console, not from OAuth Consent Screen |
| Blank redirect page | Check browser console (F12) for CORS or redirect errors |
| "Provider not enabled" | Make sure toggle is ON in Supabase Authentication settings |

---

## 📱 What Happens After Google Sign-In?

1. User clicks Google button
2. Redirected to Google login (if not already logged in)
3. Google asks for permission to share email & profile
4. Redirected back to your app at `/dashboard`
5. Zustand store automatically updates with user info:
   - `id` from Google
   - `email` from Google
   - `name` from Google profile

---

## 🛡️ Security Notes

1. **Client Secret must be kept private** ✅ (stored on Supabase backend, not exposed)
2. **Authorized redirect URIs** - Only add trusted URLs
3. **Test users** - During OAuth consent screen setup, use your own email for testing
4. **Production redirect** - Update with your production domain when deploying

---

## 🚀 Next Steps

After Google OAuth is working:
- [ ] Test with different Google accounts
- [ ] Verify user profile data is saved correctly
- [ ] Check token refresh works (auto-login after refresh)
- [ ] Test logout and re-login flow
- [ ] Consider adding GitHub OAuth (similar process)

---

**Status:** Ready to configure! Follow steps 1-4 above. 🎯
