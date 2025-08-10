# Lou Gehrig Fan Club — Master Build, As‑Built Configurations & Project Record (v3)
_Last updated: 2025‑08‑10 (America/New_York)_

> **Scope of this file:** Complete, exhaustive build book. No executive summaries. Everything needed to rebuild, audit, or hand off the project, including as‑built configs, final scripts, policy SQL, CI/CD, vendor runbooks, and chronological project record (success-only).

---

## 0) Build Statement (for another AI/Dev to reproduce exactly)
- Treat this document as the single source of truth.
- Use GitHub as the **origin of code and scripts**; Netlify deploys the frontend from GitHub; Supabase hosts DB/Auth/REST; Backblaze B2 stores media; Cloudflare DNS cutover happens at launch.
- Never commit secrets. Use `.env` (private) and `.env.example` (public template). `.gitignore` must exclude `.env`.
- All recurring tasks run via **GitHub Actions** (cron) or scripts invoked manually.
- Only **successful, implemented** solutions are recorded here; failed experiments are intentionally omitted.

---

## 1) Repository Layout (as built)

```
/
├─ netlify.toml
├─ decap/                 # Decap CMS config and schemas
│  └─ config.yml
├─ src/                   # React app (frontend)
│  ├─ pages/
│  ├─ components/
│  └─ lib/
├─ public/                # Static assets
├─ scripts/               # Operational scripts (bash/sql)
│  ├─ vendor_report.sh
│  ├─ supabase_keepalive.sh
│  ├─ media_audit.sh
│  ├─ supabase_status.sql
│  └─ migrate_content.sh  # legacy site content workflow (kept as reference)
├─ .github/workflows/     # CI/CD & schedulers
│  ├─ deploy.yml
│  ├─ keepalive.yml
│  └─ vendor-report.yml
├─ .env.example
├─ .gitignore
└─ README.md
```

---

## 2) Environment & Secrets Strategy (enforced)

### 2.1 `.gitignore` (required entries)
```
.env
.env.*.local
*.pem
```

### 2.2 `.env.example` (publish in repo; real `.env` lives outside Git)
```
# --- Netlify Build ---
VITE_SITE_NAME=Lou Gehrig Fan Club

# --- Supabase ---
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY_PLACEHOLDER
SUPABASE_SERVICE_ROLE=SUPABASE_SERVICE_ROLE_PLACEHOLDER
SUPABASE_DB_URL=postgresql://user:pass@host:5432/postgres

# --- Backblaze B2 ---
B2_APPLICATION_KEY_ID=YOUR_B2_KEY_ID
B2_APPLICATION_KEY=YOUR_B2_APP_KEY
B2_BUCKET=LouGehrigFanClub

# --- Cloudflare (planned DNS/R2) ---
CLOUDFLARE_ACCOUNT_ID=YOUR_CF_ACCOUNT
CLOUDFLARE_API_TOKEN=YOUR_CF_API_TOKEN

# --- GitHub Actions (if needed for API calls) ---
GH_TOKEN=YOUR_GH_PAT
```

**Rules:**
- Never echo secrets to terminal. Never print `$…` values in logs.
- All scripts must fail fast if required env vars are missing.

---

## 3) Netlify Configuration (as built)

### 3.1 `netlify.toml`
```toml
[build]
  command   = "npm run build"
  publish   = "dist"
  environment = { 
    VITE_SUPABASE_URL = "${VITE_SUPABASE_URL}", 
    VITE_SUPABASE_ANON_KEY = "${VITE_SUPABASE_ANON_KEY}" 
  }

[[redirects]]
  from = "/api/*"
  to   = "/.netlify/functions/:splat"
  status = 200

[dev]
  framework = "vite"
```

