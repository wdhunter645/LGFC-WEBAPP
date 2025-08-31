# Supabase Backup System

This directory contains automated backups of the Lou Gehrig Fan Club Supabase database.

## 📁 Backup Structure

### `/daily/` - Schema Backups
- **Schedule**: Daily at 2 AM UTC
- **Content**: Database schema only (no data)
- **Retention**: 14 days
- **Purpose**: Quick schema recovery and version tracking

### `/weekly/` - Full Backups  
- **Schedule**: Weekly on Sunday at 3 AM UTC
- **Content**: Complete database dump (schema + data)
- **Retention**: 8 weeks
- **Purpose**: Weekly recovery points

### `/monthly/` - Full Backups
- **Schedule**: Monthly on the 1st at 4 AM UTC  
- **Content**: Complete database dump (schema + data)
- **Retention**: 13 months
- **Purpose**: Long-term archival and disaster recovery

## 🔄 Automation

### Backup Jobs
- **Daily Schema**: `supabase-backup-daily.yml`
- **Weekly Full**: `supabase-backup-weekly.yml`  
- **Monthly Full**: `supabase-backup-monthly.yml`

### Cleanup Job
- **Schedule**: Weekly on Saturday at 5 AM UTC
- **Workflow**: `backup-cleanup.yml`
- **Function**: Enforces retention policies by deleting expired backups

## 📊 Retention Summary

| Backup Type | Frequency | Retention | Files Kept |
|-------------|-----------|-----------|------------|
| Daily Schema | Daily | 14 days | ~14 files |
| Weekly Full | Weekly | 8 weeks | ~8 files |
| Monthly Full | Monthly | 13 months | ~13 files |

## 🔧 Manual Operations

### Automated Monitoring & Restoration (NEW)
The backup system now includes automated monitoring and restoration:

```bash
# Check automated monitoring status
cat audit-reports/backup-bot-status.json

# Test restoration capability
gh workflow run supabase-backup-monitor-restore.yml -f test_mode=true

# Force restoration test (emergency)
gh workflow run supabase-backup-monitor-restore.yml -f force_restore=true
```

### Trigger Manual Backup
```bash
# Trigger any backup job manually via GitHub Actions
# Go to Actions tab → Select workflow → Run workflow
```

### Restore from Backup
```bash
# Emergency database restoration (use with extreme caution)
# 1. Create emergency backup first:
supabase db dump --file "emergency-backup-$(date +%Y%m%d_%H%M%S).sql"

# 2. Reset database and restore:
supabase db reset --db-url "postgresql://..."
psql -d your_database -f backups/[type]/backup_file.sql

# 3. Validate restoration:
supabase db pull
```

## 🚨 Important Notes

- All backups are stored in this GitHub repository
- Backups are automatically committed and pushed
- Retention policies are automatically enforced
- Backup files are timestamped: `YYYYMMDD_HHMMSS.sql`
- Schema-only backups are much smaller than full backups

## 📈 Monitoring

### Automated Monitoring (NEW)
- **Backup Monitor Bot**: Runs every 4 hours, checks backup health
- **Auto-Restoration**: Tests restoration from latest healthy backup  
- **Issue Creation**: Automatically creates GitHub issues for failures
- **Status Tracking**: `audit-reports/backup-bot-status.json`

### Manual Monitoring
- Check GitHub Actions for backup job status
- Monitor repository size (backups will increase storage)
- Review cleanup logs for retention policy enforcement
- **NEW**: Review `audit-reports/backup-monitor.log` for health reports