# 🔧 Netlify Environment Variables Configuration Guide

This file documents the environment variables that need to be configured in the Netlify dashboard for production deployment.

## ✅ Variables Already Configured in netlify.toml

The following variables are set in `netlify.toml` with placeholder values and need to be updated in the Netlify dashboard:

### 🔑 **CRITICAL: Replace These Placeholders in Production**

1. **SUPABASE_SERVICE_ROLE_KEY**
   - **Current Value**: `sb_service_role_key_placeholder_for_faq_clicks`
   - **Purpose**: Enables FAQ click tracking to write to database
   - **Used by**: `netlify/functions/faq-click.ts`
   - **Action Required**: Replace with actual Supabase service role key

2. **SENDGRID_API_KEY**
   - **Current Value**: `sendgrid_api_key_placeholder`
   - **Purpose**: Enables email notifications for FAQ responses
   - **Used by**: `netlify/functions/answer-faq.ts`
   - **Action Required**: Replace with actual SendGrid API key

### 📧 **Email Configuration**

3. **SENDGRID_FROM**
   - **Current Value**: `noreply@lougehrigfanclub.com`
   - **Purpose**: From address for FAQ response emails
   - **Used by**: `netlify/functions/answer-faq.ts`
   - **Action Required**: Verify this email address is configured in SendGrid

## ✅ Variables Already Set Correctly

The following variables are properly configured and don't need changes:

### 🌐 **Supabase Configuration**
- `SUPABASE_URL`: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- `SUPABASE_PUBLIC_API_KEY`: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`
- `PUBLIC_SUPABASE_URL`: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- `PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`
- `VITE_SUPABASE_URL`: `https://vkwhrbjkdznncjkzkiuo.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`

### ⚙️ **Build Configuration**
- `NODE_VERSION`: `20.19.4` (Updated to latest LTS)

## 🚀 How to Configure in Netlify Dashboard

1. **Go to Netlify Dashboard** → Site Settings → Environment variables
2. **Add/Update these variables:**
   ```
   SUPABASE_SERVICE_ROLE_KEY = [Your actual service role key]
   SENDGRID_API_KEY = [Your actual SendGrid API key]
   ```
3. **Deploy** to apply changes

## 🔍 Function Dependencies

| Function | Required Variables | Purpose |
|----------|-------------------|---------|
| `faq-click.ts` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Track FAQ clicks |
| `answer-faq.ts` | `SUPABASE_URL`, `SUPABASE_PUBLIC_API_KEY`, `SENDGRID_API_KEY`, `SENDGRID_FROM` | Answer FAQs and send emails |
| `health-check.ts` | `SUPABASE_URL`, `SUPABASE_PUBLIC_API_KEY` | System health monitoring |
| `submit-question.ts` | `SUPABASE_URL`, `SUPABASE_PUBLIC_API_KEY` | Submit new questions |
| `vote.ts` | `SUPABASE_URL`, `SUPABASE_PUBLIC_API_KEY` | Record image votes |

## 🌐 Frontend Dependencies

| Page/Component | Required Variables | Purpose |
|----------------|-------------------|---------|
| `search.astro` | `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Search functionality |
| `api/test-supabase.astro` | `SUPABASE_URL`, `SUPABASE_PUBLIC_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Database connection test |

## ⚠️ Security Notes

- **Public keys** (with `PUBLIC_` or `VITE_` prefix) are safe to expose in client-side code
- **Service role keys** provide elevated database access and must be kept secure
- **API keys** (like SendGrid) should never be exposed in client-side code
- All sensitive variables are configured as server-side only in `netlify.toml`

## 🧪 Testing

Use the included test script to verify configuration:
```bash
node test-env-vars.js
```

This will show which variables are set and which functions are ready to work.