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
├── scripts/                          # Management and utility scripts
│   ├── git_health_check.sh          # Repository health monitoring
│   ├── git_branch_sync.sh           # Branch synchronization
│   ├── git_branch_audit.sh          # Branch audit (shell version)
│   └── git_branch_audit.mjs         # Branch audit (Node.js version)
├── .github/workflows/                # GitHub Actions workflows
│   ├── git-health-check.yml         # Automated health checks
│   └── branch-audit-cleanup.yml     # Branch audit and cleanup
├── audit-reports/                    # Branch audit reports
├── public/                          # Static assets
├── src/                             # Source code (pages, components, lib)
├── BRANCH_AUDIT_DOCUMENTATION.md    # Branch management guide
├── BRANCH_AUDIT_SUMMARY.md          # Latest audit results
├── GIT_TROUBLESHOOTING.md           # Git troubleshooting guide
├── README.md
└── ...
```

---

## 🔧 Branch Management System

This repository includes a comprehensive branch audit and cleanup system to maintain repository health:

### Quick Commands

```bash
# Perform branch audit
node scripts/git_branch_audit.mjs audit

# Generate cleanup script
node scripts/git_branch_audit.mjs cleanup

# Check repository health
./scripts/git_health_check.sh check
```

### Automated Maintenance
- **Weekly Audits**: Automated branch analysis every Monday at 6 AM UTC
- **Smart Cleanup**: Automatically categorizes branches as DELETE, REVIEW, MERGE, or KEEP
- **Safety Features**: Backup procedures and confirmation requirements
- **GitHub Integration**: Automated reporting and issue creation

See [BRANCH_AUDIT_DOCUMENTATION.md](./BRANCH_AUDIT_DOCUMENTATION.md) for complete usage guide.

---

## Running Tests

To run the test suite, use the following command:

```bash
npm test
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
- Automated branch management and cleanup
- Repository health monitoring
- Add UI testing / preview support (future)

---

## 🧭 Project Status

Development is actively in progress. The focus for **July 2025** includes:

- Frontend testing through GitHub
- Schema stability and RLS security
- Connecting user-generated content to display layers
- Repository maintenance automation
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
# Netlify deployment test
