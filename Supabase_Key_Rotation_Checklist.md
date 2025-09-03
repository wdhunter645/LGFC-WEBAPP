# 🔑 Supabase Public Key Rotation Checklist

## 📋 Overview
This checklist provides step-by-step instructions for rotating the Supabase public/anon API key used by the Lou Gehrig Fan Club web application. This process should be performed when keys need to be refreshed for security purposes or when resolving authentication issues.

## ⚠️ Pre-Rotation Requirements
- [ ] Access to Supabase dashboard for project `vkwhrbjkdznncjkzkiuo`
- [ ] GitHub repository admin access for updating secrets
- [ ] Netlify deployment admin access
- [ ] Local development environment with repository clone
- [ ] Backup of current working configuration

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

### Steps:
- [ ] **2.1** Navigate to [GitHub repository](https://github.com/wdhunter645/LGFC-WEBAPP)
- [ ] **2.2** Go to **Settings** → **Secrets and variables** → **Actions**
- [ ] **2.3** Locate the following secrets and update them with the new key:
  - [ ] `SUPABASE_PUBLIC_API_KEY`
  - [ ] `VITE_SUPABASE_ANON_KEY` (if exists)
  - [ ] `PUBLIC_SUPABASE_ANON_KEY` (if exists)
- [ ] **2.4** Click **Update secret** for each one
- [ ] **2.5** Verify the secrets are updated by checking the "Updated" timestamp

**📋 Repository Secrets to Update:**
```
SUPABASE_PUBLIC_API_KEY=<NEW_KEY_HERE>
```

---

## 3️⃣ Update Netlify Deployment Platform

### Steps:
- [ ] **3.1** Log into [Netlify dashboard](https://app.netlify.com)
- [ ] **3.2** Navigate to the Lou Gehrig Fan Club project
- [ ] **3.3** Go to **Site settings** → **Environment variables**
- [ ] **3.4** Update the following environment variables with the new key:

**Production Environment:**
- [ ] `SUPABASE_PUBLIC_API_KEY`
- [ ] `PUBLIC_SUPABASE_ANON_KEY`
- [ ] `VITE_SUPABASE_ANON_KEY`

**Deploy Preview Environment:**
- [ ] `SUPABASE_PUBLIC_API_KEY`
- [ ] `PUBLIC_SUPABASE_ANON_KEY`
- [ ] `VITE_SUPABASE_ANON_KEY`

**Branch Deploy Environment:**
- [ ] `SUPABASE_PUBLIC_API_KEY`
- [ ] `PUBLIC_SUPABASE_ANON_KEY`
- [ ] `VITE_SUPABASE_ANON_KEY`

- [ ] **3.5** Save the environment variable changes
- [ ] **3.6** **Trigger a new deployment** by going to **Deploys** → **Trigger deploy** → **Deploy site**

**🔧 Alternative: Update via netlify.toml**
If managing via configuration file, update the following sections in `netlify.toml`:
- `[context.production.environment]`
- `[context.deploy-preview.environment]`  
- `[context.branch-deploy.environment]`

---

## 4️⃣ Update Local Development Environment

### Steps:
- [ ] **4.1** Navigate to your local repository clone
- [ ] **4.2** Update your local `.env` file (create from `.env.example` if needed):

```bash
# Update these lines in your .env file:
SUPABASE_PUBLIC_API_KEY=<NEW_KEY_HERE>
VITE_SUPABASE_ANON_KEY=<NEW_KEY_HERE>
```

- [ ] **4.3** Update `.env.example` for future reference (optional):
```bash
SUPABASE_PUBLIC_API_KEY=<NEW_KEY_HERE>
VITE_SUPABASE_ANON_KEY=<NEW_KEY_HERE>
```

- [ ] **4.4** **Do NOT commit** the actual keys - only update the example placeholders if needed
- [ ] **4.5** Restart any local development servers:
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

**📁 Files to Update Locally:**
- `.env` (actual environment file - not committed)
- `.env.example` (template - only update if changing the format)

---

## 5️⃣ Update Application Configuration Files (If Needed)

**🔍 Check these files for hardcoded keys (should use environment variables):**

- [ ] **5.1** `supabase.ts` - Verify it uses environment variables with fallbacks
- [ ] **5.2** `src/lib/supabase-client.js` - Verify it uses environment variables with fallbacks  
- [ ] **5.3** `scripts/check_migrations.mjs` - Verify it uses environment variables with fallbacks

**✅ Current Implementation:** These files should already use environment variables with fallback values. Only update the fallback if you want to change the default for development.

---

## 6️⃣ Redeploy and Verify Connectivity

### Deployment Steps:
- [ ] **6.1** **GitHub Actions**: Trigger a workflow to test the new key
  ```bash
  # Go to Actions tab and manually trigger:
  # - search-cron.yml
  # - Any other workflow using SUPABASE_PUBLIC_API_KEY
  ```

- [ ] **6.2** **Netlify**: Ensure the site redeployed successfully
  - Check the **Deploys** tab for successful deployment
  - Look for any build errors in the deploy log

- [ ] **6.3** **Local Testing**: Run the connectivity test script
  ```bash
  chmod +x test-backend-connectivity.sh
  ./test-backend-connectivity.sh
  ```

### Verification Checklist:
- [ ] **6.4** GitHub Actions workflows complete successfully
- [ ] **6.5** Netlify deployment completes without errors  
- [ ] **6.6** Local connectivity test passes
- [ ] **6.7** Application loads correctly in production
- [ ] **6.8** Database queries work (test login, search, etc.)
- [ ] **6.9** No 403 authentication errors in logs

**✅ Success Criteria:**
```bash
# test-backend-connectivity.sh should show:
✅ Supabase connection successful
✅ Project builds: Yes
✅ Functions built: Yes
```

---

## 🚨 Troubleshooting

### Common Issues:

**❌ 403 Authentication Errors:**
- Verify the new key is correctly set in all environments
- Check that RLS (Row Level Security) policies are properly configured
- Ensure the key has the correct permissions in Supabase

**❌ Build Failures:**
- Check Netlify build logs for environment variable errors
- Verify GitHub Actions have the updated secrets
- Ensure no hardcoded old keys remain in the codebase

**❌ Local Development Issues:**
- Verify `.env` file contains the new key
- Restart your development server after updating environment variables
- Check that fallback values in code match the new key (if updated)

**❌ Mixed Environments:**
- Ensure all three Netlify environments (production, deploy-preview, branch-deploy) are updated
- Check that both GitHub secrets and Netlify environment variables are in sync

### Recovery Steps:
If the rotation fails:
- [ ] **Revert to backup key** in all environments
- [ ] **Redeploy** to restore functionality  
- [ ] **Investigate** the specific error messages
- [ ] **Retry rotation** with corrected configuration

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

## 🔐 Security Best Practices

- **Never commit API keys** to version control
- **Use environment variables** for all key storage
- **Rotate keys regularly** as part of security maintenance
- **Test thoroughly** in staging before production rotation
- **Document the process** for future rotations
- **Monitor applications** after rotation for issues

---

## 📞 Support Contacts

**If issues arise during rotation:**
- **Repository Issues**: Create GitHub issue with `security` or `urgent` label
- **Supabase Issues**: Check [Supabase Status](https://status.supabase.com/)
- **Netlify Issues**: Check [Netlify Status](https://www.netlifystatus.com/)

**Emergency Rollback:**
If critical issues occur, immediately revert to the backup key in all environments and redeploy.

---

*Last Updated: January 2024 - Version 1.0*
*Next Scheduled Review: July 2024*