# 📚 Repository Context - LGFC-WEBAPP

## Repository Identity
- **Name**: LGFC-WEBAPP (Lou Gehrig Fan Club Web Application)
- **Purpose**: Community web application for Lou Gehrig fans
- **Status**: Active development with production deployment
- **Owner**: wdhunter645

## Technology Stack
- **Framework**: Astro 5.x with React islands
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Netlify (Frontend) + Supabase (Backend)
- **CI/CD**: GitHub Actions with 19+ automated workflows

## Repository Structure
```
├── .github/workflows/          # 19+ automation workflows
├── scripts/                    # Operational scripts
├── src/                        # Application source
├── supabase/                   # Database migrations
├── public/                     # Static assets
├── security-scans/             # Security reports
├── audit-reports/              # Backup and health reports
├── OPERATIONAL_READINESS.md    # Complete workflow docs
└── WORKFLOW_SUPPORT_ASSIGNMENT_SYSTEM.md
```

## Key Operational Workflows
1. **Security**: `security-scans.yml`, `dependency-security-updates.yml`
2. **Backup**: `backup-audit.yml`, `supabase-backup-*.yml`
3. **Health**: `health-checks.yml`, `schema-drift-detection.yml`
4. **Content**: `search-cron.yml`, `als-events-scraper.yml`
5. **Operations**: `ops-bot-daily-report.yml`, `branch-audit-cleanup.yml`

## Authentication & Security
- **JWT-only authentication** via Supabase
- No environment variables needed for auth
- Comprehensive security scanning and monitoring
- Automated dependency updates
- Branch audit with firewall-safe operations

## Development Workflow
- Feature branches with automated cleanup
- Pull request previews via Netlify
- Automated testing and linting
- Security scans on all commits
- Comprehensive backup and monitoring

## Critical Documentation
- `OPERATIONAL_READINESS.md`: Master operational documentation
- `WORKFLOW_SUPPORT_ASSIGNMENT_SYSTEM.md`: Accountability framework
- `README.md`: Project overview and setup
- `CONTEXT_TRACKING.md`: Development history tracking
- `lou_gehrig_fan_club_master_build_v5.md`: Technical build details

## Support & Maintenance
- **Copilot Agents**: Assigned to security and operations workflows
- **Automated Reporting**: Daily ops reports and health checks
- **Issue Tracking**: Automated dev-ops issue creation
- **Assignment System**: Quarterly workflow support assignments

## Recovery Information
This context file ensures repository continuity and provides essential information for:
- New team members and contributors
- Copilot context restoration
- Project handoff scenarios
- Operational continuity

---

*This file is automatically maintained by the self-repair workflow system.*