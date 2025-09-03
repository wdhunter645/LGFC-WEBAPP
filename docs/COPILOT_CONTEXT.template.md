# 🤖 Copilot Context for LGFC-WEBAPP

## Project Overview
The **Lou Gehrig Fan Club Web Application** is a comprehensive full-stack application built with Astro, React, and Supabase. This application serves as a community hub for Lou Gehrig fans, featuring voting systems, content management, news aggregation, and community features.

## Current Status
- **Active Development**: The project is in active development with continuous integration
- **Production Ready**: Deployed on Netlify with automated preview deployments
- **Comprehensive Automation**: 19+ workflows covering security, backup, monitoring, and deployment

## Architecture
- **Frontend**: Astro with React islands, Tailwind CSS
- **Backend**: Supabase with PostgreSQL database
- **Deployment**: Netlify for frontend, Supabase for backend services
- **Authentication**: JWT-based authentication via Supabase

## Key Features
- Fan voting system for Lou Gehrig-related content
- News aggregation and content management
- Community-driven memorabilia and milestone tracking
- ALS awareness and events integration
- Search functionality with automated content ingestion

## Workflow Categories
1. **Backup & Data Management**: Daily audits, cleanup, validation
2. **Monitoring & Health Checks**: Production site monitoring, schema drift detection
3. **Security**: Vulnerability scans, dependency updates, security reporting
4. **Deployment**: Preview validation, CI/CD automation
5. **Content Automation**: Search indexing, event scraping, engagement features
6. **Operations & Maintenance**: Daily reporting, branch management, support assignment

## Copilot Assignments
- **Security Agent**: Monitors security-scans.yml and dependency-security-updates.yml
- **Ops Bot**: Handles operational readiness workflows and daily reporting
- **Dev Bot**: Manages development automation and issue tracking

## Critical Files
- `OPERATIONAL_READINESS.md`: Complete workflow documentation
- `WORKFLOW_SUPPORT_ASSIGNMENT_SYSTEM.md`: Perpetual tracking framework
- `.github/workflows/`: All automation workflows
- `scripts/`: Operational and maintenance scripts
- `src/`: Application source code
- `supabase/`: Database migrations and functions

## Development Guidelines
- GitHub-first development model
- Automated branch management and cleanup
- Firewall-safe workflow ordering (API access before setup steps)
- Comprehensive security scanning and monitoring
- JWT-only authentication (no environment variables needed)

## Context Recovery
This file serves as the primary context restoration point for GitHub Copilot. If Copilot loses context about the project, this file provides the essential information needed to understand the project structure, current status, and ongoing work.

---

*Last updated by self-repair workflow: Automated restoration ensures this context remains available for Copilot operations.*