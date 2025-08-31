# Branch Audit and Cleanup System Documentation

## Overview

The Branch Audit and Cleanup System provides comprehensive branch management capabilities for the LGFC-WEBAPP repository. It automatically identifies, categorizes, and manages branches to maintain repository health and reduce clutter from stale, temporary, or merged branches.

## System Components

### 1. Branch Audit Script (`scripts/git_branch_audit.mjs`)

The main Node.js script that performs comprehensive branch analysis:

- **Branch Discovery**: Fetches all branches from the repository using firewall-safe methods
- **Categorization**: Automatically categorizes branches based on naming patterns and characteristics
- **Audit Reporting**: Generates detailed audit reports with recommendations
- **Cleanup Generation**: Creates safe cleanup scripts with backup procedures

### 2. Git Health Check Integration (`scripts/git_health_check.sh`)

Enhanced version of the existing Git health monitoring that now includes branch audit capabilities:

- **Repository Health**: Monitors overall Git repository state
- **Branch Synchronization**: Checks branch status and divergence
- **Integration**: Works seamlessly with the branch audit system

### 3. Automated Workflow (`.github/workflows/branch-audit-cleanup.yml`)

GitHub Actions workflow that provides:

- **Scheduled Audits**: Weekly automated branch audits (Mondays at 6 AM UTC)
- **Manual Triggers**: On-demand audit and cleanup operations
- **Safety Features**: Dry-run capabilities and confirmation requirements
- **Reporting**: Automated issue creation and artifact uploads

## ⚠️ Firewall and API Connectivity Issues

### Problem Description

The branch audit script may fail in GitHub Actions environments due to firewall restrictions that block outbound connections to GitHub API endpoints like `https://api.github.com/repos/wdhunter645/LGFC-WEBAPP/branches`.

### Error Symptoms
- **Workflow failures** with messages about blocked API endpoints
- **Network connectivity errors** during branch fetching
- **Script fallback warnings** in GitHub Actions logs

### Root Cause
GitHub Actions environments implement firewall rules that can block outbound HTTP requests to external APIs, including GitHub's own API endpoints, depending on when they are executed in the workflow.

### Solution Implemented

The system has been updated with a **multi-layered firewall-safe approach**:

#### 1. Workflow Order Optimization
```yaml
steps:
  # CRITICAL: Run branch audit BEFORE other setup steps
  - name: Checkout repository
    uses: actions/checkout@v4
  
  - name: Perform Branch Audit (Before Firewall)
    # This step runs before npm install and other steps that may trigger firewall
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      node scripts/git_branch_audit.mjs audit
  
  # Other setup steps run after audit
  - name: Setup Node.js
  - name: Install dependencies
```

#### 2. Firewall-Safe Branch Fetching
The script now uses multiple fallback methods:

1. **Primary**: `git` commands with `fetch --all --prune`
2. **Secondary**: GitHub CLI (`gh`) using `GITHUB_TOKEN`
3. **Fallback**: Local branches only

```javascript
// No longer uses direct API calls like:
// const response = await fetch('https://api.github.com/repos/...')

// Instead uses git commands:
await execAsync('git fetch --all --prune');
await execAsync('git branch -r --format="%(refname:short)|%(objectname)"');
```

#### 3. Environment Variables
- **GITHUB_TOKEN**: Automatically available in GitHub Actions for authenticated GitHub CLI operations
- **No external API keys required**: Uses built-in GitHub Actions authentication

## Branch Categories

### DELETE (Safe for Removal)
Branches automatically marked for deletion include:

- **Temporary Copilot Fixes**: `copilot/fix-[uuid]` - UUID-based temporary fixes
- **Old Cursor Branches**: `cursor/*` - Cursor AI generated branches older than 30 days
- **Revert Branches**: `revert-*` - Temporary revert operations
- **Combined PR Branches**: `combined-pr-*` - Already merged combination branches
- **Import Branches**: `*-import` - Temporary import operations
- **Old Feature Branches**: `feature/*` older than 90 days

### REVIEW (Manual Review Required)
Branches requiring human evaluation:

