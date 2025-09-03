# 🔑 API Key Configuration Guide

## 📋 **Overview**
This guide explains where the Supabase public API key needs to be configured for the JWT-based system to work properly.

## 🎯 **API Key Requirements**

### **✅ Required in Multiple Places:**

1. **Environment Files** (Local Development)
2. **GitHub Repository Secrets** (Automated Workflows)
3. **Production Environment Variables** (Deployed Applications)

## 🔧 **Configuration Locations**

### **1. Local Environment Files**

**`.env` file:**
```bash
# Supabase Configuration
SUPABASE_PUBLIC_API_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
```

**`.env.example` file:**
```bash
# Supabase Configuration
SUPABASE_PUBLIC_API_KEY=your_supabase_public_api_key_here
```

### **2. GitHub Repository Secrets**

**Required Secret:**
- **Name**: `SUPABASE_PUBLIC_API_KEY`
- **Value**: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`

**How to Add:**
1. Go to GitHub repository settings
2. Navigate to **Secrets and variables → Actions**
3. Click **New repository secret**
4. Add the name and value above

### **3. GitHub Actions Workflow**

**Already configured in `.github/workflows/search-cron.yml`:**
```yaml
- name: Check database migrations
  env:
    SUPABASE_PUBLIC_API_KEY: ${{ secrets.SUPABASE_PUBLIC_API_KEY }}
  run: node scripts/check_migrations.mjs
```

## 🔐 **Why API Key is Still Needed**

### **JWT vs API Key Understanding:**

**API Key = Connection Setup:**
- ✅ **Required** to establish connection to Supabase
- ✅ **Identifies** the project and enables API access
- ✅ **Cannot be eliminated** - it's the entry point

**JWT = Authentication:**
- ✅ **Handles session management** internally
- ✅ **Eliminates need** for anonymous sign-ins
- ✅ **Simplifies authentication** process

**RLS = Authorization:**
- ✅ **Controls what operations** are allowed
- ✅ **Defines access policies** for each table
- ✅ **Works with public API key**

## 📊 **Current Status**

### **✅ Completed:**
- ✅ **Environment files** updated with API key
- ✅ **GitHub Actions** configured to use secret
- ✅ **Scripts** updated to use environment variable
- ✅ **Local testing** working

### **🔑 Still Needed:**
- 🔑 **Add `SUPABASE_PUBLIC_API_KEY` to GitHub repository secrets**

## 🎯 **Expected Results**

After adding the GitHub secret:

1. **Local Development**: Scripts work with `.env` file
2. **GitHub Actions**: search-cron runs successfully
3. **Production**: Applications can access Supabase
4. **No Anonymous Sign-ins**: JWT handles authentication internally

## 🔧 **Testing**

### **Local Test:**
```bash
# Should work without any additional setup
node scripts/check_migrations.mjs
```

### **GitHub Actions Test:**
- Add the secret to GitHub repository
- Trigger the search-cron workflow
- Verify it completes successfully

## ✅ **Success Criteria**

The API key configuration is complete when:
- ✅ **Local scripts** run without errors
- ✅ **GitHub Actions** complete successfully
- ✅ **No "Missing API key"** errors
- ✅ **All search-cron operations** work

## 📝 **Summary**

**The public API key is still required** even with JWT because:
- **API key** = Connection setup (required)
- **JWT** = Authentication (handled internally)
- **RLS** = Authorization (controls access)

**Both environment files and GitHub secrets are needed** for complete functionality across all environments.