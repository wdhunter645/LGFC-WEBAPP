# 🗂️ Supabase Backup System - Quick Reference

## System Overview
Automated Supabase database backups to GitHub with configurable retention policies.

## 📅 Backup Schedule
| Type | Frequency | Time | Retention |
|------|-----------|------|-----------|
| **Daily Schema** | Every day | 2 AM UTC | 14 days |
| **Weekly Full** | Every Sunday | 3 AM UTC | 8 weeks |
| **Monthly Full** | 1st of month | 4 AM UTC | 13 months |
| **Cleanup** | Every Saturday | 5 AM UTC | - |

## 🔧 Configuration Status
- ✅ Workflows configured
- ✅ CLI installation fixed  
- ✅ Directory structure ready
- ⚙️ **Need:** `SUPABASE_ACCESS_TOKEN` secret

## 🚀 Manual Testing
```bash
# Go to GitHub Actions
# Select: "Supabase Daily Schema Backup"  
# Click: "Run workflow" → "Run workflow"
```

## 📁 Output Locations
```
backups/
├── daily/schema_backup_YYYYMMDD_HHMMSS.sql
├── weekly/full_backup_YYYYMMDD_HHMMSS.sql  
└── monthly/full_backup_YYYYMMDD_HHMMSS.sql
```

## 🚨 Troubleshooting
- **Access Token Issues**: See `BACKUP_TROUBLESHOOTING.md`
- **Workflow Failures**: Check Actions logs
- **Missing Backups**: Verify project ID: `vkwhrbjkdznncjkzkiuo`

## 📚 Documentation Files
- `BACKUP_TROUBLESHOOTING.md` - Complete guide
- `SUPABASE_BACKUP_STATUS.md` - Configuration status
- `backups/README.md` - System overview

**Status**: ✅ Ready (needs access token)