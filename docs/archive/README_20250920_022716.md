# Schema Monitoring

This directory contains database schema monitoring and drift detection reports.

## Files

- **baseline_schema.sql** - Baseline schema for comparison
- **current_schema_*.sql** - Current schema snapshots (automatically cleaned up, keeps last 5)
- **drift-report.log** - Schema drift detection reports
- **TROUBLESHOOTING.md** - Comprehensive troubleshooting guide for maintainers

## Schema Drift Detection

The workflow runs every 4 hours to detect changes in the database schema structure. It:

- Compares current schema against the baseline
- Identifies additions, removals, and modifications
- Validates required tables exist
- Checks Row Level Security (RLS) policies
- Reports security-related schema issues
- **Separates infrastructure failures from actual schema drift**

## Recent Improvements

✅ **Fixed False Positive Alerts**: Infrastructure failures no longer create schema drift issues
✅ **Updated Supabase CLI Installation**: Uses correct installation method (`https://get.supabase.com`)
✅ **Enhanced Error Handling**: Proper secret validation and error reporting
✅ **Separate Infrastructure Alerts**: Workflow failures create distinct issues with `workflow-infrastructure` label
✅ **Better Issue Classification**: Different priorities and labels for different types of issues

## Baseline Management

The baseline schema is automatically created on first successful run. To update the baseline (after approved schema changes), run the workflow manually via `workflow_dispatch`.

## Alert Types

### Schema Drift Alerts (`schema-drift` label)
- Actual database schema changes detected
- High/Critical priority based on severity
- Requires review and potential baseline update

### Infrastructure Failure Alerts (`workflow-infrastructure` label)  
- Workflow setup, connectivity, or configuration issues
- Medium priority
- Requires infrastructure troubleshooting

## Quick Actions

```bash
# Update baseline after approved changes
gh workflow run schema-drift-detection.yml

# Check recent workflow runs
gh run list --workflow=schema-drift-detection.yml --limit=5

# View current drift report
cat schema-monitoring/drift-report.log
```

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).