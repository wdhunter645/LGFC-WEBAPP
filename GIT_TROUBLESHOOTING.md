# Git Branch Management & Troubleshooting Guide

## Overview

This guide provides comprehensive procedures for resolving Git branch divergence issues, managing repository synchronization, and preventing common Git problems in the LGFC-WEBAPP project.

## Quick Reference

### Emergency Commands
```bash
# Clean up interrupted operations
./scripts/git_health_check.sh fix

# Check repository health
./scripts/git_health_check.sh check

# Resolve branch divergence
./scripts/git_branch_sync.sh resolve main merge

# Smart commit with automatic divergence resolution (NEW)
./scripts/git_smart_commit.sh -a -m "Your message"

# Use Git aliases for smart commits (NEW)
git scommit -a -m "Your message"   # Smart commit all changes
git health                         # Quick health check
git sync status                   # Check branch synchronization
```

## Problem Resolution

### 0. Git Commit -a Divergence Issues (NEW SOLUTION)

**Problem:** Using `git commit -a` fails or causes issues when branches have diverged.

**Symptoms:**
- Commit succeeds but push fails due to divergence
- Confusion about whether local or remote changes should take precedence
- Manual resolution required every time branches diverge

**Smart Solution (Recommended):**
```bash
# Use smart commit instead of git commit -a
git scommit -a -m "Your commit message"

# This will:
# 1. Detect branch divergence before committing
# 2. Offer resolution strategies (merge/rebase)
# 3. Complete the commit safely
# 4. Optionally push to remote
```

**Manual Resolution (if needed):**
```bash
# Check for divergence first
./scripts/git_branch_sync.sh check main

# If divergence detected, resolve before committing
./scripts/git_branch_sync.sh resolve main merge  # or rebase

# Then commit normally
git commit -a -m "Your message"
```

**Setup Smart Commit System:**
```bash
# Run setup once to configure smart commit
./scripts/setup_git_divergence_resolution.sh

# Test the setup
git scommit -a -m "Test message"
```

### 1. Branch Divergence Issues

**Symptoms:**
- Local 'main' branch and remote 'origin/main' have diverged
- Unique commits on both local and remote branches
- Rebase failures with update_ref errors

**Diagnosis:**
```bash
# Check branch status
./scripts/git_branch_sync.sh check main

# Get detailed diagnostics
./scripts/git_health_check.sh check-full
```

**Resolution Strategies:**

#### Strategy 1: Merge (Recommended)
```bash
# Create backup first
./scripts/git_branch_sync.sh backup

# Resolve using merge strategy
./scripts/git_branch_sync.sh resolve main merge
```

#### Strategy 2: Rebase (For clean history)
```bash
# Backup current state
./scripts/git_branch_sync.sh backup

# Resolve using rebase strategy
./scripts/git_branch_sync.sh resolve main rebase
```

#### Strategy 3: Reset (Nuclear option)
```bash
# ⚠️ WARNING: This will lose local changes
./scripts/git_branch_sync.sh resolve main reset
```

### 2. Interrupted Rebase Operations

**Symptoms:**
- Error: "There is already a rebase-merge directory"
- Lock files preventing Git operations
- Refs/heads/main lock errors

**Resolution:**
```bash
# Clean up interrupted operations
./scripts/git_health_check.sh fix

# Or manual cleanup
git rebase --abort
rm -f .git/index.lock
find .git/refs -name "*.lock" -delete
```

### 3. Lock File Issues

**Symptoms:**
- "Unable to create index.lock"
- "Another git process seems to be running"

**Resolution:**
```bash
# Check for lock files
./scripts/git_health_check.sh check

# Remove lock files safely
./scripts/git_health_check.sh fix
```

## Prevention Strategies

### 1. Regular Health Checks

Add to your workflow:
```bash
# Before starting work
./scripts/git_health_check.sh check

# Before committing
git status
git diff --staged
```

### 2. Proper Branch Management

```bash
# Always fetch before working
git fetch --all --prune

# Check branch status before pushing
./scripts/git_branch_sync.sh status

# Use feature branches for development
git checkout -b feature/your-feature-name
```

### 3. Automated Monitoring

Set up Git hooks or CI checks:
```yaml
# .github/workflows/git-health.yml
name: Git Health Check
on:
  schedule:
    - cron: '0 0 * * *'  # Daily
jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run Git Health Check
        run: ./scripts/git_health_check.sh check
```

## Git Workflow Best Practices

### 1. Daily Workflow (Updated for Smart Commit)

```bash
# Morning routine
git checkout main
git pull origin main
./scripts/git_health_check.sh check

# Create feature branch
git checkout -b feature/my-feature

# ... do your work ...

# Before committing (RECOMMENDED: Use Smart Commit)
git scommit -a -m "Your commit message"  # Automatically handles divergence

# Alternative: Traditional workflow
git add .
git status
git commit -m "Your commit message"

# Before pushing (handled automatically by smart commit)
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main  # or merge main
git push origin feature/my-feature
```

### 1b. Smart Commit Advantages

