# Search Cron — Overview

- Workflow: `.github/workflows/search-cron.yml`
- Purpose: run diagnostics and ingest content hourly; supports manual dispatch
- Steps: `npm ci` → debug env → check migrations → diagnostic test → ingest 50
- Secrets: `SUPABASE_PUBLIC_API_KEY` (req), `RSS_FEEDS` (opt), `NYT_API_KEY` (opt)
