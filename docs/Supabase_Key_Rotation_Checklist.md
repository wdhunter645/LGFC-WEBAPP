# 🔑 Supabase Public Key Rotation Checklist

## 📋 Overview
This comprehensive checklist provides step-by-step instructions for securely rotating the Supabase public/anon API key used by the Lou Gehrig Fan Club web application. This process should be performed during regular security maintenance, when keys are compromised, or when resolving authentication issues.

## ⚠️ Pre-Rotation Requirements & Preparation

### 🔐 Required Access & Permissions
- [ ] **Supabase Dashboard Access**: Admin access to project `vkwhrbjkdznncjkzkiuo`
- [ ] **GitHub Repository Access**: Admin/maintainer permissions for updating secrets and environment variables
- [ ] **Netlify Dashboard Access**: Site admin access for environment variable management
- [ ] **Local Development Environment**: Working repository clone with npm/node setup

### 📋 Pre-Flight Checklist
- [ ] **Document Current State**: Record current key and configuration
- [ ] **Backup Configuration**: Export current environment variables from all platforms
- [ ] **Verify Team Communication**: Notify team members of planned rotation
- [ ] **Schedule Maintenance Window**: Plan rotation during low-traffic period
- [ ] **Test Recovery Process**: Ensure you can quickly revert if needed

### 🛠️ Required Tools & Information
- [ ] **Access to Password Manager**: For secure key storage during rotation
- [ ] **Terminal/CLI Access**: For local testing and verification
- [ ] **Browser Access**: For dashboard management across platforms
- [ ] **Contact Information**: Support contacts for emergency rollback

## 🎯 Current Configuration Reference
**Project Details:**
- **Supabase URL**: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- **Current Public Key**: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`
- **Project ID**: `vkwhrbjkdznncjkzkiuo`

---

## 1️⃣ Generate New Anon/Public Key in Supabase

### Steps:
- [ ] **1.1** Log into the [Supabase dashboard](https://supabase.com/dashboard)
- [ ] **1.2** Navigate to your project: `vkwhrbjkdznncjkzkiuo`
- [ ] **1.3** Go to **Settings** → **API**
- [ ] **1.4** Locate the **Project API keys** section
- [ ] **1.5** Find the **anon/public** key (starts with `sb_publishable_`)
- [ ] **1.6** Copy the current key and **save it securely** as backup
- [ ] **1.7** Generate a new anon/public key (if available) or note the current one for rotation
- [ ] **1.8** **Securely document the new key** - you'll need it for all subsequent steps

**⚠️ Security Note:** Never commit the raw key to version control. Store it securely for the update process.

---

## 2️⃣ Update GitHub Actions Secrets

### 🎯 Required GitHub Actions Secrets
The following secrets must be updated in your GitHub repository to ensure automated workflows continue functioning:

**Primary Secrets:**
- [ ] `SUPABASE_PUBLIC_API_KEY` - Used by search-cron and migration scripts
- [ ] `VITE_SUPABASE_ANON_KEY` - Used by frontend build processes (if exists)
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - Used by Astro/SSG build processes (if exists)

### 📝 Step-by-Step Update Process
- [ ] **2.1** Navigate to [GitHub repository](https://github.com/wdhunter645/LGFC-WEBAPP)
- [ ] **2.2** Go to **Settings** → **Secrets and variables** → **Actions**
- [ ] **2.3** **Backup Current Secrets** (screenshot or document for rollback)
- [ ] **2.4** For each required secret:
  - [ ] **2.4.1** Click on the secret name (e.g., `SUPABASE_PUBLIC_API_KEY`)
  - [ ] **2.4.2** Click **Update secret**
  - [ ] **2.4.3** Paste the new key value securely
  - [ ] **2.4.4** Click **Update secret** to confirm
  - [ ] **2.4.5** Verify the "Updated" timestamp reflects the change
- [ ] **2.5** **Cross-Reference Check**: Ensure all secrets use the same new key value

### 🔍 Verification Steps
- [ ] **2.6** Navigate to **Actions** tab in your repository
- [ ] **2.7** Check that no workflows are failing due to authentication
- [ ] **2.8** Trigger a test workflow (like search-cron) to validate the new secrets
- [ ] **2.9** Monitor workflow logs for successful Supabase connections

### 📊 Impact Assessment
**Workflows Affected by This Change:**
- `search-cron.yml` - Content ingestion automation
- `schema-drift-detection.yml` - Database monitoring
- `backup-audit.yml` - Backup verification processes
- Any custom workflows using Supabase connectivity

**⚠️ Critical Note**: Until secrets are updated, these automated workflows will fail with 401/403 authentication errors.

---

## 3️⃣ Update Netlify Environment Variables

### 🌍 Netlify Environment Scope
Netlify manages environment variables across **three distinct environments**. Each must be updated individually:

1. **Production** - Live site (main branch)
2. **Deploy Preview** - Pull request previews  
3. **Branch Deploy** - Feature branch deployments

### 📋 Required Environment Variables per Environment

**For EACH environment (Production, Deploy Preview, Branch Deploy), update:**
- [ ] `SUPABASE_URL` - Should already be correct (`https://vkwhrbjkdznncjkzkiuo.supabase.co`)
- [ ] `SUPABASE_PUBLIC_API_KEY` - **Update with new key**
- [ ] `PUBLIC_SUPABASE_URL` - Should already be correct 
- [ ] `PUBLIC_SUPABASE_ANON_KEY` - **Update with new key**
- [ ] `VITE_SUPABASE_URL` - Should already be correct
- [ ] `VITE_SUPABASE_ANON_KEY` - **Update with new key**