### 3.2 Decap CMS (Netlify CMS successor)
`decap/config.yml`
```yaml
backend:
  name: git-gateway
  branch: main

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  - name: "milestones"
    label: "Milestones"
    folder: "content/milestones"
    create: true
    fields:
      - { name: "title", label: "Title", widget: "string" }
      - { name: "event_date", label: "Event Date", widget: "date" }
      - { name: "description", label: "Description", widget: "text" }
      - { name: "media_url", label: "Media URL", widget: "string" }
  - name: "admin_posts"
    label: "Admin Posts"
    folder: "content/admin_posts"
    create: true
    fields:
      - { name: "title", label: "Title", widget: "string" }
      - { name: "posted_at", label: "Posted At", widget: "datetime" }
      - { name: "content", label: "Content", widget: "markdown" }
```

> Rationale: Decap schedules website content via Git commits, aligning with Netlify deploys.

---

## 4) Supabase (DB/Auth/REST) — As‑Built

> Note: The actual live schema was validated and locked. Below are the **as‑built tables and policies** used in production, captured in SQL for reproducibility.

### 4.1 Schema DDL (final)
```sql
-- Extensions (commonly used; enable if not already)
create extension if not exists pgcrypto with schema public;
create extension if not exists "uuid-ossp" with schema public;

-- USERS
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text not null unique,
  auth_provider text,
  created_at timestamptz default now()
);

-- MEDIA LOCATIONS (references B2/R2 URLs)
create table if not exists public.media_locations (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text check (type in ('photo','video','doc') ) default 'photo',
  uploaded_at timestamptz default now()
);

-- MILESTONES
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date,
  media_location_id uuid references public.media_locations(id) on delete set null
);

-- ADMIN POSTS
create table if not exists public.admin_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  posted_at timestamptz default now(),
  author_id uuid references public.users(id) on delete set null
);

-- PHOTO MATCHUPS
create table if not exists public.photo_matchups (
  id uuid primary key default gen_random_uuid(),
  photo_a_id uuid references public.media_locations(id) on delete cascade,
  photo_b_id uuid references public.media_locations(id) on delete cascade,
  posted_at timestamptz default now(),
  votes_a int default 0,
  votes_b int default 0
);

-- Helpful indexes
create index if not exists idx_milestones_event_date on public.milestones(event_date);
create index if not exists idx_media_locations_type on public.media_locations(type);
create index if not exists idx_admin_posts_posted_at on public.admin_posts(posted_at);
```

### 4.2 Row Level Security (RLS) — enabled + policies
```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.media_locations enable row level security;
alter table public.milestones enable row level security;
alter table public.admin_posts enable row level security;
alter table public.photo_matchups enable row level security;

-- USERS: self-read/write
create policy users_select_self on public.users
for select using (auth.uid() = id);
create policy users_update_self on public.users
for update using (auth.uid() = id);
create policy users_insert_self on public.users
for insert with check (auth.uid() = id);

-- MEDIA LOCATIONS: authenticated can insert their own; public read
create policy media_select_public on public.media_locations
for select using (true);
create policy media_insert_auth on public.media_locations
for insert with check (auth.role() = 'authenticated');

-- MILESTONES: public read; only 'admin' role can write
create policy milestones_select_public on public.milestones
for select using (true);
create policy milestones_admin_write on public.milestones
for all using (auth.role() = 'admin') with check (auth.role() = 'admin');

-- ADMIN POSTS: only 'admin' role can CRUD; public read
create policy admin_posts_select_public on public.admin_posts
for select using (true);
create policy admin_posts_admin_write on public.admin_posts
for all using (auth.role() = 'admin') with check (auth.role() = 'admin');

-- PHOTO MATCHUPS: public read; authenticated can vote via RPC (see below)
create policy photo_matchups_select_public on public.photo_matchups
for select using (true);
```

### 4.3 Sample RPC (for voting) — optional
```sql
create or replace function public.vote_matchup(matchup uuid, choice text)
returns void language plpgsql as $$
begin
  if choice = 'A' then
    update public.photo_matchups set votes_a = votes_a + 1 where id = matchup;
  elsif choice = 'B' then
    update public.photo_matchups set votes_b = votes_b + 1 where id = matchup;
  else
    raise exception 'Invalid choice';
  end if;
end;
$$;
```

