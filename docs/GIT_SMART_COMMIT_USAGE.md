# Git Smart Commit Usage Guide

This repository is configured with smart Git commit functionality that automatically detects and resolves branch divergence issues.

## Quick Start

### Using Git Aliases (Recommended)
```bash
# Smart commit with automatic divergence detection
git scommit -a -m "Your commit message"

# Smart commit staged files only
git scommit -m "Your commit message"

# Quick health check
git health

# Branch synchronization
git sync status
```

### Using Direct Scripts
```bash
# Smart commit (replaces git commit -a)
./scripts/git_smart_commit.sh -a -m "Your commit message"

# Repository health check
./scripts/git_health_check.sh check

# Branch synchronization
./scripts/git_branch_sync.sh status
```

## What Smart Commit Does

1. **Pre-commit Checks**:
   - Detects branch divergence with upstream
   - Checks for interrupted Git operations
   - Verifies repository health

2. **Automatic Resolution**:
   - Offers merge or rebase strategies for divergence
   - Cleans up interrupted operations
   - Provides safe commit environment

3. **Post-commit Actions**:
   - Optionally pushes changes to remote
   - Verifies successful completion

## Handling Divergence

When your branch has diverged from the remote:

### Option 1: Merge Strategy (Recommended)
- Preserves both local and remote commit history
- Creates a merge commit
- Safest option for shared repositories

### Option 2: Rebase Strategy
- Creates clean, linear history
- Replays local commits on top of remote
- Good for feature branches

### Option 3: Manual Resolution
```bash
# Check divergence status
./scripts/git_branch_sync.sh status

# Resolve manually
./scripts/git_branch_sync.sh resolve main merge
```

## Bypassing Smart Commit

If needed, you can bypass the smart commit checks:

```bash
# Bypass pre-commit hooks (not recommended)
git commit --no-verify -a -m "Your message"

# Use traditional Git commands
git add . && git commit -m "Your message"
```

## Common Scenarios

### Scenario 1: Branch Divergence During Commit
```
[PRE-COMMIT] Branch main has diverged from origin/main!
  Local commits ahead: 2
  Remote commits behind: 3

Options to resolve divergence before committing:
  1) merge  - Merge remote changes (recommended)  
  2) rebase - Rebase local changes onto remote
  3) ignore - Proceed with commit anyway (not recommended)
  4) abort  - Cancel the commit operation

Choose resolution strategy [1-4]:
```

### Scenario 2: Interrupted Operation
```
[PRE-COMMIT] Interrupted rebase operation detected.
Complete or abort the rebase before committing:
  git rebase --continue  (after resolving conflicts)
  git rebase --abort     (to cancel rebase)
```

### Scenario 3: Repository Health Issues
```
[INFO] Repository health check detected issues. Running automatic fix...
[SUCCESS] Repository issues resolved automatically.
[INFO] Executing git commit...
```

## Configuration

### Environment Variables
```bash
# Main branch name (default: main)
export MAIN_BRANCH="master"

# Remote name (default: origin)  
export REMOTE_NAME="upstream"

# Backup suffix for safety operations
export BACKUP_SUFFIX="backup-$(date +%Y%m%d)"
```

### Customizing Behavior
The smart commit behavior can be customized by editing:
- `scripts/git_smart_commit.sh` - Main smart commit logic
- `.git/hooks/pre-commit` - Pre-commit divergence checks
- `scripts/git_branch_sync.sh` - Divergence resolution strategies

## Troubleshooting

### Common Issues

**Issue**: "Not in a git repository"
**Solution**: Ensure you're in the correct directory with `.git` folder

**Issue**: "Failed to fetch from remote"
**Solution**: Check network connectivity and remote URL configuration

**Issue**: "Permission denied" when running scripts
**Solution**: Make scripts executable with `chmod +x scripts/*.sh`

### Getting Help

```bash
# Show smart commit usage
./scripts/git_smart_commit.sh --help

# Run repository diagnostics
./scripts/git_health_check.sh check-full

# Check branch synchronization status
./scripts/git_branch_sync.sh status
```

## Best Practices

1. **Use smart commit by default**: `git scommit -a -m "message"`
2. **Check health regularly**: `git health`
3. **Resolve divergence early**: Don't let branches diverge too much
4. **Create backups**: Scripts automatically backup before risky operations
5. **Test in feature branches**: Use feature branches for experimental work
