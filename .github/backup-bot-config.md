# Backup Bot Configuration

## Overview
The Backup Bot is an automated system that monitors Supabase backup health and provides immediate troubleshooting and restoration capabilities.

## Bot Capabilities

### 🔍 Monitoring
- **Schedule**: Every 4 hours
- **Scope**: Daily schema, weekly full, and monthly full backups
- **Health Scoring**: 0-3 scale based on backup availability and integrity

### 🚨 Alert System
- **Critical Alerts**: Health score < 2, creates high-priority issues
- **Warning Alerts**: Health score 2, creates medium-priority issues  
- **Status Updates**: Continuous operational status tracking

### 🔄 Restoration
- **Test Mode**: Validates restoration without affecting production
- **Force Mode**: Manual trigger for immediate restoration testing
- **Auto-Detection**: Triggers restoration when backups are missing/corrupted

## Operational Status

### Bot Health Indicators
- ✅ **Operational**: Bot is running and monitoring backups
- ⚠️ **Degraded**: Some backup types failing but bot functional
- ❌ **Critical**: Multiple backup failures requiring immediate attention

### Quick Status Check
```bash
# Check latest bot status
cat audit-reports/backup-bot-status.json

# View latest monitoring report  
cat audit-reports/backup-monitor.log
```

## Troubleshooting Procedures

### 🚨 Critical Backup Failures (Health Score < 2)
**Response Time**: Immediate (2 hours)

1. **Check Supabase Connectivity**
   ```bash
   # Verify SUPABASE_ACCESS_TOKEN secret
   gh secret list | grep SUPABASE
   ```

2. **Manual Backup Trigger**
   ```bash
   # Trigger daily backup
   gh workflow run supabase-backup-daily.yml
   
   # Trigger weekly backup
   gh workflow run supabase-backup-weekly.yml
   ```

3. **Review Workflow Logs**
   - Check [Backup Monitor Workflow](../../actions/workflows/supabase-backup-monitor-restore.yml)
   - Check individual backup workflow logs
   - Look for authentication or connectivity issues

4. **Test Restoration**
   ```bash
   # Test restoration capability
   gh workflow run supabase-backup-monitor-restore.yml -f test_mode=true
   ```

### ⚠️ Backup Warnings (Health Score 2)
**Response Time**: 24 hours

1. **Monitor Trends**
   - Check if issue resolves in next scheduled backup
   - Review backup frequency and retention policies

2. **Preventive Actions**
   - Verify backup schedules are active
   - Check repository storage limits
   - Review cleanup policies

### 🔄 Restoration Procedures

#### Emergency Database Restore
**When to use**: Database corruption, accidental data loss, or complete database failure

1. **Identify Latest Healthy Backup**
   ```bash
   # Check backup health report
   cat audit-reports/backup-monitor.log | grep "Latest Healthy Backup"
   ```

2. **Prepare for Restoration**
   ```bash
   # Backup current state (if possible)
   supabase db dump --file "emergency-backup-$(date +%Y%m%d_%H%M%S).sql"
   ```

3. **Perform Restoration**
   ```bash
   # Using Supabase CLI
   supabase db reset --db-url "postgresql://[connection-string]"
   psql -d your_database -f backups/[type]/backup_file.sql
   ```

4. **Validate Restoration**
   ```bash
   # Test database connectivity and key tables
   supabase db pull
   ```

#### Test Restoration (Non-Production)
```bash
# Run bot in test mode
gh workflow run supabase-backup-monitor-restore.yml -f test_mode=true -f force_restore=true
```

## Bot Notification Logic

### Issue Creation Rules
| Condition | Issue Type | Priority | Labels |
|-----------|------------|----------|--------|
| Health Score < 2 | Critical Alert | High | `ops`, `backup-failure`, `priority:critical` |
| Health Score = 2 | Warning | Medium | `ops`, `backup-warning`, `priority:medium` |
| Restoration Failure | Critical Alert | High | `ops`, `restore-failure`, `priority:critical` |

### Auto-Resolution
- Issues are auto-generated but require manual closure
- Bot updates status but does not auto-close issues
- Provides detailed troubleshooting steps in each issue

## Integration Points

### With Existing Workflows
- **Backup Audit**: Runs after monitoring for comprehensive reporting
- **Ops Bot**: Receives backup failure notifications
- **Security Scans**: Backup integrity affects security posture

### With Supabase
- Uses existing `SUPABASE_ACCESS_TOKEN` secret
- Connects to project: `vkwhrbjkdznncjkzkiuo`
- Leverages Supabase CLI for all operations

## Configuration Parameters

### Workflow Inputs
- `force_restore`: Manual restoration trigger
- `test_mode`: Safe testing without production impact

### Health Score Thresholds
- **3/3**: All backups healthy ✅
- **2/3**: One backup type has issues ⚠️
- **1/3**: Two backup types failing ❌
- **0/3**: All backups failing 🚨

### Timing Parameters
- **Daily Check**: Within 48 hours = healthy
- **Weekly Check**: Within 8 days = healthy  
- **Monthly Check**: Within 35 days = healthy

## Maintenance

### Weekly Tasks
- Review bot operational status
- Check for any persistent warnings
- Verify restoration test results

### Monthly Tasks  
- Review backup retention policies
- Test full restoration procedure
- Update documentation as needed

### Emergency Procedures
1. **Bot Failure**: Check workflow permissions and secrets
2. **False Alerts**: Adjust health score thresholds
3. **Storage Issues**: Review cleanup policies and retention

---

**Last Updated**: $(date)
**Maintained By**: GitHub Actions Automation
**Support**: Create issue with `ops` and `backup-bot` labels