# Supabase Backups — Overview

- Workflows: daily schema, weekly full, monthly full
- Paths: `.github/workflows/supabase-backup-{daily,weekly,monthly}.yml`
- Uses Supabase CLI to `db dump` into `backups/*/` and commits changes
- Secret: `SUPABASE_ACCESS_TOKEN`; project ref is set in workflow
