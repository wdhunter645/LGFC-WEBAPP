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

## 🔧 Workflow Automation & Support

This project includes comprehensive workflow automation for monitoring, security, and operational readiness:

### 📊 **Operational Readiness**
- **19 automated workflows** covering backup, health checks, security scans, and deployment
- Comprehensive monitoring with detailed reports and alerting
- See [OPERATIONAL_READINESS.md](OPERATIONAL_READINESS.md) for full documentation

### 🎯 **Workflow Support Assignment System**
- **Perpetual tracking and accountability** for all workflow automation support activities
- **Quarterly assignment issues** automatically created for sustained oversight
- **Structured checklists** for weekly, monthly, and incident response activities
- See [WORKFLOW_SUPPORT_ASSIGNMENT_SYSTEM.md](WORKFLOW_SUPPORT_ASSIGNMENT_SYSTEM.md) for complete framework

### 🛡️ **Key Workflow Categories**
- **Backup & Data Management**: Daily audits, cleanup, and validation
- **Monitoring & Health Checks**: Production site monitoring and schema drift detection
- **Security**: Vulnerability scans and dependency updates
- **Deployment**: Preview validation and CI/CD automation
- **Content Automation**: Search indexing, event scraping, and engagement features

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
# Netlify deployment test
