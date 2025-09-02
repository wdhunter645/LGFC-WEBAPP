# Backup System Troubleshooting Guide

## 🚨 Recent Fixes Applied

### Fixed Issues:
- ✅ **Supabase CLI Installation**: Fixed 404 error by using GitHub releases
- ✅ **Authentication Validation**: Added proper secret validation
- ✅ **Backup Validation**: Added file size and content checks  
- ✅ **Error Handling**: Improved error messages and debugging
- ✅ **Git Operations**: Better handling of commits and pushes
- ✅ **Legacy Cleanup**: Removed outdated `backup_schema.sh`

## 🔧 Required Configuration

### GitHub Repository Secrets
The backup system requires the following secret to be configured:

```
SUPABASE_ACCESS_TOKEN=<your_supabase_access_token>
```

**How to get your Access Token:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile (bottom left)
3. Go to "Access Tokens"
4. Create a new token or copy existing one
5. Add it as a repository secret in GitHub

**How to add the secret:**
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `SUPABASE_ACCESS_TOKEN`
5. Value: Your token from Supabase

## 🚩 Common Issues & Solutions

### Issue: "SUPABASE_ACCESS_TOKEN secret is not configured"
**Solution:** Add the secret as described above.

### Issue: "Failed to authenticate with Supabase"
**Possible causes:**
- Token is invalid or expired
- Token doesn't have necessary permissions
- Network connectivity issues

**Solution:** 
1. Generate a new access token in Supabase Dashboard
2. Update the GitHub repository secret
3. Re-run the workflow

### Issue: "Failed to link to Supabase project"  
**Possible causes:**
- Project reference `vkwhrbjkdznncjkzkiuo` is incorrect
- Token doesn't have access to this project
- Project has been deleted or moved

**Solution:**
1. Verify project exists in Supabase Dashboard
2. Check project reference ID in project settings
3. Ensure token has access to the project

### Issue: "Backup file is too small"
**Possible causes:**
- Database connection failed
- Dump command returned error instead of data
- Database is empty
- Permissions issue

**Solution:**
1. Check Supabase project is accessible
2. Verify database has tables/data
3. Check workflow logs for detailed error messages

## 📊 Monitoring Backup Health

### Automated Monitoring (NEW)
The **Backup Monitor & Restore Bot** runs every 4 hours:
- Go to Actions → "Supabase Backup Monitor & Restore"
- Check `audit-reports/backup-monitor.log` for health status
- Review `audit-reports/backup-bot-status.json` for operational status
- Monitor for automated issue creation on failures

### Daily Monitoring
Check the backup audit workflow runs daily at 6 AM UTC:
- Go to Actions → "Backup Audit - Integrity & Completeness Check"
- Review the latest run for any warnings or errors
- Check the generated audit report

### Manual Backup Verification
You can manually trigger any backup workflow:
1. Go to Actions in your GitHub repository
2. Select the backup workflow (Daily/Weekly/Monthly)
3. Click "Run workflow" → "Run workflow"
4. Monitor the execution for any issues

### File Structure Check
Expected backup structure:
```
backups/
├── daily/          # Schema backups, ~14 files
│   ├── schema_backup_20240830_020001.sql
│   └── ...
├── weekly/         # Full backups, ~8 files  
│   ├── full_backup_20240825_030001.sql
│   └── ...
└── monthly/        # Full backups, ~13 files
    ├── full_backup_20240801_040001.sql
    └── ...
```

## 🔄 Backup Schedules

- **Daily Schema**: Every day at 2:00 AM UTC
- **Weekly Full**: Every Sunday at 3:00 AM UTC  
- **Monthly Full**: 1st of every month at 4:00 AM UTC
- **Cleanup**: Every Saturday at 5:00 AM UTC
- **Audit**: Every day at 6:00 AM UTC

## 📈 Performance Expectations

