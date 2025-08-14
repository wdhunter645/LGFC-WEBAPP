# Search Cron Action Troubleshooting Guide

## Issue Summary
The search-cron GitHub Action is failing because of Supabase configuration issues.

## Root Cause Analysis

### 1. Supabase Project Configuration
- **Old Project**: `xlvgimdnmgywkyvhjvne.supabase.co` (does not exist/resolve)
- **Current Project**: `vkwhrbjkdznncjkzkiuo.supabase.co` (exists but needs proper configuration)

### 2. Missing Environment Variables
The search-cron action requires these GitHub secrets:
- `SUPABASE_URL` - Should point to the current project
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for the current project
- `RSS_FEEDS` - Optional RSS feed URLs
- `NYT_API_KEY` - Optional NYT API key

### 3. Database Tables
The following tables need to exist in the Supabase database:
- `search_state` - Tracks last run time
- `content_items` - Stores ingested content
- `media_files` - Stores media attachments
- `search_sessions` - Tracks search sessions

## Required Fixes

### 1. Update GitHub Repository Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions, and set:

```
SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<get_from_supabase_dashboard>
RSS_FEEDS=https://www.mlb.com/feeds/news/rss.xml,https://www.mlb.com/yankees/feeds/news/rss.xml
```

### 2. Get the Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`vkwhrbjkdznncjkzkiuo`)
3. Go to Settings → API
4. Copy the "service_role" key (not the anon key)

### 3. Apply Database Migrations
Run the database migrations to create the required tables:

```bash
# Install Supabase CLI
curl -fsSL https://supabase.com/install.sh | sh

# Link to your project
supabase link --project-ref vkwhrbjkdznncjkzkiuo

# Apply migrations
supabase db push
```

### 4. Verify Table Creation
The migrations should create:
- `content_items` table with indexes
- `media_files` table with foreign key
- `search_sessions` table
- `search_state` table with initial record

## Testing the Fix

### 1. Test Database Connection
```bash
# Set environment variables
export SUPABASE_URL="https://vkwhrbjkdznncjkzkiuo.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Run diagnostic
node scripts/test_ingest.mjs
```

### 2. Test Manual Ingestion
```bash
# Run ingestion manually
node scripts/ingest.mjs "Lou Gehrig" 10
```

### 3. Check GitHub Actions
After updating secrets, trigger the workflow manually:
1. Go to Actions tab in GitHub
2. Select "search-cron" workflow
3. Click "Run workflow"

## Expected Behavior After Fix
- ✅ Database connection successful
- ✅ All required tables exist and accessible
- ✅ Search state table has initial record
- ✅ Content ingestion works
- ✅ GitHub Actions run successfully

## Monitoring
- Check GitHub Actions logs for any remaining errors
- Monitor the `search_state` table to ensure `last_run_at` is being updated
- Check `content_items` table for new content being added

## Files Modified
- `.github/workflows/search-cron.yml` - No changes needed, uses secrets correctly
- `scripts/check_migrations.mjs` - No changes needed
- `scripts/test_ingest.mjs` - No changes needed
- `scripts/ingest.mjs` - No changes needed

## Migration Files
- `supabase/migrations/20250811142343_mellow_torch.sql` - Main schema
- `supabase/migrations/20250812_search_state.sql` - Search state table

## Next Steps
1. Update GitHub secrets with correct Supabase URL and service role key
2. Apply database migrations
3. Test manually
4. Trigger GitHub Action manually to verify fix