### 🔧 Step-by-Step Netlify Update Process

#### Access and Navigation
- [ ] **3.1** Log into [Netlify dashboard](https://app.netlify.com)
- [ ] **3.2** Navigate to the **Lou Gehrig Fan Club** site
- [ ] **3.3** Go to **Site settings** → **Environment variables**

#### Update Production Environment
- [ ] **3.4** Select **Production** scope
- [ ] **3.5** For each variable that needs updating:
  - [ ] **3.5.1** Find the variable (e.g., `SUPABASE_PUBLIC_API_KEY`)
  - [ ] **3.5.2** Click the **Options** (⋯) menu → **Edit**
  - [ ] **3.5.3** **Backup current value** (copy to secure notes)
  - [ ] **3.5.4** Replace with new key value
  - [ ] **3.5.5** Click **Save**
  - [ ] **3.5.6** Repeat for: `PUBLIC_SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY`

#### Update Deploy Preview Environment  
- [ ] **3.6** Select **Deploy previews** scope
- [ ] **3.7** Repeat variable update process for:
  - [ ] `SUPABASE_PUBLIC_API_KEY`
  - [ ] `PUBLIC_SUPABASE_ANON_KEY` 
  - [ ] `VITE_SUPABASE_ANON_KEY`

#### Update Branch Deploy Environment
- [ ] **3.8** Select **Branch deploys** scope  
- [ ] **3.9** Repeat variable update process for:
  - [ ] `SUPABASE_PUBLIC_API_KEY`
  - [ ] `PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `VITE_SUPABASE_ANON_KEY`

### 🚀 Trigger Redeployment
- [ ] **3.10** Navigate to **Deploys** tab
- [ ] **3.11** Click **Trigger deploy** → **Deploy site**
- [ ] **3.12** Wait for deployment to complete
- [ ] **3.13** Monitor deployment logs for any environment variable errors

### 🔄 Alternative: netlify.toml Configuration
If managing via configuration file (advanced):
```toml
[context.production.environment]
  SUPABASE_PUBLIC_API_KEY="<NEW_KEY>"
  PUBLIC_SUPABASE_ANON_KEY="<NEW_KEY>"
  VITE_SUPABASE_ANON_KEY="<NEW_KEY>"

[context.deploy-preview.environment]  
  SUPABASE_PUBLIC_API_KEY="<NEW_KEY>"
  PUBLIC_SUPABASE_ANON_KEY="<NEW_KEY>"
  VITE_SUPABASE_ANON_KEY="<NEW_KEY>"

[context.branch-deploy.environment]
  SUPABASE_PUBLIC_API_KEY="<NEW_KEY>"
  PUBLIC_SUPABASE_ANON_KEY="<NEW_KEY>"
  VITE_SUPABASE_ANON_KEY="<NEW_KEY>"
```

**⚠️ Security Warning**: If using netlify.toml approach, ensure the file is properly secured and keys are managed via environment variables, not committed to repository.

---

## 4️⃣ Update Local Development Environment

### 🏠 Local Configuration Files

#### Primary Configuration: .env File
- [ ] **4.1** Navigate to your local repository clone
- [ ] **4.2** Locate or create your local `.env` file:
  ```bash
  # If .env doesn't exist, create it from the example:
  cp .env.example .env
  ```

- [ ] **4.3** Update the following variables in your `.env` file:
  ```bash
  # Supabase Configuration - Update these with your new key
  SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
  SUPABASE_PUBLIC_API_KEY=<NEW_KEY_HERE>
  VITE_SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
  VITE_SUPABASE_ANON_KEY=<NEW_KEY_HERE>
  ```

#### Optional: Update .env.example Template
- [ ] **4.4** **Only if needed for team coordination**: Update `.env.example` placeholders
  ```bash
  # Update placeholder format if organizational standards change:
  SUPABASE_PUBLIC_API_KEY=your_new_supabase_public_api_key_format
  VITE_SUPABASE_ANON_KEY=your_new_supabase_public_api_key_format
  ```

#### Security Verification
- [ ] **4.5** **Verify .env is in .gitignore**:
  ```bash
  # Check that .env is properly excluded from version control
  grep -E "^\.env$" .gitignore
  ```
- [ ] **4.6** **Never commit actual keys**: Ensure only `.env.example` with placeholders is tracked

### 🔄 Restart Local Development
- [ ] **4.7** **Stop current development servers**:
  ```bash
  # Press Ctrl+C in any running npm run dev terminals
  ```
- [ ] **4.8** **Clear any cached environment variables**:
  ```bash
  # Clear npm cache if needed
  npm run dev -- --force
  ```
- [ ] **4.9** **Restart development server**:
  ```bash
  npm run dev
  ```

### 🧪 Local Testing & Verification
- [ ] **4.10** **Test Supabase connectivity**:
  ```bash
  # Run the backend connectivity test
  chmod +x test-backend-connectivity.sh
  ./test-backend-connectivity.sh
  ```
- [ ] **4.11** **Verify web application loads**:
  - [ ] Open http://localhost:4321 (or your configured dev port)
  - [ ] Test key application features (search, authentication, content loading)
  - [ ] Check browser console for authentication errors

### 🔍 Expected Local Test Results
**test-backend-connectivity.sh should show:**
```bash
✅ Supabase connection successful
✅ Project builds: Yes  
✅ Functions built: Yes
✅ Environment variables: Properly configured
```

**Browser Developer Tools should show:**
- No 401/403 authentication errors in Network tab
- Successful API responses from Supabase endpoints
- Proper loading of dynamic content

---

## 5️⃣ Remove Hardcoded Keys from Codebase

### 🔍 Code Audit & Key Removal

#### Systematic Hardcoded Key Detection
- [ ] **5.1** **Search for hardcoded keys** across the codebase:
  ```bash
  # Search for the old key pattern in all relevant files
  grep -r "sb_publishable_" --include="*.js" --include="*.ts" --include="*.mjs" .
  
  # Search for any instances of the specific old key
  grep -r "sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs" .
  ```

#### Files Requiring Key Updates
**⚠️ Important**: These files should use environment variables with fallback values for development only.

**Primary Application Files:**
- [ ] **5.2** `supabase.ts` - Verify uses env variables with **development-only fallback**
- [ ] **5.3** `src/lib/supabase-client.js` - Verify uses env variables with **development-only fallback**
- [ ] **5.4** `netlify/functions/supabase-proxy.ts` - Verify uses env variables with fallback

**Script Files (JWT-based, may use direct connection):**
- [ ] **5.5** `scripts/check_migrations.mjs` - Uses direct connection with fallback
- [ ] **5.6** `scripts/ingest.mjs` - Uses direct connection with fallback  
- [ ] **5.7** `scripts/test_ingest.mjs` - Uses direct connection with fallback
- [ ] **5.8** `scripts/apply_rls_policies.mjs` - Uses direct connection with fallback
- [ ] **5.9** `scripts/github_actions_debug.mjs` - Uses direct connection with fallback

**Test Files:**
- [ ] **5.10** `test-data/insert-test-events.mjs` - Update if contains hardcoded production key

### 🔧 Recommended Code Pattern

#### For Application Files (supabase.ts, supabase-client.js)
**✅ Correct Pattern:**
```javascript
const supabasePublicKey = 
  import.meta.env.SUPABASE_PUBLIC_API_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_dev_fallback_key_for_local_development_only';
```

**❌ Avoid This:**
```javascript
// Don't hardcode production keys directly
const supabasePublicKey = 'sb_publishable_RealProductionKey';
```

#### For Script Files (may use direct connection)
**✅ Acceptable Pattern:**
```javascript
const SUPABASE_PUBLIC_API_KEY = 
  process.env.SUPABASE_PUBLIC_API_KEY || 
  'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs'; // OK for scripts with fallback
```

### 📋 Key Replacement Strategy

#### Fallback Key Management
- [ ] **5.11** **For application code**: Replace hardcoded production keys with clearly marked dev-only fallbacks
- [ ] **5.12** **For script files**: Environment variable + fallback pattern is acceptable
- [ ] **5.13** **For test files**: Use placeholder keys or environment variables
- [ ] **5.14** **For documentation**: Replace examples with placeholder patterns

#### Validation Steps  
- [ ] **5.15** **Run comprehensive search** to ensure no production keys remain:
  ```bash
  # This should return no results after cleanup
  grep -r "sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs" --include="*.js" --include="*.ts" --include="*.mjs" src/
  ```
- [ ] **5.16** **Verify environment variable usage** in critical files:
  ```bash
  # Check that files properly reference environment variables
  grep -r "import.meta.env\|process.env" src/ | grep -i supabase
  ```

### ⚠️ Critical Notes

**Development Fallbacks vs Hardcoded Production Keys:**
- **✅ Acceptable**: Fallback keys for local development when environment variables aren't set
- **❌ Unacceptable**: Hardcoded production keys that bypass environment variable configuration
- **✅ Acceptable**: Script files that use environment variables with documented fallbacks
- **❌ Unacceptable**: Any production key appearing in committed code without environment variable override

---

## 6️⃣ Verify Deployments & Test Connectivity

### 🚀 Deployment Verification

#### GitHub Actions Validation
- [ ] **6.1** **Navigate to Actions tab** in your GitHub repository
- [ ] **6.2** **Trigger critical workflows** to test new secrets:
  ```bash
  # Manually trigger these key workflows:
  # - search-cron.yml (Tests SUPABASE_PUBLIC_API_KEY)
  # - schema-drift-detection.yml (Database connectivity) 
  # - backup-audit.yml (Backup processes)
  ```
- [ ] **6.3** **Monitor workflow execution**:
  - [ ] **6.3.1** Each workflow should complete successfully (green checkmark)
  - [ ] **6.3.2** Review logs for any authentication errors
  - [ ] **6.3.3** Confirm Supabase connection messages show success
- [ ] **6.4** **Check for specific success indicators**:
  - [ ] `✅ Supabase connection successful` in logs
  - [ ] No `401 Unauthorized` or `403 Forbidden` errors
  - [ ] Database operations complete without authentication failures

#### Netlify Deployment Validation  
- [ ] **6.5** **Check deployment status**:
  - [ ] Navigate to Netlify **Deploys** tab
  - [ ] Confirm latest deployment shows **Published** status
  - [ ] Review build logs for environment variable errors
- [ ] **6.6** **Verify environment loading**:
  ```bash
  # Look for these positive indicators in Netlify build logs:
  # - "Environment variables loaded"
  # - "Supabase configuration validated" 
  # - No "undefined" or "missing" variable warnings
  ```

### 🧪 Comprehensive Testing Suite

#### Production Site Testing
- [ ] **6.7** **Frontend Functionality Test**:
  - [ ] **6.7.1** Load main site: https://your-site.netlify.app
  - [ ] **6.7.2** Test search functionality (requires Supabase connection)
  - [ ] **6.7.3** Test user authentication flows (login/logout)
  - [ ] **6.7.4** Verify dynamic content loading (posts, milestones, Q&A)
  - [ ] **6.7.5** Check browser console for authentication errors

#### API Endpoint Testing
- [ ] **6.8** **Netlify Functions Test**:
  ```bash
  # Test key API endpoints:
  curl -X GET https://your-site.netlify.app/api/test-supabase
  curl -X GET https://your-site.netlify.app/api/health-check
  
  # Expected response: {"status": "healthy", "supabase": "connected"}
  ```

#### Local Development Testing
- [ ] **6.9** **Local Connectivity Verification**:
  ```bash
  # Run comprehensive local test
  chmod +x test-backend-connectivity.sh
  ./test-backend-connectivity.sh
  ```
- [ ] **6.10** **Local Application Test**:
  ```bash
  # Start dev server and test
  npm run dev
  # Navigate to http://localhost:4321 and test all major features
  ```

### 📊 Success Criteria Checklist

#### GitHub Actions Success Indicators
- [ ] **6.11** All critical workflows complete with exit code 0
- [ ] **6.12** Workflow logs show successful Supabase authentication
- [ ] **6.13** No environment variable "undefined" errors in workflow output
- [ ] **6.14** Database operations (migrations, content ingestion) work correctly

#### Production Deployment Success Indicators  
- [ ] **6.15** Site loads without errors across all major pages
- [ ] **6.16** Search functionality returns results (proves database connectivity)
- [ ] **6.17** User authentication works (login/logout flows)
- [ ] **6.18** Dynamic content displays properly (not just static content)
- [ ] **6.19** Browser developer tools show no 401/403 authentication errors
- [ ] **6.20** Netlify functions respond correctly to API calls

#### Performance & Reliability Indicators
- [ ] **6.21** Site loads within expected performance benchmarks
- [ ] **6.22** Database queries execute within normal time ranges  
- [ ] **6.23** No increase in error rates or timeouts
- [ ] **6.24** Content Management System (CMS) remains accessible and functional

### ⚠️ Failure Response Protocol

**If Any Tests Fail:**
1. **Immediately document** the specific failure and error messages
2. **Check Recent Changes** - verify the new key was applied correctly in the failing environment
3. **Review Configuration** - ensure environment variables match across all platforms
4. **Consider Rollback** - if critical functionality is broken, revert to backup key
5. **Systematic Debug** - work through each environment (local → GitHub → Netlify) to isolate the issue

---

## 🚨 Troubleshooting & Emergency Procedures

### 🔧 Common Issues & Solutions

#### **❌ 401/403 Authentication Errors**

**Symptoms:**
- "Invalid API key" errors in application logs
- "Unauthorized" responses from Supabase API calls
- GitHub Actions workflows failing with authentication errors

**Root Causes & Solutions:**
- [ ] **Inconsistent Key Updates**: Ensure the same new key is used across ALL environments
  ```bash
  # Verify key consistency across platforms:
  # 1. Check GitHub secrets match
  # 2. Verify all three Netlify environments use same key
  # 3. Confirm local .env file has correct key
  ```
- [ ] **Row Level Security (RLS) Issues**: Verify RLS policies are compatible with new key
  ```bash
  # Test RLS policies with new key:
  node scripts/apply_rls_policies.mjs
  ```
- [ ] **Cached Authentication**: Clear any cached authentication tokens
  ```bash
  # For local development:
  rm -rf .astro/ node_modules/.cache/
  npm run dev
  ```

#### **❌ Build & Deployment Failures**

**Symptoms:**
- Netlify build process fails with "undefined" environment variables
- GitHub Actions show "Environment variable not found" errors
- Application builds locally but fails in CI/CD

**Root Causes & Solutions:**
- [ ] **Missing Environment Variables**: Verify all required variables are set in each environment
- [ ] **Typo in Variable Names**: Double-check variable name spelling matches exactly
  ```bash
  # Common variable name variations to check:
  SUPABASE_PUBLIC_API_KEY
  PUBLIC_SUPABASE_ANON_KEY  
  VITE_SUPABASE_ANON_KEY
  ```
- [ ] **Scope Issues**: Ensure variables are set in correct Netlify environment scopes
- [ ] **Build Cache Issues**: Clear build caches and retry:
  ```bash
  # In Netlify: 
  # Deploys → Options → Clear cache and retry deploy
  ```

#### **❌ Local Development Issues**

**Symptoms:**
- Local dev server shows authentication errors
- Environment variables not loading in local development
- Scripts work in production but fail locally

**Root Causes & Solutions:**
- [ ] **Missing .env File**: Ensure `.env` exists and contains new key
  ```bash
  # Create .env from example if missing:
  cp .env.example .env
  # Then update with actual key values
  ```
- [ ] **Server Restart Required**: Restart development server after env changes
  ```bash
  # Kill any existing dev servers, then:
  npm run dev
  ```
- [ ] **Environment Variable Precedence**: Check for conflicting env sources
  ```bash
  # Verify environment loading:
  node -e "console.log(process.env.SUPABASE_PUBLIC_API_KEY)"
  ```

#### **❌ Mixed Environment Issues**

**Symptoms:**
- Some features work while others fail
- Inconsistent authentication behavior
- Working in one environment but not others

**Root Causes & Solutions:**
- [ ] **Partial Updates**: Ensure ALL environments and secrets were updated
- [ ] **Deployment Timing**: Check if all deployments completed successfully
- [ ] **Cache Propagation**: Wait for cache invalidation across CDN
  ```bash
  # Force cache bust by:
  # 1. Triggering new Netlify deployment
  # 2. Waiting 5-10 minutes for CDN propagation
  # 3. Testing in incognito/private browser mode
  ```

### 🔄 Emergency Rollback Procedures

#### **Immediate Rollback Process**
If critical issues arise and immediate service restoration is needed:

**Step 1: Restore Previous Key**
- [ ] **7.1** Locate your backed-up key (from step 1.6)
- [ ] **7.2** **GitHub Actions**: Update secrets back to previous key value
- [ ] **7.3** **Netlify**: Revert environment variables to previous key
- [ ] **7.4** **Local**: Update `.env` with previous key (if needed for debugging)

**Step 2: Force Redeployment**
- [ ] **7.5** Trigger Netlify redeployment: **Deploys** → **Trigger deploy**
- [ ] **7.6** Monitor deployment for successful completion
- [ ] **7.7** Trigger critical GitHub Actions workflows to verify restoration

**Step 3: Verify Service Restoration**
- [ ] **7.8** Test core application functionality
- [ ] **7.9** Verify authentication flows work
- [ ] **7.10** Check that automated workflows resume successfully
- [ ] **7.11** Monitor error rates return to normal levels

#### **Post-Rollback Analysis**
After service is restored:
- [ ] **7.12** **Document the Issue**: Record what went wrong and why rollback was needed
- [ ] **7.13** **Root Cause Analysis**: Identify the specific configuration error
- [ ] **7.14** **Plan Correction**: Develop plan to fix the issue before retrying rotation
- [ ] **7.15** **Team Communication**: Notify team of rollback and next steps

### 🔍 Advanced Debugging Techniques

#### **Environment Variable Debugging**
```bash
# Test environment variable loading in different contexts:

# 1. Node.js environment (for scripts)
node -e "console.log('Node env:', process.env.SUPABASE_PUBLIC_API_KEY?.slice(0,10))"

# 2. Vite environment (for frontend)
npm run dev -- --debug-env

# 3. Netlify Functions environment (check function logs)
# Deploy a test function that logs environment variable presence
```

#### **Network Level Debugging**
```bash
# Test direct API connectivity with new key:
curl -H "apikey: YOUR_NEW_KEY" \
     -H "Authorization: Bearer YOUR_NEW_KEY" \
     https://vkwhrbjkdznncjkzkiuo.supabase.co/rest/v1/posts?select=id&limit=1

# Expected: JSON response with data or empty array
# Error responses indicate key or permissions issues
```

#### **Application-Level Debugging**
```javascript
// Add temporary debugging code to supabase client files:
console.log('Supabase Key (first 10 chars):', supabasePublicKey?.slice(0,10));
console.log('Environment source:', {
  env: process.env.SUPABASE_PUBLIC_API_KEY?.slice(0,10),
  vite: import.meta.env?.SUPABASE_PUBLIC_API_KEY?.slice(0,10),
  fallback: 'Using fallback value'
});

// Remove debugging code after issues resolved
```

---

## 📊 Post-Rotation Verification

### Final Checklist:
- [ ] **Application Access**: All pages load correctly
- [ ] **Authentication**: Login/logout functionality works
- [ ] **Database Operations**: Search, content loading, user interactions work
- [ ] **API Endpoints**: All Netlify functions respond correctly
- [ ] **GitHub Actions**: Automated workflows complete successfully
- [ ] **No Error Logs**: Check browser console and server logs for auth errors

### Monitoring:
- [ ] Monitor application for 24-48 hours after rotation
- [ ] Check GitHub Actions workflows for continued success
- [ ] Verify no authentication-related errors in production logs
- [ ] Test all major user flows (registration, login, content interaction)

---

## 📝 Documentation Updates

After successful rotation:
- [ ] Update this checklist if any steps needed modification
- [ ] Document the rotation date and reason in your change log
- [ ] Update any internal documentation referencing the old key format
- [ ] Notify team members of the successful rotation

---

## 🔐 Security Best Practices & Recommendations

### 🎯 Key Management Best Practices

#### **Secure Key Storage & Handling**
- [ ] **Never commit API keys** to version control - use environment variables exclusively
- [ ] **Use secure password managers** for temporary key storage during rotation
- [ ] **Implement principle of least privilege** - ensure keys have minimal required permissions
- [ ] **Document key ownership** - maintain clear records of who has access to production keys
- [ ] **Rotate keys regularly** - establish scheduled rotation (recommend quarterly or semi-annually)
- [ ] **Monitor key usage** - review Supabase dashboard for unusual API activity patterns

#### **Environment Segregation**
- [ ] **Separate development/staging/production keys** when possible
- [ ] **Use different Supabase projects** for development vs production if security requires it
- [ ] **Implement proper environment variable scoping** - production keys only in production environments
- [ ] **Validate environment configuration** - automated checks to ensure correct keys in correct environments

#### **Access Control & Auditing** 
- [ ] **Limit key access to essential personnel** - minimize team members who need production key access
- [ ] **Maintain rotation audit trail** - document when, why, and who performed each rotation
- [ ] **Implement change approval process** - require review/approval for production key changes
- [ ] **Set up monitoring alerts** - notifications for authentication failures or unusual API patterns

### 🔒 Code Security Standards

#### **Environment Variable Usage**
```javascript
// ✅ RECOMMENDED: Environment variable with optional fallback for development
const supabaseKey = process.env.SUPABASE_PUBLIC_API_KEY || 
                    'development_fallback_key_clearly_marked';

// ✅ ACCEPTABLE: Multiple environment variable sources with fallback
const supabaseKey = process.env.SUPABASE_PUBLIC_API_KEY ||
                    process.env.VITE_SUPABASE_ANON_KEY ||
                    import.meta.env.SUPABASE_PUBLIC_API_KEY ||
                    'dev-only-fallback';

// ❌ AVOID: Direct hardcoding of production keys
const supabaseKey = 'sb_publishable_actual_production_key_here';
```

#### **Fallback Key Standards**
- [ ] **Development fallbacks**: Use clearly marked development-only keys in fallback values
- [ ] **Placeholder patterns**: For documentation, use `your_key_here` or similar placeholder formats
- [ ] **Environment detection**: Implement runtime checks to warn when using fallback values in production
- [ ] **Graceful degradation**: Handle missing keys gracefully with appropriate error messages

#### **Configuration Validation**
```javascript
// ✅ RECOMMENDED: Runtime environment validation
function validateSupabaseConfig() {
  const key = process.env.SUPABASE_PUBLIC_API_KEY;
  const url = process.env.SUPABASE_URL;
  
  if (!key || key.includes('placeholder') || key.includes('your_')) {
    console.warn('⚠️ Using development fallback for Supabase key');
  }
  
  if (process.env.NODE_ENV === 'production' && (!key || key.includes('fallback'))) {
    throw new Error('Production environment requires valid Supabase configuration');
  }
  
  return { url, key };
}
```

### 📅 Scheduled Maintenance & Monitoring

#### **Regular Security Maintenance**
- [ ] **Quarterly key rotation** - schedule regular rotations as part of security maintenance
- [ ] **Annual security review** - comprehensive review of all API keys and access patterns
- [ ] **Dependency security updates** - keep all dependencies current to avoid security vulnerabilities
- [ ] **Access audit** - regularly review who has access to production keys and remove unnecessary access

#### **Monitoring & Alerting**
- [ ] **Set up Supabase usage monitoring** - track API usage patterns and establish baselines
- [ ] **Configure authentication failure alerts** - immediate notification of authentication issues
- [ ] **Monitor key expiration** - if using time-limited keys, set up expiration reminders
- [ ] **Track deployment health** - automated checks that deployments work after key rotation

#### **Documentation & Knowledge Management**
- [ ] **Maintain current documentation** - keep rotation procedures updated with lessons learned
- [ ] **Cross-train team members** - ensure multiple people can perform emergency rotations
- [ ] **Document emergency contacts** - maintain current contact information for emergency situations
- [ ] **Keep runbooks current** - regularly test and update emergency procedures

### 🚨 Security Incident Response

#### **Compromised Key Response**
If a Supabase key is potentially compromised:

1. **Immediate Response** (within minutes):
   - [ ] **Generate new key** in Supabase dashboard immediately
   - [ ] **Update all production environments** with new key as quickly as possible
   - [ ] **Force deployment** across all platforms to activate new key
   - [ ] **Revoke old key** in Supabase dashboard to prevent further use

2. **Assessment & Communication** (within hours):
   - [ ] **Assess scope of compromise** - review access logs for unauthorized usage
   - [ ] **Notify security team** and relevant stakeholders
   - [ ] **Document incident timeline** and response actions taken
   - [ ] **Review how compromise occurred** to prevent future incidents

3. **Follow-up Actions** (within days):
   - [ ] **Complete security audit** of related systems and processes
   - [ ] **Update security procedures** based on lessons learned
   - [ ] **Consider additional security measures** if compromise suggests systemic issues

#### **Prevention Strategies**
- [ ] **Regular key rotation reduces impact** of any individual key compromise
- [ ] **Principle of least privilege** - keys should have minimal necessary permissions
- [ ] **Network security** - ensure API calls are made over HTTPS only
- [ ] **Environment separation** - compromise of development keys shouldn't affect production

---

## 📞 Support Contacts & Resources

### 🆘 Emergency Support Contacts

**If critical issues arise during key rotation:**

#### **Internal Support**
- [ ] **Repository Owner**: wdhunter645 (GitHub notifications enabled)
- [ ] **Technical Lead**: Create GitHub issue with `critical` or `security` label for immediate attention
- [ ] **Emergency Contact**: If repository owner unavailable, contact via GitHub issue with `urgent` tag

#### **Platform Support Resources**
- [ ] **Supabase Platform**: 
  - Status: [https://status.supabase.com/](https://status.supabase.com/)
  - Documentation: [https://supabase.com/docs](https://supabase.com/docs)
  - Community: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
  - Support: Dashboard support chat (for paid plans)

- [ ] **Netlify Platform**:
  - Status: [https://www.netlifystatus.com/](https://www.netlifystatus.com/)
  - Documentation: [https://docs.netlify.com/](https://docs.netlify.com/)
  - Support: [https://support.netlify.com/](https://support.netlify.com/)
  - Community: [https://community.netlify.com/](https://community.netlify.com/)

- [ ] **GitHub Platform**:
  - Status: [https://www.githubstatus.com/](https://www.githubstatus.com/)
  - Documentation: [https://docs.github.com/](https://docs.github.com/)
  - Support: [https://support.github.com/](https://support.github.com/)

### 🔧 Self-Service Resources

#### **Documentation & Guides**
- [ ] **Project Documentation**: 
  - `API_KEY_CONFIGURATION.md` - Comprehensive API key setup guide
  - `NETLIFY_ENV_VARS_GUIDE.md` - Netlify environment variable management
  - `NETLIFY_SUPABASE_SETUP.md` - Integration setup documentation
  - `lou_gehrig_fan_club_master_build_v5.md` - Complete project build guide

#### **Diagnostic Tools**
- [ ] **Health Check Script**: `test-backend-connectivity.sh`
  ```bash
  chmod +x test-backend-connectivity.sh
  ./test-backend-connectivity.sh
  ```
- [ ] **API Testing Endpoints**: 
  - Local: `http://localhost:4321/api/test-supabase`
  - Production: `https://your-site.netlify.app/api/test-supabase`
- [ ] **Build Verification**: `npm run build && npm run preview`

#### **Monitoring & Status Dashboards**
- [ ] **Supabase Project Dashboard**: Direct access to API usage, error rates, and connection status
- [ ] **Netlify Site Dashboard**: Deployment status, build logs, and environment variable management
- [ ] **GitHub Actions**: Workflow execution history and logs for automated processes

### 📋 Escalation Procedures

#### **Issue Classification & Response Times**

**🚨 CRITICAL (Response: Immediate)**
- Production site completely down due to authentication failures
- All automated workflows failing simultaneously
- Security incident involving potential key compromise

**⚠️ HIGH (Response: Within 2 hours)**  
- Some production features not working due to authentication
- Key workflows failing but site partially functional
- Deployment blocked due to environment configuration

**📝 MEDIUM (Response: Within 24 hours)**
- Local development environment issues
- Non-critical workflow failures
- Performance degradation related to key configuration

**💡 LOW (Response: Within 72 hours)**
- Documentation updates needed
- Enhancement requests for rotation process
- Questions about best practices

#### **Escalation Process**
1. **Self-Diagnosis** (15-30 minutes): Use diagnostic tools and check status pages
2. **Documentation Review** (15-30 minutes): Consult project documentation and troubleshooting sections
3. **Community Resources** (30-60 minutes): Search platform community forums and documentation
4. **Create GitHub Issue** (if internal): Use appropriate priority label and provide diagnostic info
5. **Platform Support** (if platform issue): Contact relevant platform support with technical details

### 🔄 Emergency Rollback Contacts

**If immediate rollback is required:**

#### **Decision Authority**
- [ ] **Repository Owner (wdhunter645)**: Final authority for emergency rollback decisions
- [ ] **Backup Decision Maker**: Senior team member with admin access (if owner unavailable)

#### **Technical Execution**
- [ ] **Primary**: Person performing the rotation (should be able to execute rollback)
- [ ] **Backup**: Team member with admin access to all platforms (GitHub, Netlify, Supabase)

#### **Communication Protocol**
1. **Immediate**: Notify repository owner/team lead of rollback decision
2. **During Rollback**: Document steps being taken and reasons
3. **Post-Rollback**: Create post-mortem issue with timeline and lessons learned

### 📞 Contact Information Template

**For Internal Documentation (update as needed):**
```markdown
## Emergency Rotation Contacts

- **Primary**: [Name] - [Contact Method] - [Availability]
- **Backup**: [Name] - [Contact Method] - [Availability] 
- **Repository Owner**: wdhunter645 - GitHub notifications - Standard hours
- **Technical Lead**: [TBD] - [Contact Method] - [Availability]

Last Updated: [Date]
Next Review: [Date + 3 months]
```

---

## 📚 Additional Resources & References

### 🔗 Related Documentation
- **API_KEY_CONFIGURATION.md** - Detailed API key setup and configuration guide
- **NETLIFY_ENV_VARS_GUIDE.md** - Comprehensive Netlify environment variable management
- **NETLIFY_SUPABASE_SETUP.md** - Complete integration setup documentation  
- **lou_gehrig_fan_club_master_build_v5.md** - Full project build and deployment guide
- **.github/copilot-instructions.md** - Development context and configuration reference

### 📖 Platform Documentation
- **Supabase API Keys**: [https://supabase.com/docs/guides/api/api-keys](https://supabase.com/docs/guides/api/api-keys)
- **Netlify Environment Variables**: [https://docs.netlify.com/environment-variables/overview/](https://docs.netlify.com/environment-variables/overview/)
- **GitHub Actions Secrets**: [https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

### 🎯 Quick Reference Commands
```bash
# Test Supabase connectivity
./test-backend-connectivity.sh

# Search for hardcoded keys
grep -r "sb_publishable_" --include="*.js" --include="*.ts" --include="*.mjs" .

# Verify environment variables
node -e "console.log(process.env.SUPABASE_PUBLIC_API_KEY?.slice(0,10))"

# Build and test locally  
npm run build && npm run preview

# Development server with debugging
npm run dev -- --debug-env
```

---

**📅 Document Maintenance**
- **Created**: January 2024
- **Last Updated**: January 2024  
- **Version**: 2.0 (Comprehensive Update)
- **Next Scheduled Review**: April 2024 
- **Review Trigger**: After each key rotation or significant platform changes

**🔄 Change Log**
- **v2.0**: Comprehensive rewrite with enhanced troubleshooting, security best practices, and detailed step-by-step procedures
- **v1.0**: Initial basic checklist for key rotation process

---

*This document is maintained as part of the Lou Gehrig Fan Club Web Application security documentation. For questions, updates, or emergency situations, refer to the Support Contacts section above.*