### 4.4 Canonical Test Insert (schema-proof harness)
```sql
-- scripts/supabase_status.sql (also used for status collection at runtime)

-- Row counts (extend as needed)
select 'users' as table, count(*) from public.users
union all select 'media_locations', count(*) from public.media_locations
union all select 'milestones', count(*) from public.milestones
union all select 'admin_posts', count(*) from public.admin_posts
union all select 'photo_matchups', count(*) from public.photo_matchups;

-- Last 5 IDs for FK validation
select 'users' as table, id, created_at from public.users order by created_at desc limit 5;
select 'media_locations' as table, id, uploaded_at from public.media_locations order by uploaded_at desc limit 5;
```

> All production inserts must satisfy NOT NULL columns and FKs with real UUIDs.

---

## 5) Backblaze B2 — As‑Built

### 5.1 Bucket & structure
- **Bucket:** `LouGehrigFanClub` (public read)
- **Folders:** `/milestones`, `/events`, `/memorabilia`

### 5.2 CLI usage (v3)
```bash
b2 authorize-account "$B2_APPLICATION_KEY_ID" "$B2_APPLICATION_KEY"
b2 ls "$B2_BUCKET" --long --maxFileCount 10
b2 upload-file "$B2_BUCKET" ./local/IMG_0001.jpg /milestones/IMG_0001.jpg
```

### 5.3 (Recommended) CORS policy for web assets (JSON)
```json
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedHeaders": ["*"],
    "AllowedOperations": ["b2_download_file_by_id", "b2_download_file_by_name"],
    "ExposeHeaders": ["ETag","Content-Length","Content-Type"],
    "MaxAgeSeconds": 3600
  }]
}
```

---

## 6) Cloudflare — DNS & R2 (planned)

### 6.1 DNS cutover runbook (zero downtime)
1. Pre‑create DNS records in Cloudflare matching current SitePro zone.
2. Lower TTL on existing records to 300s.
3. Add Netlify `CNAME` for `www` and root redirect (if using).
4. Switch NS to Cloudflare at registrar.
5. Verify SSL status (Universal SSL), then raise TTL to 3600s.

### 6.2 R2 (future)
- Mirror media from B2 or move primary to R2.
- Update `media_locations.url` as part of controlled migration.

---

## 7) CI/CD & Scheduled Jobs (GitHub Actions)

### 7.1 `.github/workflows/deploy.yml`
```yaml
name: deploy
on:
  push:
    branches: [ main ]
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - name: Netlify Deploy
        uses: netlify/actions/cli@v2
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 7.2 `.github/workflows/keepalive.yml`
```yaml
name: supabase-keepalive
on:
  schedule:
    - cron: "*/30 * * * *"
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST
        run: |
          curl -s "${{ secrets.VITE_SUPABASE_URL }}/rest/v1/users" \
            -H "apikey: ${{ secrets.VITE_SUPABASE_ANON_KEY }}" \
            -o /dev/null -w "%{http_code}\n"
```

### 7.3 `.github/workflows/vendor-report.yml`
```yaml
name: vendor-report
on:
  schedule:
    - cron: "0 13 * * 1"  # Mondays 9am ET
jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install B2 CLI
        run: pipx install b2
      - name: Vendor Report
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          B2_APPLICATION_KEY_ID: ${{ secrets.B2_APPLICATION_KEY_ID }}
          B2_APPLICATION_KEY: ${{ secrets.B2_APPLICATION_KEY }}
          B2_BUCKET: ${{ secrets.B2_BUCKET }}
        run: |
          bash scripts/vendor_report.sh | tee vendor_report.out
      - uses: actions/upload-artifact@v4
        with:
          name: vendor-report
          path: vendor_report.out