**Why use Smart Commit (`git scommit`) instead of `git commit -a`?**
- **Automatic divergence detection**: Checks for branch divergence before committing
- **Guided resolution**: Offers merge/rebase options when divergence is detected  
- **Repository health checks**: Ensures repository is in good state before committing
- **Push assistance**: Optionally pushes changes after successful commit
- **Safety first**: Creates backups before risky operations

**Available Smart Commit Commands:**
```bash
git scommit -a -m "message"    # Smart commit all changes (replaces git commit -a)
git sca -m "message"           # Shorthand for smart commit all
git health                     # Quick repository health check
git sync status               # Check branch synchronization status
```

### 2. Conflict Resolution

When conflicts occur during merge/rebase:

```bash
# 1. View conflicts
git status
git diff

# 2. Edit conflicted files
# (Remove conflict markers: <<<<<<<, =======, >>>>>>>)

# 3. Stage resolved files
git add path/to/resolved/file

# 4. Continue operation
git rebase --continue  # for rebase
git merge --continue   # for merge
```

### 3. Emergency Recovery

If everything goes wrong:

```bash
# 1. Don't panic - create backup
git branch emergency-backup-$(date +%Y%m%d-%H%M%S)

# 2. Check what happened
./scripts/git_health_check.sh check-full
git reflog  # Shows recent HEAD changes

# 3. Restore from backup or reflog
git reset --hard HEAD@{5}  # Go back 5 operations
# or
git checkout emergency-backup-...
```

## Tool Reference

### git_branch_sync.sh Commands

```bash
# Check repository status
./scripts/git_branch_sync.sh status

# Check specific branch for divergence
./scripts/git_branch_sync.sh check main

# Clean up interrupted operations
./scripts/git_branch_sync.sh cleanup

# Create backup of current state
./scripts/git_branch_sync.sh backup

# Resolve divergence with merge
./scripts/git_branch_sync.sh resolve main merge

# Resolve divergence with rebase
./scripts/git_branch_sync.sh resolve main rebase

# Reset local to match remote (destructive)
./scripts/git_branch_sync.sh resolve main reset
```

### git_health_check.sh Commands

```bash
# Standard health check
./scripts/git_health_check.sh check

# Full health check (includes integrity check)
./scripts/git_health_check.sh check-full

# Attempt automatic fixes
./scripts/git_health_check.sh fix

# Generate diagnostic report
./scripts/git_health_check.sh report
```

## Environment Variables

Configure behavior with environment variables:

```bash
# Set main branch name (default: main)
export MAIN_BRANCH="master"

# Set remote name (default: origin)
export REMOTE_NAME="upstream"

# Set backup suffix
export BACKUP_SUFFIX="backup-$(date +%Y%m%d)"
```

## Troubleshooting Specific Errors

### "update_ref failed"
```bash
# Usually indicates lock files or refs corruption
./scripts/git_health_check.sh fix
git gc --prune=now
```

### "refs/heads/main.lock exists"
```bash
# Remove lock file safely
rm -f .git/refs/heads/main.lock
./scripts/git_health_check.sh check
```

### "Your local changes would be overwritten"
```bash
# Stash changes temporarily
git stash push -m "Temporary stash"
# ... resolve divergence ...
git stash pop
```

### "Repository format version X is not supported"
```bash
# Upgrade Git or downgrade repository format
git config core.repositoryformatversion 0
```

## Recovery Scenarios

### Scenario 1: Lost Commits
```bash
# Find lost commits
git reflog
git log --all --oneline --graph --decorate

# Recover specific commit
git cherry-pick <commit-sha>
```

### Scenario 2: Corrupted Repository
```bash
# Check integrity
git fsck --full

# Try to repair
git gc --aggressive --prune=now

# Last resort: re-clone
git clone <remote-url> repo-fresh
```

### Scenario 3: Mixed-up Branches
```bash
# Find where things went wrong
git log --all --graph --oneline --decorate

# Reset branch to specific commit
git reset --hard <correct-commit-sha>
```

## Integration with Project Workflow

### 1. Pre-commit Checks

Add to your development routine:
```bash
# Before each commit
./scripts/git_health_check.sh check
git status
git diff --staged
```

### 2. CI/CD Integration

The health check scripts can be integrated into GitHub Actions:
```yaml
- name: Git Health Check
  run: |
    ./scripts/git_health_check.sh check
    if [ $? -ne 0 ]; then
      echo "Git health issues detected"
      exit 1
    fi
```

### 3. Developer Onboarding

New team members should:
1. Clone repository
2. Run initial health check: `./scripts/git_health_check.sh check`
3. Set up Git configuration
4. Test sync tools: `./scripts/git_branch_sync.sh status`

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Run full health check
   ```bash
   ./scripts/git_health_check.sh check-full
   ```

2. **Monthly**: Generate diagnostic report
   ```bash
   ./scripts/git_health_check.sh report
   ```

3. **As needed**: Clean up old backup branches
   ```bash
   git branch | grep backup- | xargs -n 1 git branch -d
   ```

### Getting Help

If these tools don't resolve your issue:
1. Generate diagnostic report: `./scripts/git_health_check.sh report`
2. Check Git documentation: `git help <command>`
3. Consult project maintainers with the diagnostic report

---

**Last Updated:** 2025-08-30  
**Version:** 1.0  
**Maintainer:** GitHub Copilot