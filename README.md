# ⚾ LGFC-WEBAPP: Lou Gehrig Fan Club Web Application

This repository contains the source code and schema for the **Lou Gehrig Fan Club** web application, currently under development using **GitHub** (frontend) and **Supabase** (backend).

---

## 📌 Project Overview

- **Frontend:** Built with [GitHub](https://github.com) and Astro, a modern static site framework
- **Backend:** Managed with [Supabase](https://supabase.com) — includes authentication, database, and REST API
- **Hosting & Deployment:** Code changes are committed and version-controlled through GitHub, deployed via Netlify

---

## 📂 Repository Structure

```plaintext
.
├── supabase/
│   └── schema/
│       └── 2025-07-10-export.sql    # Latest schema export (manual backup)
├── public/                          # Static assets (TBD)
├── src/                             # Source code (pages, components, lib)
├── README.md
└── ...
```

---

## 🔗 Supabase Integration

- **Anon Key:** Managed securely in environment variables
- **Row-Level Security (RLS):** Enabled and actively enforced via SQL policies
- **Access Rules:**
  - Public users can view only approved content
  - Authenticated users can submit, update, and manage their own content

---

## 📦 Deployment Workflow

- Updates made in GitHub are deployed via GitHub commits and pushed directly to this repo
- Supabase schema changes are backed up manually in `/supabase/schema/` with date-based filenames
- GitHub serves as the source of truth for version control and disaster recovery

---

## ✅ Best Practices (In Progress)

- Manual Supabase schema export after significant changes
- GitHub-first development model
- Add GitHub Actions to automate backups (future)
- Add UI testing / preview support (future)

---

## 🧭 Project Status

Development is actively in progress. The focus for **July 2025** includes:

- Frontend testing through GitHub
- Schema stability and RLS security
- Connecting user-generated content to display layers
- Preparing for public preview and community feedback

---

## 👥 Maintainer

- **Bill Hunter** — [LouGehrigFanClub.com](https://lougehrigfanclub.com)

---

## 🧾 License

© 2025 Lou Gehrig Fan Club. All rights reserved. Licensing terms pending.

---

📥 **To install this README:**  
Create a new file called `README.md` in your GitHub repo (`LGFC-WEBAPP`), paste in this content, and commit it to `main`.
