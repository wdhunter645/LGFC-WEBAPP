# Git Management Scripts

This directory contains comprehensive Git management and troubleshooting scripts for the LGFC-WEBAPP project.

## Scripts Overview

### 1. `git_health_check.sh`
Comprehensive Git repository health diagnostics and automated repair tool.

**Usage:**
```bash
./scripts/git_health_check.sh [command]
```

**Commands:**
- `check` - Run standard health checks (default)
- `check-full` - Run full health checks including integrity verification
- `fix` - Attempt automatic repairs, then run health check
- `report` - Generate detailed diagnostic report
- `help` - Show usage information

**What it checks:**
- Git lock files
- Interrupted operations (rebase, merge, cherry-pick)
- Uncommitted changes
- Branch synchronization with remotes
- Remote connectivity
- Repository size and large objects
- Repository integrity (full check only)

### 2. `git_branch_sync.sh`
Git branch synchronization and divergence resolution tool.

**Usage:**
```bash
./scripts/git_branch_sync.sh [action] [branch] [strategy]
```

**Actions:**
- `status` - Show repository status and check divergence (default)
- `cleanup` - Clean up interrupted Git operations
- `check` - Check branch divergence
- `resolve` - Resolve branch divergence
- `backup` - Backup current branch state
- `help` - Show usage information

**Strategies (for resolve action):**
- `merge` - Merge remote changes (default)
- `rebase` - Rebase local changes onto remote
- `reset` - Reset local branch to match remote (destructive)

### 3. `setup_remote_and_gh_cli.sh`
Automates configuring a Git remote and installing the GitHub CLI.

**Usage:**
```bash
./scripts/setup_remote_and_gh_cli.sh <remote-url> [remote-name]
```


## Quick Start

### Daily Health Check
```bash
# Quick health check before starting work
./scripts/git_health_check.sh check
```

### Resolve Branch Divergence
```bash
# Check for divergence
./scripts/git_branch_sync.sh check main

# Resolve with merge strategy (recommended)
./scripts/git_branch_sync.sh resolve main merge
```

### Emergency Cleanup
```bash
# Fix common Git issues automatically
./scripts/git_health_check.sh fix

# Clean up interrupted operations
./scripts/git_branch_sync.sh cleanup
```

## Common Scenarios

### Scenario 1: Branch Divergence
```bash
# Problem: Local and remote branches have diverged
$ ./scripts/git_branch_sync.sh check main
[WARNING] Branch main has diverged!
  Local has 3 unique commits
  Remote has 13 unique commits

# Solution: Choose resolution strategy
$ ./scripts/git_branch_sync.sh backup  # Create backup first
$ ./scripts/git_branch_sync.sh resolve main merge  # Resolve with merge
```

### Scenario 2: Interrupted Rebase
```bash
# Problem: Rebase was interrupted and left repository in inconsistent state
$ ./scripts/git_health_check.sh check
[WARNING] Found interrupted operation(s): rebase-merge

# Solution: Clean up automatically
$ ./scripts/git_health_check.sh fix
```

### Scenario 3: Lock Files
```bash
# Problem: Git operations failing due to lock files
$ ./scripts/git_health_check.sh check
[WARNING] Found 2 lock file(s):
  - .git/index.lock
  - .git/refs/heads/main.lock

# Solution: Remove lock files safely
$ ./scripts/git_health_check.sh fix
```

## Configuration

Set environment variables to customize behavior:

```bash
# Main branch name (default: main)
export MAIN_BRANCH="master"

# Remote name (default: origin)
export REMOTE_NAME="upstream"

# Backup suffix
export BACKUP_SUFFIX="backup-$(date +%Y%m%d)"
```

## Integration

### Pre-commit Hook
A pre-commit hook is automatically installed that runs basic health checks before each commit.

### GitHub Actions
The `git-health-check.yml` workflow runs automated health checks:
- Daily at 6 AM UTC
- On pushes to main branch
- Can be triggered manually

### CI/CD Integration
Include health checks in your CI pipeline:

```yaml
- name: Git Health Check
  run: |
    ./scripts/git_health_check.sh check
    if [ $? -ne 0 ]; then
      echo "Git health issues detected"
      ./scripts/git_health_check.sh report
      exit 1
    fi
```

## Troubleshooting

### Common Exit Codes

**git_health_check.sh:**
- `0` - No issues found
- `1+` - Number of issues found

**git_branch_sync.sh:**
- `0` - Branch synchronized
- `2` - Local branch doesn't exist
- `3` - Branch has diverged
- `4` - Local branch is ahead
- `5` - Local branch is behind

### Debug Mode
Add debug output by setting:
```bash
export GIT_DEBUG=1
```

### Logging
Scripts log to stdout/stderr. Redirect for logging:
```bash
./scripts/git_health_check.sh check > health_check.log 2>&1
```

## Best Practices

### Daily Workflow
```bash
# Morning routine
git checkout main
git pull origin main
./scripts/git_health_check.sh check

# Before committing important changes
./scripts/git_branch_sync.sh backup
```

### Emergency Procedures
```bash
# If everything seems broken
./scripts/git_health_check.sh fix
./scripts/git_branch_sync.sh cleanup
./scripts/git_health_check.sh check-full
```

### Regular Maintenance
```bash
# Weekly full health check
./scripts/git_health_check.sh check-full

# Monthly diagnostic report
./scripts/git_health_check.sh report
```

## Safety Features

1. **Automatic Backups**: Scripts create backups before destructive operations
2. **Confirmation Prompts**: Destructive operations require confirmation
3. **Non-destructive by Default**: Most operations are read-only
4. **Detailed Logging**: All operations are logged for review
5. **Exit Codes**: Proper exit codes for scripting integration

## Support

For issues or questions:
1. Check the [Git Troubleshooting Guide](../GIT_TROUBLESHOOTING.md)
2. Generate diagnostic report: `./scripts/git_health_check.sh report`
3. Review script output and logs
4. Consult project maintainers with diagnostic information

---

**Last Updated:** 2025-08-30  
**Version:** 1.0  
**Maintainer:** GitHub Copilot
