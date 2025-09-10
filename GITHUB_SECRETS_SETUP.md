# 🔐 GitHub Secrets Configuration Guide

## Overview
This repository requires several GitHub secrets to be configured for Copilot/Codex operations, automated workflows, and service integrations to work properly.

## 🚨 **CRITICAL - Missing Secrets Analysis**

Based on workflow analysis, the following secrets are **REQUIRED** but may be missing or expired:

### **1. CODEX_PAT (Personal Access Token)**
**Status:** ❌ **LIKELY MISSING** - Required for Copilot/Codex operations
- **Used in:** `codex-approve-and-merge.yml`, `codex-open-pr.yml`
- **Current fallback:** Using `github.token` (limited permissions)
- **Problem:** `github.token` has restricted permissions and cannot perform all required operations

**Required permissions for CODEX_PAT:**
- `repo` (full repository access)
- `workflow` (manage GitHub Actions)
- `read:org` (read organization)
- `write:discussion` (manage discussions)
- `admin:repo_hook` (manage webhooks)

### **2. SUPABASE_ACCESS_TOKEN**
**Status:** ⚠️ **POSSIBLY MISSING/EXPIRED**
- **Used in:** `schema-drift-detection.yml`, `supabase-backup-*.yml`
- **Purpose:** Supabase CLI authentication for database operations

### **3. SUPABASE_PROJECT_REF**
**Status:** ⚠️ **POSSIBLY MISSING**
- **Used in:** `schema-drift-detection.yml`
- **Purpose:** Link to specific Supabase project
- **Value should be:** `vkwhrbjkdznncjkzkiuo` (from Supabase URL)

### **4. NETLIFY_AUTH_TOKEN & NETLIFY_SITE_ID**
**Status:** ⚠️ **POSSIBLY MISSING**
- **Used in:** `netlify-deploy-preview.yml`
- **Purpose:** Netlify deployment automation

## 🛠️ **How to Fix Copilot/Codex Permissions**

### **Step 1: Create Personal Access Token (PAT)**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set name: `LGFC-WEBAPP-CODEX-PAT`
4. Set expiration: 1 year (or longer)
5. Select scopes:
   ```
   ✅ repo (Full control of private repositories)
   ✅ workflow (Update GitHub Action workflows)
   ✅ read:org (Read org and team membership)
   ✅ write:discussion (Write repository discussions)
   ✅ admin:repo_hook (Admin repository hooks)
   ```
6. Generate token and **SAVE IT SECURELY**

### **Step 2: Add Secrets to Repository**
1. Go to repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:

```bash
# Codex Operations Token
CODEX_PAT = ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration
SUPABASE_ACCESS_TOKEN = sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_PROJECT_REF = vkwhrbjkdznncjkzkiuo
SUPABASE_PUBLIC_API_KEY = sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs

# Netlify Configuration (if using automated deployments)
NETLIFY_AUTH_TOKEN = nfp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NETLIFY_SITE_ID = xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### **Step 3: Update Workflow Files**
The workflows need to be updated to properly use the CODEX_PAT token:

#### **codex-approve-and-merge.yml**
```yaml
# Current (limited permissions):
GH_TOKEN: ${{ github.token }}

# Should be (full permissions):
GH_TOKEN: ${{ secrets.CODEX_PAT }}
```

#### **codex-open-pr.yml**
```yaml
# Current (limited permissions):
github-token: ${{ secrets.GITHUB_TOKEN }}

# Should be (full permissions):
github-token: ${{ secrets.CODEX_PAT }}
```

## 🔍 **Diagnosis Commands**

To verify what's working and what's not:

### **Test Repository Access**
```bash
# Check if workflows can access repository
gh repo view wdhunter645/LGFC-WEBAPP

# Check workflow runs
gh run list --repo wdhunter645/LGFC-WEBAPP

# Check secrets (will not show values, but will show if they exist)
gh secret list --repo wdhunter645/LGFC-WEBAPP
```

### **Test Supabase Connection**
```bash
# Test if Supabase token works
supabase projects list

# Test project link
supabase link --project-ref vkwhrbjkdznncjkzkiuo
```

## 🚀 **Immediate Action Plan**

### **Priority 1 - Fix Codex Access (Critical)**
1. ✅ Create CODEX_PAT with full permissions
2. ✅ Add CODEX_PAT to repository secrets
3. ✅ Update workflow files to use CODEX_PAT instead of github.token
4. ✅ Test workflow execution

### **Priority 2 - Fix Service Integrations**
1. ⚠️ Add SUPABASE_ACCESS_TOKEN to repository secrets
2. ⚠️ Add SUPABASE_PROJECT_REF to repository secrets
3. ⚠️ Add Netlify tokens if using automated deployments
4. ⚠️ Test service integrations

### **Priority 3 - Verification**
1. 🔄 Run a test workflow to verify permissions
2. 🔄 Check Copilot/Codex can create PRs and approve merges
3. 🔄 Verify all automated workflows pass
4. 🔄 Document working configuration

## 📋 **Verification Checklist**

After adding secrets, verify the following work:

- [ ] Copilot can create pull requests
- [ ] Codex can approve and merge PRs
- [ ] Automated workflows run without permission errors
- [ ] Supabase operations work (schema checks, backups)
- [ ] Netlify deployments work (if configured)
- [ ] Security scans run successfully
- [ ] Bot operations function properly

## 🔧 **Troubleshooting**

### **Common Issues:**

**1. "Resource not accessible by integration" error**
- **Cause:** Using github.token instead of PAT
- **Fix:** Replace with CODEX_PAT secret

**2. "Bad credentials" error**
- **Cause:** Token expired or insufficient permissions
- **Fix:** Generate new token with correct permissions

**3. Supabase login failures**
- **Cause:** Missing or invalid SUPABASE_ACCESS_TOKEN
- **Fix:** Generate new Supabase access token

**4. Netlify deployment failures**
- **Cause:** Missing Netlify tokens
- **Fix:** Add NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID

## 📞 **Support**

If issues persist after following this guide:

1. Check GitHub Actions logs for specific error messages
2. Verify all required secrets are added and not expired
3. Test individual API connections manually
4. Review GitHub repository permissions and settings

---

**⚠️ SECURITY NOTE:** Never commit secrets to the repository. Always use GitHub secrets or environment variables for sensitive information.