### File Sizes
- **Schema backups**: 1KB - 1MB (depending on schema complexity)
- **Full backups**: 1MB - 100MB+ (depending on data volume)

### Execution Times
- **Schema backup**: 30-60 seconds
- **Full backup**: 1-5 minutes (depending on data size)
- **Cleanup**: 10-30 seconds
- **Audit**: 30-60 seconds

## 🚨 Emergency Procedures

### Automated Backup Failure Response (NEW)
The **Backup Monitor Bot** automatically handles failures:
1. **Detection**: Monitors every 4 hours for backup health
2. **Alert Creation**: Auto-creates GitHub issues for failures
3. **Restoration Testing**: Tests restoration from latest healthy backup
4. **Incident Reporting**: Provides detailed troubleshooting steps

**Manual Override**:
```bash
# Force restoration test
gh workflow run supabase-backup-monitor-restore.yml -f test_mode=true -f force_restore=true

# Emergency restoration (use with caution)
gh workflow run supabase-backup-monitor-restore.yml -f force_restore=true
```

### If All Backups Are Failing
1. Check if `SUPABASE_ACCESS_TOKEN` secret is configured
2. Verify the token is still valid in Supabase Dashboard
3. Check if Supabase project is accessible
4. Review the latest workflow logs for specific error messages
5. Try running a backup workflow manually
6. **NEW**: Check automated issue creation for detailed diagnostics

### Emergency Database Restoration (NEW)
**Critical Situation**: Database corruption or complete data loss

1. **Immediate Assessment**
   ```bash
   # Check bot status and latest healthy backup
   cat audit-reports/backup-bot-status.json
   cat audit-reports/backup-monitor.log | grep "Latest Healthy Backup"
   ```

2. **Prepare for Restoration**
   ```bash
   # Create emergency backup of current state (if possible)
   supabase db dump --file "emergency-backup-$(date +%Y%m%d_%H%M%S).sql"
   ```

3. **Perform Restoration**
   ```bash
   # Using Supabase CLI
   supabase db reset --db-url "postgresql://[your-connection-string]"
   
   # Restore from latest healthy backup
   LATEST_BACKUP=$(cat audit-reports/backup-monitor.log | grep "Latest Healthy Backup" | tail -1 | cut -d: -f2 | xargs)
   psql -d your_database -f "$LATEST_BACKUP"
   ```

4. **Validate Restoration**
   ```bash
   # Test database connectivity
   supabase db pull
   
   # Verify key tables exist
   supabase db lint
   ```

### If Storage Is Growing Too Large
The cleanup workflow should handle this automatically, but if needed:
1. Review retention policies in `backup-cleanup.yml`
2. Run the cleanup workflow manually
3. Check if cleanup is actually deleting old files

### If Backups Are Empty/Corrupted
1. Check Supabase project connectivity
2. Verify database has data
3. Review backup validation logs
4. Check if RLS policies are blocking access
5. **NEW**: Bot will auto-detect and create restoration alerts

## 📞 Getting Help

### Automated Support (NEW)
- **Critical failures** trigger automatic GitHub issue creation with `priority:critical` label
- **Backup warnings** create issues with `priority:medium` label
- Issues include detailed diagnostics and troubleshooting steps
- Bot provides operational status at: `audit-reports/backup-bot-status.json`

### Manual Support
If issues persist:
1. Check the workflow logs in GitHub Actions
2. Review the audit reports in `audit-reports/`
3. **NEW**: Check automated issue creation for similar problems
4. Review bot configuration at `.github/backup-bot-config.md`
5. Verify all configuration is correct
6. Create an issue with:
   - Workflow logs (redacted of sensitive info)
   - Error messages
   - Steps taken to troubleshoot

### Emergency Contacts
- **Tag @copilot** for backup system issues
- Use labels: `ops`, `backup-failure`, `priority:critical` for urgent issues
- Bot automatically creates issues but manual escalation may be needed for complex problems