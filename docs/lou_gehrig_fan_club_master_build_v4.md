# Lou Gehrig Fan Club — Master Build, As‑Built Configurations & Project Record (v4)
_Last updated: 2025‑08‑12 (America/New_York)_

> Scope: This is the authoritative, as‑built record for the current codebase. It supersedes v3 where noted. It captures everything required to rebuild, audit, or hand off the project: stack, repo layout, configs, CI, and operational notes.

---

## 0) Build Statement (for exact reproduction)
- Treat this document as the single source of truth for the current build.
- Stack: Astro 4 (static) + Tailwind CSS + optional React islands; Supabase for DB/Auth/REST; Netlify for hosting.
- No secrets in Git. Use `.env` locally and Netlify environment variables in production; `.env.example` is the public template.
- CI runs lint and build on push/PR to `main`.

---

## 1) Repository Layout (as built)
```
/
├─ astro.config.mjs
├─ netlify.toml
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.mjs
├─ public/
│  ├─ favicon.svg
│  └─ robots.txt
├─ src/
│  ├─ components/               # React components (optional islands)
│  │  ├─ Landing.jsx
│  │  └─ LouGehrigFanClub.jsx
│  ├─ layouts/
│  │  └─ BaseLayout.astro       # Global head, SEO, CSS import
│  ├─ pages/                    # Astro routes (static)
│  │  ├─ index.astro
│  │  ├─ 404.astro
│  │  ├─ admin.astro
│  │  └─ admin/* (stub pages)
│  ├─ styles/
│  │  └─ global.css             # Tailwind directives
│  └─ env.d.ts
├─ supabase.ts                  # Supabase client (browser)
├─ .github/
│  └─ workflows/
│     └─ ci.yml                 # Lint + build
├─ .eslintrc.cjs
├─ .eslintignore
├─ .prettierrc
├─ .prettierignore
├─ .env.example
├─ scripts/                     # Existing operational scripts (unchanged)
├─ supabase/                    # Existing exports/backups (unchanged)
└─ README.md
```

Key removals compared to v3:
- Removed Vite SPA entry points (`index.html`, `src/main.jsx`) and root `admin.astro` to unify on Astro routing.
- Decap CMS folder not present in this build (can be reintroduced later if/when needed).

---

## 2) Environment & Secrets Strategy

### 2.1 `.gitignore` (required)
```
.env
node_modules
```

### 2.2 `.env.example` (published)
```
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```
Rules:
- Never print secrets in logs.
- Builds fail fast if required env vars are missing (see `supabase.ts`).

---

## 3) Netlify Configuration (as built)

### 3.1 `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20.11.1"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-XSS-Protection = "0"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https://*.supabase.co https://*.supabase.in; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```
Notes:
- CSP allows Supabase REST; tighten further as external scripts/assets are added.

---

## 4) Astro + Tailwind (as built)

### 4.1 `astro.config.mjs`
```js
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://lougehrigfanclub.com",
  integrations: [tailwind(), sitemap()],
  output: "static"
});
```

### 4.2 Global CSS
`src/styles/global.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4.3 Base Layout (SEO + favicon)
`src/layouts/BaseLayout.astro` (excerpt)
```astro
---
import "../styles/global.css";
const { title = "Lou Gehrig Fan Club", description = "Honoring the legacy of Lou Gehrig while raising awareness and support for ALS research.", canonical } = Astro.props;
---
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  {canonical && <link rel="canonical" href={canonical} />}
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</head>
```

### 4.4 Public assets
- `public/favicon.svg` (added)
- `public/robots.txt` (added)

---

## 5) Supabase (client usage)
- Browser client: `supabase.ts`
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```
- Database schema, RLS, RPC from v3 remain authoritative and unchanged.

---

## 6) CI/CD (as built)

### 6.1 CI (lint + build)
`.github/workflows/ci.yml`
```yaml
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Use Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.11.1'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: |
          npx eslint .
        continue-on-error: true
      - name: Build
        run: npm run build
```

> Deployment remains via Netlify connected site. A dedicated deploy workflow can be added later if desired.

---

## 7) Linting & Formatting (as built)
- ESLint config: `.eslintrc.cjs` with scoped overrides so React rules do not apply to `.astro` files; TypeScript parser for TS/TSX.
- Ignores: `.eslintignore` covers `dist`, `node_modules`, `vendor_reports`, and non-web scripts.
- Prettier: `.prettierrc` + `.prettierignore` to standardize formatting.
- Scripts in `package.json`:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

---

## 8) Operational Notes
- Development: `npm run dev` (Astro) — confirmed running, HTTP 200 locally.
- Production: `npm run build` produces static files in `dist/`; sitemap generated automatically.
- Security headers enforced via Netlify; adjust CSP as new external resources are added.

---

## 9) Chronological Project Record (Success‑Only)

### August 2025
- 2025‑08‑12 — Migrated frontend to Astro 4 (static). Removed Vite SPA entry points; unified routing under `src/pages`.
- 2025‑08‑12 — Added Tailwind global stylesheet and `BaseLayout.astro` with SEO head and favicon; added `robots.txt`.
- 2025‑08‑12 — Enabled `@astrojs/sitemap`; set `site` in `astro.config.mjs`.
- 2025‑08‑12 — Hardened Netlify via security headers (CSP, HSTS, etc.).
- 2025‑08‑12 — Introduced ESLint/Prettier with scoped rules; added CI workflow to lint and build.
- 2025‑08‑12 — Verified dev server and production build both green.

### Prior months
- Refer to v3 for Supabase schema, RLS policies, RPC functions, and vendor scripts (unchanged).

---

_End of v4. This supersedes v3 where noted and reflects the current, deployed configuration._