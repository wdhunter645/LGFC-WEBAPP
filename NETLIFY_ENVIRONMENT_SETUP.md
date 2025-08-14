# 🌐 NETLIFY ENVIRONMENT SETUP

## 📋 **Required Environment Variables for Netlify**

### **🔑 Supabase Configuration (Required)**

**For the new JWT system, Netlify needs these environment variables:**

| Variable Name | Value | Purpose |
|---------------|-------|---------|
| `VITE_SUPABASE_URL` | `https://vkwhrbjkdznncjkzkiuo.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs` | Public API key |

---

## 🚀 **How to Set Up in Netlify**

### **Step 1: Access Netlify Dashboard**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your **Lou Gehrig Fan Club** site
3. Navigate to **Site settings**

### **Step 2: Add Environment Variables**
1. Click **Environment variables** in the left sidebar
2. Click **Add a variable** button
3. Add each variable:

**Variable 1:**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- **Scopes**: Production, Deploy previews, Branch deploys

**Variable 2:**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`
- **Scopes**: Production, Deploy previews, Branch deploys

### **Step 3: Trigger a New Build**
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Monitor the build process

---

## 🔍 **What These Variables Do**

### **VITE_SUPABASE_URL**
- **Purpose**: Tells the frontend where to connect to Supabase
- **Used by**: All Supabase client connections
- **Required for**: Database queries, authentication, file uploads

### **VITE_SUPABASE_ANON_KEY**
- **Purpose**: Public API key for Supabase connection
- **Used by**: Frontend authentication and API calls
- **Required for**: JWT authentication, RLS access

---

## 📊 **Current Status**

### **✅ Backend (GitHub Actions):**
- ✅ `SUPABASE_PUBLIC_API_KEY` configured
- ✅ Search-cron working
- ✅ Traffic simulator working

### **❌ Frontend (Netlify):**
- ❌ `VITE_SUPABASE_URL` missing
- ❌ `VITE_SUPABASE_ANON_KEY` missing
- ❌ Build will fail without these

---

## 🎯 **Expected Results**

After adding these environment variables:

### **✅ Build Success:**
- Netlify builds will complete successfully
- Frontend will connect to Supabase properly
- All pages will load without errors

### **✅ Runtime Success:**
- User authentication will work
- Database queries will function
- File uploads will work
- All features will be operational

---

## 🔧 **Verification Steps**

### **After Setup:**
1. **Check build logs** - should complete without errors
2. **Test live site** - all pages should load
3. **Test authentication** - login/logout should work
4. **Test database features** - queries should work

### **If Issues Occur:**
1. **Check environment variables** are set correctly
2. **Verify build logs** for specific error messages
3. **Test locally** with same environment variables
4. **Check Supabase RLS policies** are configured

---

## 📝 **Important Notes**

### **Security:**
- `VITE_SUPABASE_ANON_KEY` is **public** and safe to expose
- It's designed to be used in frontend code
- RLS policies control actual access

### **Build Process:**
- Vite will replace `VITE_*` variables during build
- Variables are embedded in the built JavaScript
- No server-side secrets needed for frontend

### **Consistency:**
- Same API key used across all environments
- Matches GitHub Actions configuration
- Consistent with new JWT approach

---

## ✅ **Success Criteria**

The Netlify setup is complete when:
- ✅ **Build succeeds** without environment variable errors
- ✅ **Site deploys** successfully
- ✅ **All pages load** without Supabase connection errors
- ✅ **Authentication works** for users
- ✅ **Database features** function properly

**Once these environment variables are set, your frontend will be fully compatible with the new JWT system!** 🚀