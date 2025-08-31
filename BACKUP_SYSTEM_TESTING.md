# Backup System Testing & Validation Guide

## 🚀 Quick Start Testing

### 1. Test Bot Operational Status
```bash
# Run health check test
gh workflow run backup-operational-test.yml -f test_scenario=health-check

# Check results in Actions tab or view committed results:
# test-results/operational-test.log
```

### 2. Test Backup Monitoring
```bash
# Manual trigger of monitoring workflow
gh workflow run supabase-backup-monitor-restore.yml

# Check monitoring reports:
cat audit-reports/backup-monitor.log
cat audit-reports/backup-bot-status.json
```

### 3. Test Restoration Capability
```bash
# Safe restoration test (doesn't affect production)
gh workflow run supabase-backup-monitor-restore.yml -f test_mode=true -f force_restore=true

# Check restoration test results in:
# backups/restore-tests/restore-test-*.log
```

## 🧪 Test Scenarios

### Scenario 1: Healthy System Test
**Expected Result**: Health score 3/3, no issues, no alerts
```bash
gh workflow run backup-operational-test.yml -f test_scenario=health-check
```

### Scenario 2: Backup Failure Simulation
**Expected Result**: Identifies stale/missing backups, creates appropriate alerts
```bash
gh workflow run backup-operational-test.yml -f test_scenario=failure-simulation
```

### Scenario 3: Restoration Readiness
**Expected Result**: Validates latest backup can be restored
```bash
gh workflow run backup-operational-test.yml -f test_scenario=restoration-test
```

## 🔍 Monitoring Validation

### Check Automated Monitoring
1. **Schedule Validation**: Monitoring runs every 4 hours
2. **Health Scoring**: 0-3 scale based on backup availability
3. **Issue Creation**: Automatic alerts for failures
4. **Status Tracking**: JSON status file updated each run

### Key Files to Monitor
- `audit-reports/backup-monitor.log` - Detailed health reports
- `audit-reports/backup-bot-status.json` - Current operational status  
- `backups/restore-tests/` - Restoration test logs
- GitHub Issues with labels: `backup-failure`, `backup-warning`

## 🚨 Incident Response Testing

### Test Critical Alert Creation
1. Temporarily rename a backup directory: `mv backups/daily backups/daily-temp`
2. Trigger monitoring: `gh workflow run supabase-backup-monitor-restore.yml`
3. Verify critical issue is created with `priority:critical` label
4. Restore directory: `mv backups/daily-temp backups/daily`

### Test Warning Alert Creation  
1. Create old backup files that exceed freshness thresholds
2. Trigger monitoring workflow
3. Verify warning issue is created with `priority:medium` label

## 🔄 Restoration Testing

### Safe Test Mode
```bash
# Tests restoration logic without affecting production
gh workflow run supabase-backup-monitor-restore.yml -f test_mode=true
```

### Force Restoration Test
```bash
# Tests actual restoration capability (use carefully)
gh workflow run supabase-backup-monitor-restore.yml -f force_restore=true
```

## ✅ Validation Checklist

### Initial Setup
- [ ] All workflows are present in `.github/workflows/`
- [ ] Bot configuration exists at `.github/backup-bot-config.md`
- [ ] Issue template created for backup incidents
- [ ] Documentation updated with restoration procedures

### Functional Testing
- [ ] Monitoring workflow runs without errors
- [ ] Health scoring calculates correctly (0-3 scale)
- [ ] Issue creation works for critical/warning scenarios
- [ ] Restoration testing validates backup files
- [ ] Operational tests pass all scenarios

### Integration Testing  
- [ ] Works with existing backup workflows
- [ ] Integrates with existing audit system
- [ ] Uses existing Supabase authentication
- [ ] Commits reports to repository correctly

### Documentation Validation
- [ ] Troubleshooting procedures are clear
- [ ] Restoration steps are documented
- [ ] Bot configuration is comprehensive
- [ ] Issue templates provide good structure

## 📊 Expected Behavior

### Normal Operation (Health Score 3/3)
- Daily backups within 48 hours ✅
- Weekly backups within 8 days ✅  
- Monthly backups within 35 days ✅
- No issues created
- Status: `"operational": true`

### Warning State (Health Score 2/3)
- One backup type stale but not critical ⚠️
- Medium priority issue created
- Status: `"operational": true`

### Critical State (Health Score < 2)
- Multiple backup failures 🚨
- High priority issue created with detailed diagnostics
- Restoration testing attempted
- Status: `"operational": true` but with critical issues

## 🛠️ Troubleshooting Tests

### Test Secret Configuration
```bash
# Verify Supabase token is configured
gh secret list | grep SUPABASE_ACCESS_TOKEN
```

### Test Workflow Permissions
```bash  
# Check if workflows can create issues
gh api repos/:owner/:repo/actions/permissions
```

### Test Backup Directory Structure
```bash
# Validate backup structure
ls -la backups/
find backups/ -name "*.sql" -mtime -7
```

## 📝 Test Results Documentation

After running tests, document results in:
- `test-results/operational-test.log` - Operational test outcomes
- `audit-reports/backup-monitor.log` - Monitoring results
- `audit-reports/backup-bot-status.json` - Current status
- GitHub Issues - Automated alert functionality

## 🎯 Success Criteria

✅ **System is working correctly if:**
1. Health checks run every 4 hours without errors
2. Backup failures trigger appropriate issues
3. Restoration testing validates backup integrity
4. Documentation is comprehensive and actionable
5. Operational tests pass all scenarios
6. Bot status shows `"operational": true`

❌ **System needs attention if:**
1. Workflows fail with authentication errors
2. Health scoring is incorrect
3. Issues are not created for failures  
4. Restoration tests fail
5. Operational tests show missing components
6. Bot status shows critical issues

---

**Next Steps**: Run the validation tests above to confirm the system is working properly in your environment.