- **Numbered Copilot Fixes**: `copilot/fix-[number]` - May contain valuable changes
- **Recent Cursor Branches**: `cursor/*` - Less than 30 days old
- **Recent Feature Branches**: `feature/*` - Less than 90 days old
- **Unknown Patterns**: Branches that don't match predefined patterns

### MERGE (Ready for Integration)
Branches with valuable changes ready to merge:

- **Active Feature Branches**: Recent `feature/*` branches with new commits
- **Bug Fix Branches**: `fix/*` and `bugfix/*` branches with changes

### KEEP (Important Branches)
Branches that should be preserved:

- **Main Branch**: `main` - Primary development branch
- **Release Branches**: `release/*` - Release preparation branches
- **Hotfix Branches**: `hotfix/*` - Critical production fixes

## Usage Guide

### Command Line Usage

#### Perform Branch Audit
```bash
# Basic audit of all branches (firewall-safe)
node scripts/git_branch_audit.mjs audit

# Or use the shell script (local branches only)
./scripts/git_branch_audit.sh audit
```

#### Generate Cleanup Script
```bash
# Generate cleanup script from latest audit
node scripts/git_branch_audit.mjs cleanup

# Generate from specific audit file
node scripts/git_branch_audit.mjs cleanup -f audit-reports/branch_audit_2025-08-30T18-07-12.txt
```

#### Execute Cleanup (Manual)
```bash
# Review the generated cleanup script
cat audit-reports/cleanup_branches_2025-08-30T18-08-09.sh

# Execute cleanup (creates backup automatically)
bash audit-reports/cleanup_branches_2025-08-30T18-08-09.sh
```

### GitHub Actions Usage

#### Scheduled Automatic Audits
The system automatically runs every Monday at 6 AM UTC:
- Performs comprehensive branch audit using firewall-safe methods
- Creates cleanup script if needed
- Reports findings via GitHub Issues
- Automatically cleans up if more than 20 branches are marked for deletion

#### Manual Workflow Triggers

1. **Audit Only**:
   ```
   Go to Actions → Branch Audit and Cleanup → Run workflow
   Action: audit
   ```

2. **Cleanup Dry Run**:
   ```
   Go to Actions → Branch Audit and Cleanup → Run workflow
   Action: cleanup-dry-run
   ```

3. **Execute Cleanup**:
   ```
   Go to Actions → Branch Audit and Cleanup → Run workflow
   Action: cleanup-execute
   Force cleanup: true
   ```

## 🛠️ Troubleshooting

### Firewall and Connectivity Issues

#### Issue: "GitHub API request failed"
**Symptoms:**
- Script shows "GitHub API request failed, using known branch list"
- Workflow logs show network connectivity errors
- API endpoints appear to be blocked

**Solutions:**
1. **Check Workflow Order**: Ensure branch audit runs before setup steps:
   ```yaml
   steps:
     - name: Checkout
     - name: Perform Branch Audit (Before Firewall) # ← Must be early
     - name: Setup Node.js                           # ← After audit
     - name: Install dependencies                    # ← After audit
   ```

2. **Verify GITHUB_TOKEN**: Ensure the token is available:
   ```yaml
   - name: Perform Branch Audit
     env:
       GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

3. **Use Alternative Methods**: The script automatically falls back to:
   - Git commands (`git fetch`, `git branch -r`)
   - GitHub CLI (`gh api`)
   - Local branches only

#### Issue: "Failed to fetch branches via git"
**Cause**: Git remote access issues or repository not properly fetched
**Solution**: 
```bash
# Ensure repository is fully fetched
git fetch --all --prune

# Or checkout with full history
git checkout --fetch-depth=0
```

#### Issue: "No branches found"
**Causes & Solutions:**
- **Limited fetch depth**: Use `fetch-depth: 0` in checkout action
- **Network restrictions**: Script will use local branches as fallback
- **Authentication issues**: Verify GITHUB_TOKEN permissions

### Common Issues

#### "No branches found"
- **Cause**: Limited access to remote branches or connectivity issues
- **Solution**: Script automatically falls back to local branches and git commands

#### "Audit file not found"
- **Cause**: Audit hasn't been run or file path incorrect
- **Solution**: Run audit first, then specify correct file path

#### "Failed to delete branch"
- **Cause**: Branch protection rules or permissions
- **Solution**: Check GitHub branch protection settings and user permissions

### Recovery Procedures

#### Restore Accidentally Deleted Branch
```bash
# Find backup tag
git tag | grep branch-backup

