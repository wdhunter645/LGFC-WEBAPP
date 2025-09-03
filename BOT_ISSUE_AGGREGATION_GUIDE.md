# 🤖 Bot Issue Aggregation System

## Overview

The **Bot Issue Aggregation System** consolidates all automated bot findings into a single tracking issue, providing centralized visibility and management of system health alerts.

## Purpose

Instead of creating individual issues for each bot finding, this system aggregates:
- **Security vulnerabilities** (CodeQL, dependency scans)
- **Workflow failures** (CI/CD, automation breakdowns) 
- **Dependabot alerts** (outdated dependencies, security patches)
- **Configuration issues** (infrastructure, deployment problems)
- **Automated quality checks** (code analysis, performance alerts)

## How It Works

### 1. Automated Daily Scanning
- **Schedule**: Runs daily at 4:00 AM UTC via `aggregate-bot-issues.yml`
- **Detection**: Scans for bot-generated issues from the past 24 hours
- **Identification**: Recognizes bot issues by labels and patterns:
  - `workflow-failure`, `security`, `vulnerability`
  - `dependency`, `automated`, `ops-bot-assigned`
  - `backup`, `priority:critical`, `priority:high`
  - Dependabot PRs/issues (by author: `app/dependabot`)

### 2. Centralized Tracking Issue
- **Title**: "Bot Issue Tracker"
- **Label**: `bot-tracking`
- **Auto-creation**: Created automatically if none exists
- **Persistence**: Remains open to collect ongoing findings

### 3. Intelligent Categorization
Issues are automatically categorized by priority:

- 🔴 **Critical**: Immediate action required (security vulnerabilities, system down)
- 🟠 **High**: Action needed within 24-48 hours (workflow failures, major issues)  
- 📦 **Dependencies**: Dependency updates and vulnerability patches
- 🟡 **Other**: General bot findings for maintenance windows

### 4. Rich Reporting
Each scan generates detailed comments including:
- Issue links and creation timestamps
- Priority categorization and action items
- Status summaries ("all clear" when no issues found)
- Next scan schedule information

## Manual Usage

### Trigger Manual Scan
```yaml
# GitHub Actions → aggregate-bot-issues → Run workflow
inputs:
  lookback_hours: "48"        # Scan past 48 hours
  force_create_tracker: true  # Force new tracker creation
```

### Workflow Dispatch Parameters
- **`lookback_hours`** (default: 24): Hours to look back for bot issues
- **`force_create_tracker`** (default: false): Create new tracker even if one exists

## Integration with Existing Bots

### Compatible Bot Systems
This system works alongside existing automation:
- **Security Scans** (`security-scans.yml`)
- **Workflow Failure Detection** (`workflow-failure-detector.yml`) 
- **Automated Issue Resolver** (`automated-issue-resolver.yml`)
- **Ops Bot** (`ops-bot.yml`)
- **Dependabot** (GitHub's dependency management)

### Issue Processing
1. Individual bot workflows continue to create issues normally
2. Aggregation workflow scans and identifies bot-generated issues
3. Summaries are added to the central tracker
4. Individual issues are labeled with `bot-tracked` for reference
5. Original issues remain open for specific investigation/fixes

## Status Indicators

### Daily Status Updates
- ✅ **All Clear**: No bot issues found in scan period
- 📊 **Issues Found**: Categorized summary with action items
- 🔗 **Links**: Direct navigation to individual issues

### Priority Action Items
- **🔴 URGENT**: Review critical issues immediately
- **🟠 HIGH**: Address high priority issues within 24-48 hours
- **📦 DEPENDENCIES**: Review dependency updates during maintenance
- **🟡 MAINTENANCE**: Address other findings in next maintenance window

## Benefits

### For Operations Teams
- **Single View**: All bot findings in one place
- **Prioritized Action**: Clear priority levels for triage
- **Historical Tracking**: Complete timeline of automated findings
- **Reduced Noise**: Consolidates multiple bot alerts

### For Development Teams  
- **Context Awareness**: Understand system health at a glance
- **Efficient Triage**: Focus on highest priority items first
- **Trend Analysis**: Identify patterns in automated findings
- **Maintenance Planning**: Group related fixes for efficiency

## File Structure

```
.github/workflows/
└── aggregate-bot-issues.yml    # Main aggregation workflow

Workflow Features:
├── Schedule: Daily 4:00 AM UTC
├── Manual Dispatch: Configurable lookback period
├── Issue Detection: Multi-label bot identification
├── Smart Categorization: Priority-based grouping  
├── Rich Reporting: Detailed summaries with links
└── Issue Tracking: Labels processed issues
```

## Best Practices

### For Repository Maintainers
1. **Review Tracker Daily**: Check the Bot Issue Tracker for new findings
2. **Prioritize by Color**: Address red (critical) items immediately
3. **Batch Process**: Group similar fixes for efficiency
4. **Monitor Trends**: Watch for recurring patterns indicating systemic issues

### For Bot Development
1. **Use Standard Labels**: Ensure bot-generated issues use recognized labels
2. **Include Timestamps**: Help aggregation identify recent issues
3. **Clear Titles**: Use descriptive titles that indicate severity/type
4. **Consistent Patterns**: Follow established bot naming conventions

## Troubleshooting

### Common Issues
- **Tracker Not Found**: Workflow will create new tracker automatically
- **Missing Bot Issues**: Check that bot workflows use standard labels
- **Duplicate Tracking**: Force recreation with `force_create_tracker: true`

### Manual Fixes
- **Re-run Aggregation**: Use manual dispatch to scan different time periods  
- **Label Issues**: Manually add `bot-tracking` label to issues if needed
- **Reset Tracker**: Close existing tracker and run with force_create_tracker

---

*This documentation covers the Bot Issue Aggregation System implemented via `aggregate-bot-issues.yml`*