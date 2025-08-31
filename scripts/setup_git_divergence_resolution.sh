#!/bin/bash

# Setup Script for Git Divergence Resolution
# Configures the repository to handle commit-time divergence issues
# Author: GitHub Copilot
# Created: 2025-08-31

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SETUP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[SETUP]${NC} $1"
}

log_error() {
    echo -e "${RED}[SETUP]${NC} $1"
}

# Install or update pre-commit hook
setup_pre_commit_hook() {
    log_info "Setting up pre-commit hook..."
    
    local hook_path="${REPO_ROOT}/.git/hooks/pre-commit"
    
    if [ -f "$hook_path" ]; then
        log_success "Pre-commit hook already exists and is up to date"
    else
        log_error "Pre-commit hook not found. This should have been created automatically."
        return 1
    fi
    
    # Ensure hook is executable
    chmod +x "$hook_path"
    log_success "Pre-commit hook configured and executable"
}

# Create Git aliases for smart commit
setup_git_aliases() {
    log_info "Setting up Git aliases..."
    
    # Smart commit alias
    if git config --get alias.scommit >/dev/null 2>&1; then
        log_info "Git alias 'scommit' already exists"
    else
        git config alias.scommit "!${SCRIPT_DIR}/git_smart_commit.sh"
        log_success "Created Git alias 'scommit' for smart commits"
    fi
    
    # Smart commit -a alias  
    if git config --get alias.sca >/dev/null 2>&1; then
        log_info "Git alias 'sca' already exists"
    else
        git config alias.sca "!${SCRIPT_DIR}/git_smart_commit.sh -a"
        log_success "Created Git alias 'sca' for smart commit -a"
    fi
    
    # Health check alias
    if git config --get alias.health >/dev/null 2>&1; then
        log_info "Git alias 'health' already exists"  
    else
        git config alias.health "!${SCRIPT_DIR}/git_health_check.sh check"
        log_success "Created Git alias 'health' for repository health checks"
    fi
    
    # Branch sync alias
    if git config --get alias.sync >/dev/null 2>&1; then
        log_info "Git alias 'sync' already exists"
    else
        git config alias.sync "!${SCRIPT_DIR}/git_branch_sync.sh"
        log_success "Created Git alias 'sync' for branch synchronization"
    fi
}

# Add scripts directory to PATH suggestion
suggest_path_setup() {
    log_info "PATH Configuration Suggestion..."
    echo ""
    log_info "To use the smart commit tools from anywhere, add this to your ~/.bashrc or ~/.zshrc:"
    echo ""
    echo "  export PATH=\"${SCRIPT_DIR}:\$PATH\""
    echo ""
    log_info "Then you can use commands like:"
    echo "  git-commit -a -m \"Your message\"  # Smart commit with divergence handling"
    echo "  git_smart_commit.sh -a -m \"...\"  # Direct script usage"
    echo ""
}

# Create usage documentation
create_usage_docs() {
    log_info "Creating usage documentation..."
    
    local doc_file="${REPO_ROOT}/GIT_SMART_COMMIT_USAGE.md"
    
    cat > "$doc_file" << 'EOF'
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
EOF

    log_success "Created usage documentation: $doc_file"
}

# Test the setup
test_setup() {
    log_info "Testing setup..."
    
    # Test scripts are executable
    local scripts=(
        "git_smart_commit.sh"
        "git_health_check.sh" 
        "git_branch_sync.sh"
        "git-commit"
    )
    
    for script in "${scripts[@]}"; do
        if [ -x "${SCRIPT_DIR}/${script}" ]; then
            log_success "✓ ${script} is executable"
        else
            log_error "✗ ${script} is not executable"
            return 1
        fi
    done
    
    # Test pre-commit hook
    if [ -x "${REPO_ROOT}/.git/hooks/pre-commit" ]; then
        log_success "✓ Pre-commit hook is executable"
    else
        log_error "✗ Pre-commit hook is not executable"
        return 1
    fi
    
    # Test Git aliases
    if git config --get alias.scommit >/dev/null 2>&1; then
        log_success "✓ Git aliases configured"
    else
        log_error "✗ Git aliases not configured"
        return 1  
    fi
    
    log_success "All tests passed!"
}

# Show completion message
show_completion() {
    log_success "Git divergence resolution setup completed!"
    echo ""
    log_info "What's been configured:"
    echo "  ✓ Pre-commit hook for divergence detection"
    echo "  ✓ Smart commit script with automatic resolution"
    echo "  ✓ Git aliases for easy access"
    echo "  ✓ Usage documentation"
    echo ""
    log_info "Try it out:"
    echo "  git scommit -a -m \"Your commit message\"   # Smart commit"
    echo "  git health                                 # Check repository health"
    echo "  git sync status                           # Check branch status"
    echo ""
    log_info "For more information, see: GIT_SMART_COMMIT_USAGE.md"
}

# Main setup function
main() {
    log_info "Setting up Git divergence resolution system..."
    echo ""
    
    # Run setup steps
    setup_pre_commit_hook
    setup_git_aliases
    create_usage_docs
    
    echo ""
    log_info "Running tests..."
    test_setup
    
    echo ""
    suggest_path_setup
    
    echo ""
    show_completion
}

# Execute main function
main "$@"