# Restore from backup
git checkout <backup-tag>
git checkout -b <original-branch-name>
git push origin <original-branch-name>
```

#### Rollback Cleanup Operation
```bash
# If cleanup was recent, find the backup tag
git tag | grep branch-backup | tail -1

# Reset to backup state
git reset --hard <backup-tag>
```

## Configuration

### Environment Variables
```bash
# Override default settings
export MAIN_BRANCH="main"                    # Default branch name
export REMOTE_NAME="origin"                  # Remote repository name
export AUDIT_DIR="./audit-reports"           # Audit report directory
export GITHUB_TOKEN="ghp_xxxx"               # GitHub token for API access (auto-set in Actions)
```

### Workflow Requirements
For proper operation in GitHub Actions, ensure:

1. **Workflow Step Order**: Branch audit must run before firewall-triggering steps
2. **Permissions**: Workflow needs `contents: write` and `issues: write`
3. **Fetch Depth**: Use `fetch-depth: 0` for complete branch history
4. **Token Access**: GITHUB_TOKEN should be available for GitHub CLI fallback

### Customizing Branch Rules

Edit `scripts/git_branch_audit.mjs` to modify categorization rules:

```javascript
// Example: Add custom DELETE pattern
if (branchName.startsWith('temp/')) {
    return { category: 'DELETE', reason: 'Temporary development branch' };
}
```

## Audit Reports

### Report Format
Audit reports are saved in `audit-reports/` directory with format:
```
branch_audit_YYYY-MM-DDTHH-MM-SS.txt
```

### Report Contents
- **Header**: Timestamp, repository info, configuration
- **Branch Details**: For each branch:
  - Branch name and category recommendation
  - Reasoning for categorization
  - Commit SHA, age, and author information
- **Summary**: Total counts by category

### Example Report Section
```
BRANCH:copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb
CATEGORY:DELETE
REASON:Temporary Copilot fix branch with UUID
SHA:b64c9e408263581b1f26eb9be58b37cd0b2ec594
AGE_DAYS:unknown
LAST_COMMIT_DATE:unknown
LAST_COMMIT_AUTHOR:unknown
LAST_COMMIT_SUBJECT:unknown
---
```

## Integration with Existing Systems

### Git Health Monitoring
The branch audit system integrates with the existing `git_health_check.sh`:
- **Pre-audit Checks**: Ensures repository is in healthy state
- **Post-cleanup Validation**: Verifies cleanup completed successfully
- **Combined Reporting**: Consolidated health and branch status

### Project Workflow
- **Daily Development**: Regular health checks include branch status
- **Weekly Maintenance**: Automated audits and cleanup
- **Release Preparation**: Manual audits before major releases
- **Onboarding**: New developers can run audits to understand branch structure

## Safety Features

### 🛡️ **Protection Mechanisms**
- **Automatic Backups**: Git tags created before any destructive operations
- **Confirmation Requirements**: Interactive prompts and force flags
- **Dry Run Capability**: Preview changes before execution
- **Error Handling**: Graceful failure handling and detailed logging
- **Recovery Procedures**: Easy restoration from backups

### 🔧 **Operational Safety**
- **Repository Health Checks**: Pre-audit validation
- **Branch Protection Respect**: Honors GitHub branch protection rules
- **Permission Validation**: Ensures proper access before operations
- **Audit Trails**: Comprehensive logging of all actions

## Advanced Configuration

### GitHub Actions Firewall Workarounds

If you need to allowlist specific endpoints for other workflows:

1. **Repository Settings**: Go to repository settings → Copilot coding agent
2. **Custom Allowlist**: Add required endpoints:
   ```
   api.github.com
   *.github.com
   ```

3. **Alternative Setup**: Configure Actions setup steps that run before firewall:
   ```yaml
   - name: Setup Environment (Before Firewall)
     run: |
       # Any setup that needs network access
       gh api repos/${{ github.repository }}/branches
   ```

### Custom API Integration
For organizations needing direct API access:

```javascript
// Custom implementation using GitHub Actions context
async function fetchBranchesInActions() {
    // Use github-script action or other built-in tools
    return await github.rest.repos.listBranches({
        owner: context.repo.owner,
        repo: context.repo.repo
    });
}
```

## Monitoring and Alerts

### Automated Alerts
- **High Branch Count**: Issues created when >15 branches need deletion
- **Weekly Reports**: Summary comments on tracking issues
- **Failure Notifications**: GitHub Actions failures reported via standard notifications

### Metrics Tracking
- **Branch Growth**: Monitor total branch count over time
- **Cleanup Efficiency**: Track deletion success rates
- **Pattern Analysis**: Identify common branch naming patterns

## Best Practices

### Branch Naming
- **Use Descriptive Names**: Clear purpose and scope
- **Follow Patterns**: Consistent prefixes (`feature/`, `fix/`, etc.)
- **Avoid Temporary Names**: Minimize throwaway branch names

### Regular Maintenance
- **Weekly Audits**: Review audit reports and handle manual review items
- **Cleanup Execution**: Don't let stale branches accumulate
- **Documentation Updates**: Keep branch policies current

### Team Coordination
- **Communication**: Notify team before major cleanup operations
- **Review Process**: Have senior developers review cleanup scripts
- **Training**: Ensure team understands branch management practices

## Advanced Usage

### Custom Audit Rules
Create custom categorization rules for specific project needs:

```javascript
// Add to categorizeBranch function
if (branchName.includes('experimental')) {
    if (branchAge > 30) {
        return { category: 'DELETE', reason: 'Old experimental branch' };
    } else {
        return { category: 'REVIEW', reason: 'Active experimental branch' };
    }
}
```

### Firewall-Safe API Integration
Extend the system while maintaining firewall compatibility:

```javascript
// Use GitHub CLI instead of direct API calls
async function fetchBranchesViaGHCLI() {
    const { stdout } = await execAsync('gh api repos/${{ github.repository }}/branches --paginate');
    return JSON.parse(stdout);
}
```

### Reporting Extensions
Create custom report formats or integrations:

```javascript
// Generate CSV reports
function generateCSVReport(auditResults) {
    // Implementation for CSV export
}
```

## Security Considerations

### Permissions
- **Repository Access**: Ensure automation has appropriate repository permissions
- **Branch Protection**: Respect GitHub branch protection rules
- **Token Security**: Use GitHub tokens with minimal required permissions

### Audit Trail
- **Backup Records**: Maintain records of all backup tags created
- **Action Logging**: Log all branch deletions with timestamps and reasons
- **Change Tracking**: Document all configuration changes

## Future Enhancements

### Planned Features
- **AI-Powered Analysis**: Use AI to better categorize ambiguous branches
- **Integration Extensions**: Support for more Git hosting platforms
- **Advanced Analytics**: Branch lifecycle and team productivity metrics
- **Policy Engine**: Configurable rules for different project types

### Community Contributions
- **Rule Sharing**: Community-contributed categorization rules
- **Plugin System**: Extensible architecture for custom functionality
- **Template Library**: Pre-configured setups for different project types

---

## Support

For issues, questions, or contributions:
- **Repository Issues**: Use GitHub issues for bug reports and feature requests
- **Documentation Updates**: Submit PRs for documentation improvements
- **Community**: Discuss best practices in repository discussions

### Specific Issue: Firewall Blocking GitHub API

If you encounter firewall issues:

1. **Check Workflow Order**: Ensure audit runs before setup steps
2. **Verify Token Access**: Confirm GITHUB_TOKEN is available
3. **Review Logs**: Look for "firewall-safe" method usage in workflow logs
4. **Contact Administrator**: If persistent, request allowlisting of `api.github.com`

**Last Updated**: 2025-08-31  
**Version**: 1.1 (Firewall-Safe)  
**Maintainer**: GitHub Copilot