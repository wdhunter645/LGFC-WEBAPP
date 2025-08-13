# Weekly Full Backups

## 📅 Schedule
- **Frequency**: Weekly on Sunday at 3 AM UTC
- **Content**: Complete database dump (schema + data)
- **Retention**: 8 weeks

## 📁 Files
Full backup files are stored here with format: `full_backup_YYYYMMDD_HHMMSS.sql`

## 🔄 Automation
- **Workflow**: `supabase-backup-weekly.yml`
- **Cleanup**: Automatic deletion after 8 weeks
- **Purpose**: Weekly recovery points

## 📊 Expected File Count
- **Active files**: ~8 (one per week)
- **Total size**: Large (full database dump)