```

---

## 8) Scripts Library (final, with safety checks)

### 8.1 `scripts/vendor_report.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

require() { v="$1"; if [[ -z "${!v:-}" ]]; then echo "Missing env: $v" >&2; exit 1; fi; }

require VITE_SUPABASE_URL
require VITE_SUPABASE_ANON_KEY
require B2_APPLICATION_KEY_ID
require B2_APPLICATION_KEY
require B2_BUCKET

echo "Netlify: use Netlify UI/Actions for status (no secrets printed)."

echo -n "Supabase REST health... "
code=$(curl -s "$VITE_SUPABASE_URL/rest/v1" -H "apikey: $VITE_SUPABASE_ANON_KEY" -o /dev/null -w "%{http_code}")
echo "$code"

echo "B2 auth and list:"
b2 authorize-account "$B2_APPLICATION_KEY_ID" "$B2_APPLICATION_KEY" >/dev/null
b2 ls "$B2_BUCKET" --long --maxFileCount 10 || true
```

### 8.2 `scripts/supabase_keepalive.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

require() { v="$1"; if [[ -z "${!v:-}" ]]; then echo "Missing env: $v" >&2; exit 1; fi; }
require VITE_SUPABASE_URL
require VITE_SUPABASE_ANON_KEY

curl -s "$VITE_SUPABASE_URL/rest/v1/users" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" > /dev/null
```

### 8.3 `scripts/media_audit.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

require() { v="$1"; if [[ -z "${!v:-}" ]]; then echo "Missing env: $v" >&2; exit 1; fi; }
require B2_APPLICATION_KEY_ID
require B2_APPLICATION_KEY
require B2_BUCKET
require SUPABASE_DB_URL

echo "Authorizing B2..."
b2 authorize-account "$B2_APPLICATION_KEY_ID" "$B2_APPLICATION_KEY" >/dev/null

echo "Fetching Supabase media_locations..."
urls=$(psql "$SUPABASE_DB_URL" -Atc "select url from public.media_locations order by uploaded_at desc")

echo "Listing B2 objects..."
b2 ls "$B2_BUCKET" --long --recursive > /tmp/b2_list.txt

missing=0
while IFS= read -r url; do
  file=$(basename "$url")
  if ! grep -q "$file" /tmp/b2_list.txt; then
    echo "MISSING: $url"
    ((missing++)) || true
  fi
done <<< "$urls"

echo "Audit complete. Missing files: $missing"
```

### 8.4 `scripts/supabase_status.sql` (consolidated status collection)
```sql
-- Table counts
with counts as (
  select 'users' as table_name, count(*) as rows from public.users union all
  select 'media_locations', count(*) from public.media_locations union all
  select 'milestones', count(*) from public.milestones union all
  select 'admin_posts', count(*) from public.admin_posts union all
  select 'photo_matchups', count(*) from public.photo_matchups
)
select * from counts;

-- Latest IDs (for FK sanity)
select 'users' as table_name, id, created_at from public.users order by created_at desc limit 10;
select 'media_locations' as table_name, id, uploaded_at from public.media_locations order by uploaded_at desc limit 10;
select 'milestones' as table_name, id, event_date from public.milestones order by event_date desc limit 10;
select 'admin_posts' as table_name, id, posted_at from public.admin_posts order by posted_at desc limit 10;
```

### 8.5 `scripts/migrate_content.sh` (kept, trimmed to implemented steps)
```bash
#!/usr/bin/env bash
set -euo pipefail
# Prepares markdown files for Decap CMS (manual SourcePro migration + public sources)

require() { v="$1"; if [[ -z "${!v:-}" ]]; then echo "Missing env: $v" >&2; exit 1; fi; }
mkdir -p content/milestones content/admin_posts

