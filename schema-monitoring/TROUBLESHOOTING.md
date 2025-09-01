# Schema Drift Detection Troubleshooting Guide

## Overview
The Schema Drift Detection system monitors changes to the Supabase database schema and alerts when unauthorized or unexpected modifications occur.

## How It Works
1. **Scheduled Runs**: Executes every 4 hours automatically
2. **Schema Snapshots**: Creates point-in-time schema dumps using Supabase CLI
3. **Baseline Comparison**: Compares current schema against established baseline
4. **Issue Creation**: Creates GitHub issues for actual schema drift (not infrastructure failures)

## Common Issues and Solutions

### 1. Supabase CLI Installation Failures
**Symptoms**: Workflow fails with "curl: (22) The requested URL returned error: 404" or "supabase: command not found"

**Root Cause**: Incorrect or outdated Supabase CLI installation URL

**Solution**: The workflow now uses the official installation method (`https://get.supabase.com`)

### 2. Missing Repository Secrets
**Symptoms**: Workflow fails with "SUPABASE_ACCESS_TOKEN secret not configured" or similar

**Required Secrets**:
- `SUPABASE_ACCESS_TOKEN`: Personal access token for Supabase CLI authentication
- `SUPABASE_PROJECT_REF`: Project reference ID (currently: `vkwhrbjkdznncjkzkiuo`)

**Setup**:
1. Go to Repository Settings → Secrets and variables → Actions
2. Add the required secrets with appropriate values
3. Test with manual workflow run

### 3. False Positive Schema Drift Alerts
**Symptoms**: Issues created for "schema drift" when workflow actually failed due to infrastructure

**Root Cause**: Previous workflow logic created drift issues on any failure

**Solution**: 
- Fixed workflow now separates infrastructure failures from actual schema drift
- Infrastructure failures create separate issues with `workflow-infrastructure` label
- Schema drift issues only created when actual schema changes detected

### 4. Network Connectivity Issues
**Symptoms**: Various curl or network-related errors in workflow logs

**Solutions**:
- Check if GitHub Actions runner can access Supabase services
- Verify Supabase service status
- Consider adding retry logic for transient network issues

## Understanding Alert Types

### Schema Drift Alerts (Label: `schema-drift`)
- **Triggered by**: Actual changes in database schema structure
- **Priority**: High (or Critical if required tables missing)
- **Action Required**: Review changes, approve if legitimate, investigate if unauthorized

### Infrastructure Failure Alerts (Label: `workflow-infrastructure`)
- **Triggered by**: Workflow failures due to setup, networking, or configuration issues
- **Priority**: Medium
- **Action Required**: Fix infrastructure issues, verify secrets, re-run workflow

### Baseline Creation Notifications
- **Triggered by**: First successful run when no baseline exists
- **Priority**: High (for visibility)
- **Action Required**: Verify baseline is correct, no further action needed

## Manual Operations

### Updating Schema Baseline (After Approved Changes)
```bash
# Trigger workflow manually to update baseline
gh workflow run schema-drift-detection.yml
```

### Testing Schema Detection
```bash
# Manual workflow run
gh workflow run schema-drift-detection.yml

# Check workflow status
gh run list --workflow=schema-drift-detection.yml --limit=5
```

### Viewing Current Schema Status
```bash
# Check latest drift report
cat schema-monitoring/drift-report.log

# List schema snapshots
ls -la schema-monitoring/current_schema_*.sql

# View baseline schema
cat schema-monitoring/baseline_schema.sql
```

## Expected File Structure
```
schema-monitoring/
├── README.md                    # Documentation
├── baseline_schema.sql          # Reference schema for comparison
├── current_schema_YYYYMMDD_HHMMSS.sql  # Current snapshots (auto-cleaned)
└── drift-report.log            # Latest drift detection report
```

## Workflow Schedule
- **Frequency**: Every 4 hours (`0 */4 * * *`)
- **Manual Trigger**: Available via `workflow_dispatch`
- **Retention**: Keeps last 5 schema snapshots

## Required Database Tables
The workflow checks for these essential tables:
- `events`
- `faq_items` 
- `visitors`
- `visitor_votes`
- `search_state`
- `content_items`

Missing required tables will cause workflow failure and create critical priority issues.

## Security Checks
- **Row Level Security (RLS)**: Warns if tables found without RLS policies
- **Schema Changes**: Tracks all structural modifications
- **Unauthorized Access**: Helps detect unexpected schema modifications

## Troubleshooting Steps

1. **Check Recent Workflow Runs**:
   - Go to Actions → Schema Drift Detection
   - Review logs for specific error messages

2. **Verify Repository Secrets**:
   - Settings → Secrets and variables → Actions
   - Ensure `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` are set

3. **Test Supabase Connectivity**:
   ```bash
   supabase login
   supabase link --project-ref vkwhrbjkdznncjkzkiuo
   supabase db dump --schema-only
   ```

4. **Manual Schema Comparison**:
   ```bash
   diff schema-monitoring/baseline_schema.sql schema-monitoring/current_schema_*.sql
   ```

## Contact and Support
- **Infrastructure Issues**: Check with ops-bot or repository maintainers
- **Schema Questions**: Review with database administrators
- **Workflow Updates**: Coordinate with DevOps team

---
*Last Updated: 2025-01-15*
*Workflow Version: Enhanced with infrastructure failure separation*