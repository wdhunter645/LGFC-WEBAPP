# Monthly Full Backups

## 📅 Schedule
- **Frequency**: Monthly on the 1st at 4 AM UTC
- **Content**: Complete database dump (schema + data)
- **Retention**: 13 months

## 📁 Files
Full backup files are stored here with format: `full_backup_YYYYMMDD_HHMMSS.sql`

## 🔄 Automation
- **Workflow**: `supabase-backup-monthly.yml`
- **Cleanup**: Automatic deletion after 13 months
- **Purpose**: Long-term archival and disaster recovery

## 📊 Expected File Count
- **Active files**: ~13 (one per month)
- **Total size**: Large (full database dump)