# Example stub: create one milestone from an existing source record (fill content as needed)
cat > content/milestones/1941-07-04-gehrig-day.md <<'EOF'
---
title: "Lou Gehrig Day at Yankee Stadium"
event_date: "1941-07-04"
description: "Ceremonies honoring Lou Gehrig."
media_url: "https://f000.backblazeb2.com/file/LouGehrigFanClub/milestones/gehrig_day_1941.jpg"
---
EOF

echo "Content scaffold generated under content/"
```

> All scripts include **env var checks**, **no secret logging**, and **fail fast** behavior.

---

## 9) Frontend Integration Notes (as built)
- Supabase client initialized with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `src/lib/supabase.ts`.
- Milestones page fetches `public.milestones` ordered by `event_date` with join to `media_locations` for images.
- Admin dashboard gated by role (`admin`) via Supabase Auth JWT claims; write actions call Supabase via REST/RPC.

---

## 10) Operational Runbook (day‑to‑day)
- **Weekly:** Run vendor report (GitHub Action) → check artifact.
- **Monthly:** Restore a DB backup into staging; run `scripts/supabase_status.sql` to confirm counts.
- **Before big deploy:** Run `media_audit.sh`; ensure 0 missing media.
- **Incident:** If images 404, check B2 auth, object path, and Decap front‑matter URLs; re‑sync if needed.
- **DNS change:** Follow Cloudflare runbook (§6.1).

---

## 11) Chronological Project Record (Success‑Only, Meeting‑Minutes Style)

### May 2025
- **2025‑05‑12** — Project initialized. Stack locked to GitHub + Netlify + Supabase + B2. Repo created. Netlify connected.

### June 2025
- **2025‑06‑04** — Homepage sections approved (carousel, milestones, admin posts). Membership tiers (Bronze/Silver/Gold) recorded. Decap CMS approach confirmed.

### July 2025
- **2025‑07‑10** — Supabase core tables created (`users`, `media_locations`, `milestones`, `admin_posts`, `photo_matchups`). Initial RLS enabled.
- **2025‑07‑31** — Canonical insert harness validated; NOT NULL & FKs enforced. Schema considered stable.

### August 2025
- **2025‑08‑02** — Backblaze B2 bucket provisioned (`LouGehrigFanClub`), public read, folder structure finalized; sample object verified.
- **2025‑08‑04** — Automation online: `vendor_report.sh`, `supabase_keepalive.sh`, `media_audit.sh`. GitHub Actions scheduled (deploy, keepalive, vendor‑report).

---

## 12) Verification Commands (copy/paste)

**Supabase REST health:**
```bash
curl -s "$VITE_SUPABASE_URL/rest/v1" -H "apikey: $VITE_SUPABASE_ANON_KEY" -o /dev/null -w "%{http_code}\n"
```

**DB quick status (requires psql):**
```bash
psql "$SUPABASE_DB_URL" -f scripts/supabase_status.sql
```

**B2 quick check:**
```bash
b2 authorize-account "$B2_APPLICATION_KEY_ID" "$B2_APPLICATION_KEY"
b2 ls "$B2_BUCKET" --long --maxFileCount 5
```

---

## 13) Appendix — Role & Access Matrix

| Area             | Role        | Capability                              |
|------------------|-------------|------------------------------------------|
| Public Site      | anonymous   | Read milestones, admin posts             |
| CMS (Decap)      | editor      | Create/update content via Git commits    |
| Admin Dashboard  | admin       | Approve posts, manage milestones         |
| Media Upload     | authenticated | Insert into `media_locations`            |
| DB Changes       | admin/dev   | Migrations, RLS changes via SQL          |

---

## 14) Appendix — File/Folder Conventions
- `content/milestones/*.md` — front‑matter fields: `title`, `event_date`, `description`, `media_url`
- B2 object keys mirror CMS paths where possible (`/milestones/<file>`).

---

## 15) Appendix — Known Good Versions
- Node 20.x, Netlify CLI 17+, B2 CLI v3‑compatible, psql 14+

---

_End of v3. This file is exhaustive by design and intended for direct hand‑off._
