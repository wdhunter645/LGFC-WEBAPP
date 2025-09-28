# Supabase Backend Components

This directory contains Supabase Edge Functions and SQL migrations for the Lou Gehrig Fan Club backend.

## What the search does (zero-cost mode)
- Aggregates new Lou Gehrig–related content hourly (GitHub Action)
- Free sources: GDELT, Wikipedia, Wikimedia Commons, Internet Archive, RSS feeds (MLB/Yankees by default; configurable)
- Optional providers (if keys are set): Bing (Azure Cognitive Services), NYTimes Article Search
- De-duplicates by `content_hash` and `source_url`
- Writes into:
  - `content_items`
  - `media_files`
  - `search_sessions`
  - Maintains `search_state.last_run_at` for incremental searches

## Prerequisites
- Supabase project (URL and keys)
- Supabase CLI installed and authenticated

## Environment (function runtime secrets)
Set these in your Supabase project if applicable:
```
# Required for the function to write to DB
SUPABASE_URL="https://<your>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"

# Optional provider mode (paid tiers). If omitted, free sources are used.
SEARCH_API_PROVIDER="BING"              # optional
SEARCH_API_KEY="<bing_key>"            # optional

# Optional free/curated sources config
RSS_FEEDS="https://www.mlb.com/feeds/news/rss.xml,https://www.mlb.com/yankees/feeds/news/rss.xml"
NYT_API_KEY="<nyt_key>"                # optional; if set, NYT results included
```

Set secrets (one-time):
```bash
supabase secrets set \
  SUPABASE_URL="https://<your>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
  RSS_FEEDS="https://www.mlb.com/feeds/news/rss.xml,https://www.mlb.com/yankees/feeds/news/rss.xml"
# Optional providers
# supabase secrets set SEARCH_API_PROVIDER="BING" SEARCH_API_KEY="<bing_key>"
# supabase secrets set NYT_API_KEY="<nyt_api_key>"
```

## Apply migrations
```bash
# Creates tables (content_items, media_files, search_sessions), RLS, indexes
# Adds search_state (tracks last_run_at) and enables pgcrypto
supabase db push
```

## Deploy Edge Function
Function: `search-content`
```bash
cd supabase/functions/search-content
supabase functions deploy search-content --project-ref <YOUR_PROJECT_REF>
```

## Triggering ingestion
- GitHub Actions (configured): `.github/workflows/search-cron.yml` runs hourly and requests 50 results
- Manual invoke:
```bash
export SUPABASE_URL="https://<your>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
bash scripts/invoke_search_function.sh "Lou Gehrig" 50
```

## Notes
- Frontend never sees service role keys. It only uses:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (Netlify env)
- The search function uses `search_state.last_run_at` to restrict free sources by recency where supported (e.g., GDELT `startdatetime`, RSS `pubDate`).
- Add/replace feeds by setting `RSS_FEEDS` (comma-separated) in function secrets.