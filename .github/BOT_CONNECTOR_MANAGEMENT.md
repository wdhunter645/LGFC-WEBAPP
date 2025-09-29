# 🤖 Bot Connector Management Guide

## Overview
This document manages all GitHub-ChatGPT connectors and AI automation systems to prevent orphaned, hung, or stale connections.

## 📋 Active Bot Connectors

### 1. **GitHub Copilot** (Primary AI Assistant)
- **Status**: ✅ Active and properly configured
- **Configuration**: `.github/copilot-instructions.md`
- **Purpose**: Primary development assistant with full repository context
- **Monitoring**: Manual via IDE integration

### 2. **Workflow Failure Detector** 
- **Status**: ✅ Optimized (reduced from 15min to 2hr frequency)
- **File**: `.github/workflows/workflow-failure-detector.yml`
- **Purpose**: Monitors workflow failures and creates issues
- **Monitoring**: Automated with circuit breaker (max 10 issues/24h)
- **Schedule**: Every 2 hours

### 3. **Bot Issue Aggregator**
- **Status**: ✅ Active 
- **File**: `.github/workflows/aggregate-bot-issues.yml`
- **Purpose**: Consolidates bot findings into single tracking issue
- **Schedule**: Daily at 4 AM UTC

### 4. **Ops Bot**
- **Status**: ✅ Active (manual trigger)
- **File**: `.github/workflows/ops-bot.yml`  
- **Purpose**: Automated troubleshooting and fix proposals
- **Monitoring**: Manual workflow dispatch only

### 5. **Dev Bot**
- **Status**: ⚠️ Minimal use (manual trigger only)
- **File**: `.github/workflows/dev-bot.yml`
- **Purpose**: Development automation examples
- **Monitoring**: Creates temporary files, auto-cleaned

## 🚫 Removed/Cleaned Connectors

### Orphaned Cursor Bot Configs ❌ REMOVED
- **Files**: `.cursor/rules/20-ops-bot.md`, `.cursor/rules/10-dev-bot.md`
- **Reason**: Conflicted with GitHub Copilot, unused configurations
- **Action**: Deleted 2024-09-29

## ⚙️ Circuit Breaker Mechanisms

### Workflow Failure Detector
- **Trigger Limit**: Max 10 failure issues per 24 hours
- **Action**: Skips execution if limit exceeded  
- **Reset**: Automatic after 24 hours
- **Purpose**: Prevents issue spam during widespread failures

## 🔍 Monitoring Guidelines

### Daily Checks
- [ ] Review Bot Issue Tracker for new findings
- [ ] Check workflow runs for any hung processes  
- [ ] Verify no orphaned branches from bot PRs
- [ ] Confirm circuit breakers are functioning

### Weekly Maintenance
- [ ] Review and close resolved bot-generated issues
- [ ] Clean up merged bot PR branches
- [ ] Audit bot workflow frequency and adjust if needed
- [ ] Check for new orphaned configuration files

### Monthly Audit  
- [ ] Full connector inventory review
- [ ] Performance analysis of all bot workflows
- [ ] Update this documentation with any changes
- [ ] Archive old bot-generated issues if resolved

## 🚨 Troubleshooting Stale Connectors

### Signs of Stale Connectors:
1. **Hung Workflows**: Workflows running longer than expected
2. **Orphaned Issues**: Bot-generated issues with no recent activity  
3. **Failed Webhooks**: Repeated webhook delivery failures
4. **Resource Exhaustion**: High API usage from bot activities

### Resolution Steps:
1. **Identify**: Use workflow run logs and issue labels
2. **Isolate**: Disable problematic workflows temporarily
3. **Diagnose**: Check configuration and dependencies  
4. **Fix**: Apply circuit breakers, reduce frequency, or remove
5. **Monitor**: Verify resolution over 24-48 hours

## 📞 Escalation Procedures

### Critical Bot Failures:
1. **Immediate**: Disable affected workflows
2. **Alert**: Create critical priority issue
3. **Investigate**: Use ops-bot for automated diagnosis
4. **Resolve**: Apply fixes via draft PRs
5. **Verify**: Test fixes before enabling workflows

### Emergency Bot Shutdown:
```bash
# Disable all bot workflows (emergency only)
gh workflow disable aggregate-bot-issues.yml
gh workflow disable workflow-failure-detector.yml  
gh workflow disable ops-bot.yml
```

## 📊 Performance Metrics

### Current Bot Activity Levels:
- **workflow-failure-detector**: Every 2 hours (12 runs/day)
- **aggregate-bot-issues**: Daily (1 run/day)  
- **ops-bot**: Manual only (0 scheduled runs)
- **dev-bot**: Manual only (0 scheduled runs)

### Resource Usage Guidelines:
- **Total scheduled runs**: ~13/day (well within GitHub limits)
- **Issue creation rate**: Max 10 failures + 1 tracker/day
- **API calls**: Estimated <1000/day (well within rate limits)

## 🔧 Maintenance Commands

### Check Bot Status:
```bash
# List all bot-related workflows
find .github/workflows -name "*.yml" -exec grep -l "bot\|automated" {} \;

# Check recent bot activity  
gh run list --workflow=workflow-failure-detector.yml --limit=5

# Find bot-generated issues
gh issue list --label=bot-tracking,workflow-failure
```

### Clean Orphaned Data:
```bash  
# Remove temporary bot files
find . -name "*bot*change*" -delete
find . -name "DEV_BOT_CHANGE.txt" -delete

# Clean up merged bot branches (manual review first)
git branch -r | grep "cursor/.*bot" | grep -v "main"
```

---

**Last Updated**: 2024-09-29  
**Next Review**: 2024-10-29  
**Maintained By**: Repository automation system