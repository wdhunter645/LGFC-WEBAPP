# Daily Schema Backups

## 📅 Schedule
- **Frequency**: Daily at 2 AM UTC
- **Content**: Database schema only (no data)
- **Retention**: 14 days

## 📁 Files
Schema backup files are stored here with format: `schema_backup_YYYYMMDD_HHMMSS.sql`

## 🔄 Automation
- **Workflow**: `supabase-backup-daily.yml`
- **Cleanup**: Automatic deletion after 14 days
- **Purpose**: Quick schema recovery and version tracking

## 📊 Expected File Count
- **Active files**: ~14 (one per day)
- **Total size**: Small (schema only)