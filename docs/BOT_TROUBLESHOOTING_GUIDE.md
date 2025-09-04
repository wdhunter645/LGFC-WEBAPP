# 🤖 Enhanced Bot Troubleshooting & Automation Guide

## Overview

The workflow bots in this repository have been significantly enhanced with automated troubleshooting and PR creation capabilities. This guide explains how to use these new features effectively.

## 🚨 Automated Workflow Failure Detection

### How It Works
- **Workflow**: `workflow-failure-detector.yml`
- **Schedule**: Runs every 15 minutes automatically
- **Trigger**: Detects failed workflows and creates detailed issues

### What You Get
When a workflow fails, you'll automatically receive:
- 📋 **Detailed Issue** with failure analysis
- 🔍 **Troubleshooting Hints** specific to the failed workflow type
- 🤖 **Bot Assignment** to the appropriate specialist
- 🔗 **Quick Links** to logs and workflow runs
- ✅ **Resolution Checklist** to track progress

### Example Issue Created:
```
🚨 Workflow Failure: Security Scans #123

**Troubleshooting Hints for Security Scans:**
- Check if dependencies are up to date
- Verify that security scan patterns are still valid
- Look for new vulnerabilities that need addressing

**Responsible Bot**: @copilot[security-agent]
```

## 🔧 Enhanced Ops-Bot Troubleshooting

### How to Use
1. **Automatic**: Ops-bot responds to workflow failure issues automatically
2. **Manual**: Trigger via GitHub Actions with specific parameters

### Diagnostic Types Available
- `dependency_update` - Analyzes and fixes dependency issues
- `workflow_fix` - Checks and repairs workflow configurations
- `config_fix` - Validates and fixes configuration files
- `security_fix` - Addresses security configuration issues

### Manual Triggering
Go to **Actions** → **ops-bot** → **Run workflow**:
- **issue_number**: The issue to investigate
- **fix_type**: Type of diagnostic to run
- **create_pr**: Whether to create a PR with fixes

### What You Get
- 📊 **Diagnostic Report** with detailed analysis
- 🔧 **Proposed Fixes** with implementation details
- 📝 **Draft PR** with automated solutions (if enabled)
- 💬 **Issue Comment** with investigation results

## 🔒 Automated Security Issue Creation

### How It Works
- **Workflow**: Enhanced `security-scans.yml`
- **Triggers**: Automatic issue creation for security findings
- **Assignment**: Auto-assigns @copilot[security-agent]

### Issue Types Created
1. **Critical Vulnerabilities** (🔴 Critical Priority)
   - Created when critical dependency vulnerabilities are found
   - Includes specific remediation steps
   - Provides automated fix guidance

2. **Hardcoded Secrets** (🟠 High Priority)  
   - Created when potential secrets are detected in code
   - Provides security risk assessment
   - Includes remediation checklist

3. **High-Volume Vulnerabilities** (🟡 Medium Priority)
   - Created when 5+ high-priority vulnerabilities exist
   - Includes batch remediation guidance

## 🤖 Smart Issue Auto-Resolution

### How It Works
- **Workflow**: `automated-issue-resolver.yml`
- **Triggers**: New issues with certain labels or characteristics
- **Analysis**: AI-powered confidence scoring for auto-resolution potential

### Supported Issue Types
- Workflow failures (dependency, security, build, configuration)
- Issues labeled with `auto-fix`
- Security alerts from automated scans

### What Happens
1. **Analysis**: Issue content is analyzed for auto-resolution potential
2. **Confidence Scoring**: Determines likelihood of successful automated fix
3. **Bot Triggering**: Automatically triggers ops-bot if confidence is high
4. **Status Updates**: Comments on issue with analysis results

## 📋 Bot Coordination & Escalation

### Responsibility Matrix
- **@copilot[ops-bot]**: Infrastructure, workflows, configuration, dependencies
- **@copilot[security-agent]**: Security scans, vulnerabilities, secrets, compliance
- **@copilot[dev-bot]**: Application code, features, business logic

### Escalation Flow
1. **Automated Detection** → Creates issue with appropriate bot assignment
2. **Bot Investigation** → Runs diagnostics and proposes fixes
3. **Draft PR Creation** → Provides reviewable solutions
4. **Human Review** → Approve/modify/reject proposed fixes
5. **Issue Resolution** → Close when fixed and verified

## 🎯 Best Practices

### For Issue Management
- **Use Labels**: Add `auto-fix` to issues you want bots to attempt
- **Provide Context**: Clear issue descriptions help bots choose appropriate fixes
- **Review Bot PRs**: Always review automated fixes before merging
- **Update Issues**: Keep `Next:` comments current for bot coordination

### For Workflow Failures
- **Check Bot Issues First**: Automated issues often contain the solution
- **Use Manual Triggers**: Run ops-bot manually for targeted troubleshooting
- **Provide Feedback**: Comment on bot investigations to improve accuracy

### For Security Issues
- **Act Quickly**: Critical security issues should be addressed within 2 hours
- **Review Automated Fixes**: Security fixes require careful human review
- **Test Thoroughly**: Always test security changes in development first

## 🔍 Monitoring & Observability

### View Bot Activity
- **GitHub Actions**: Monitor workflow runs and bot execution
- **Issue Comments**: Track bot investigations and progress
- **Draft PRs**: Review proposed automated fixes
- **Labels**: Filter issues by bot assignments and resolution status

### Key Metrics to Watch
- Time to detection for workflow failures
- Bot resolution success rate
- Critical security issue response time
- Automated fix acceptance rate

## 🚀 Advanced Usage

### Custom Bot Triggers
You can manually trigger bots for specific scenarios:
- Run security-focused diagnostics on infrastructure issues
- Force automated resolution attempts on edge cases
- Use ops-bot for complex multi-system troubleshooting

### Continuous Improvement
- Bot behaviors can be adjusted based on success patterns
- New diagnostic types can be added for emerging issue patterns
- Troubleshooting hints can be enhanced based on common failures

---

This enhanced automation significantly reduces manual troubleshooting time while providing comprehensive diagnostic information for complex issues that require human intervention.