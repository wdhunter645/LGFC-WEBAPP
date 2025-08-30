#!/bin/bash

# Git Repository Health Check Script
# Comprehensive Git repository diagnostics and troubleshooting
# Author: GitHub Copilot
# Created: 2025-08-30

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_check() {
    echo -e "${PURPLE}[CHECK]${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Check for Git lock files
check_lock_files() {
    log_check "Checking for Git lock files..."
    
    local lock_files=()
    
    # Common lock files
    [ -f ".git/index.lock" ] && lock_files+=(".git/index.lock")
    [ -f ".git/HEAD.lock" ] && lock_files+=(".git/HEAD.lock")
    [ -f ".git/config.lock" ] && lock_files+=(".git/config.lock")
    
    # Find all .lock files in .git directory
    while IFS= read -r -d '' file; do
        lock_files+=("$file")
    done < <(find .git -name "*.lock" -print0 2>/dev/null || true)
    
    if [ ${#lock_files[@]} -eq 0 ]; then
        log_success "No lock files found"
        return 0
    else
        log_warning "Found ${#lock_files[@]} lock file(s):"
        for file in "${lock_files[@]}"; do
            echo "  - $file"
            # Show lock file age
            if [ -f "$file" ]; then
                local age
                age=$(stat -c %Y "$file" 2>/dev/null || echo "0")
                local now
                now=$(date +%s)
                local diff=$((now - age))
                echo "    Age: ${diff} seconds"
            fi
        done
        return 1
    fi
}

# Check for interrupted operations
check_interrupted_operations() {
    log_check "Checking for interrupted Git operations..."
    
    local interrupted_ops=()
    
    # Check for interrupted rebase
    if [ -d ".git/rebase-apply" ]; then
        interrupted_ops+=("rebase-apply")
    fi
    
    if [ -d ".git/rebase-merge" ]; then
        interrupted_ops+=("rebase-merge")
    fi
    
    # Check for interrupted merge
    if [ -f ".git/MERGE_HEAD" ]; then
        interrupted_ops+=("merge")
    fi
    
    # Check for interrupted cherry-pick
    if [ -f ".git/CHERRY_PICK_HEAD" ]; then
        interrupted_ops+=("cherry-pick")
    fi
    
    # Check for interrupted revert
    if [ -f ".git/REVERT_HEAD" ]; then
        interrupted_ops+=("revert")
    fi
    
    if [ ${#interrupted_ops[@]} -eq 0 ]; then
        log_success "No interrupted operations found"
        return 0
    else
        log_warning "Found interrupted operation(s): ${interrupted_ops[*]}"
        return 1
    fi
}

# Check repository integrity
check_repo_integrity() {
    log_check "Checking repository integrity..."
    
    # Check object database
    if git fsck --full --strict --progress 2>&1 | tee /tmp/git_fsck_output; then
        log_success "Repository integrity check passed"
        return 0
    else
        log_error "Repository integrity check failed"
        echo "fsck output:"
        cat /tmp/git_fsck_output
        return 1
    fi
}

# Check for uncommitted changes
check_uncommitted_changes() {
    log_check "Checking for uncommitted changes..."
    
    # Check working directory
    local modified_files
    modified_files=$(git diff --name-only)
    
    local staged_files
    staged_files=$(git diff --cached --name-only)
    
    local untracked_files
    untracked_files=$(git ls-files --others --exclude-standard)
    
    if [ -z "$modified_files" ] && [ -z "$staged_files" ] && [ -z "$untracked_files" ]; then
        log_success "Working directory is clean"
        return 0
    else
        log_warning "Found uncommitted changes:"
        
        if [ -n "$modified_files" ]; then
            echo "  Modified files:"
            echo "$modified_files" | sed 's/^/    /'
        fi
        
        if [ -n "$staged_files" ]; then
            echo "  Staged files:"
            echo "$staged_files" | sed 's/^/    /'
        fi
        
        if [ -n "$untracked_files" ]; then
            echo "  Untracked files:"
            echo "$untracked_files" | sed 's/^/    /'
        fi
        return 1
    fi
}

# Check branch synchronization with remotes
check_branch_sync() {
    log_check "Checking branch synchronization..."
    
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    # Get remote branches
    git fetch --all --prune > /dev/null 2>&1 || {
        log_warning "Failed to fetch from remotes"
        return 1
    }
    
    # Check each local branch against its upstream
    local branches
    branches=$(git branch --format='%(refname:short)')
    
    local sync_issues=0
    
    while IFS= read -r branch; do
        if [ -z "$branch" ]; then continue; fi
        
        # Get upstream branch
        local upstream
        upstream=$(git rev-parse --abbrev-ref "${branch}@{upstream}" 2>/dev/null || echo "")
        
        if [ -z "$upstream" ]; then
            echo "  ${branch}: No upstream configured"
            continue
        fi
        
        # Check divergence
        local ahead behind
        ahead=$(git rev-list --count "${upstream}..${branch}" 2>/dev/null || echo "0")
        behind=$(git rev-list --count "${branch}..${upstream}" 2>/dev/null || echo "0")
        
        if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
            echo "  ${branch}: DIVERGED (${ahead} ahead, ${behind} behind ${upstream})"
            sync_issues=$((sync_issues + 1))
        elif [ "$ahead" -gt 0 ]; then
            echo "  ${branch}: ahead by ${ahead} commits"
        elif [ "$behind" -gt 0 ]; then
            echo "  ${branch}: behind by ${behind} commits"
        else
            echo "  ${branch}: synchronized with ${upstream}"
        fi
    done <<< "$branches"
    
    if [ $sync_issues -eq 0 ]; then
        log_success "All branches are synchronized or only ahead/behind"
        return 0
    else
        log_warning "Found $sync_issues diverged branch(es)"
        return 1
    fi
}

# Check for large files or repository size issues
check_repo_size() {
    log_check "Checking repository size..."
    
    # Get repository size
    local repo_size
    repo_size=$(du -sh .git | cut -f1)
    echo "  Repository size: $repo_size"
    
    # Find large objects
    echo "  Largest objects:"
    git rev-list --objects --all | \
        git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
        sed -n 's/^blob //p' | \
        sort --numeric-sort --key=2 | \
        tail -5 | \
        while read -r sha size path; do
            size_mb=$((size / 1024 / 1024))
            if [ $size_mb -gt 0 ]; then
                echo "    $path: ${size_mb}MB"
            fi
        done
    
    # Check for files larger than 50MB
    local large_files
    large_files=$(git ls-tree -r -t -l --full-name HEAD | \
        awk '$4 > 52428800 {print $4, $5}' | \
        sort -n)
    
    if [ -n "$large_files" ]; then
        log_warning "Found large files (>50MB):"
        echo "$large_files" | while read -r size path; do
            size_mb=$((size / 1024 / 1024))
            echo "    $path: ${size_mb}MB"
        done
    fi
}

# Check remote connectivity
check_remote_connectivity() {
    log_check "Checking remote connectivity..."
    
    local remotes
    remotes=$(git remote)
    
    if [ -z "$remotes" ]; then
        log_warning "No remotes configured"
        return 1
    fi
    
    local failed_remotes=0
    
    while IFS= read -r remote; do
        if [ -z "$remote" ]; then continue; fi
        
        local url
        url=$(git remote get-url "$remote" 2>/dev/null || echo "unknown")
        
        echo "  Testing $remote ($url)..."
        
        if git ls-remote "$remote" HEAD > /dev/null 2>&1; then
            echo "    ✓ Connected successfully"
        else
            echo "    ✗ Connection failed"
            failed_remotes=$((failed_remotes + 1))
        fi
    done <<< "$remotes"
    
    if [ $failed_remotes -eq 0 ]; then
        log_success "All remotes are accessible"
        return 0
    else
        log_warning "$failed_remotes remote(s) failed connectivity test"
        return 1
    fi
}

# Generate detailed diagnostic report
generate_diagnostic_report() {
    log_info "Generating diagnostic report..."
    
    local report_file="git_health_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Git Repository Health Report"
        echo "Generated: $(date)"
        echo "Repository: $(pwd)"
        echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
        echo "Current commit: $(git rev-parse HEAD)"
        echo
        
        echo "=== Git Configuration ==="
        git config --list | grep -E "(user|remote|branch)" | head -20
        echo
        
        echo "=== Branch Information ==="
        git branch -vv
        echo
        
        echo "=== Remote Information ==="
        git remote -v
        echo
        
        echo "=== Recent Commits ==="
        git log --oneline -20
        echo
        
        echo "=== Working Directory Status ==="
        git status --porcelain
        echo
        
        echo "=== Repository Statistics ==="
        echo "Total commits: $(git rev-list --all --count 2>/dev/null || echo 'unknown')"
        echo "Total branches: $(git branch -a | wc -l)"
        echo "Total tags: $(git tag | wc -l)"
        echo "Repository size: $(du -sh .git 2>/dev/null || echo 'unknown')"
        echo
        
        echo "=== Object Database ==="
        git count-objects -v
        
    } > "$report_file"
    
    log_success "Diagnostic report saved to: $report_file"
}

# Main health check function
run_health_check() {
    local issues_found=0
    
    echo "=========================================="
    echo "Git Repository Health Check"
    echo "Repository: $(pwd)"
    echo "Date: $(date)"
    echo "=========================================="
    echo
    
    # Run all checks
    check_lock_files || issues_found=$((issues_found + 1))
    echo
    
    check_interrupted_operations || issues_found=$((issues_found + 1))
    echo
    
    check_uncommitted_changes || issues_found=$((issues_found + 1))
    echo
    
    check_branch_sync || issues_found=$((issues_found + 1))
    echo
    
    check_remote_connectivity || issues_found=$((issues_found + 1))
    echo
    
    check_repo_size
    echo
    
    # Repository integrity check (optional, can be slow)
    if [ "${1:-}" = "--full" ]; then
        check_repo_integrity || issues_found=$((issues_found + 1))
        echo
    fi
    
    # Summary
    echo "=========================================="
    if [ $issues_found -eq 0 ]; then
        log_success "Repository health check completed successfully"
        echo "No issues found."
    else
        log_warning "Repository health check completed with $issues_found issue(s)"
        echo
        echo "Recommendations:"
        echo "- Run with --fix to attempt automatic repairs"
        echo "- Use 'git_branch_sync.sh cleanup' to clean up interrupted operations"
        echo "- Use 'git_branch_sync.sh resolve' to fix branch divergence"
    fi
    echo "=========================================="
    
    return $issues_found
}

# Attempt automatic fixes
attempt_fixes() {
    log_info "Attempting automatic fixes..."
    
    # Clean up lock files
    find .git -name "*.lock" -delete 2>/dev/null || true
    
    # Abort interrupted operations
    git rebase --abort 2>/dev/null || true
    git merge --abort 2>/dev/null || true
    git cherry-pick --abort 2>/dev/null || true
    git revert --abort 2>/dev/null || true
    
    # Run garbage collection
    git gc --prune=now
    
    log_success "Automatic fixes completed"
}

# Main function
main() {
    local action="${1:-check}"
    
    check_git_repo
    
    case "$action" in
        "check"|"")
            run_health_check
            ;;
        "check-full")
            run_health_check --full
            ;;
        "fix")
            attempt_fixes
            echo
            run_health_check
            ;;
        "report")
            generate_diagnostic_report
            ;;
        "help")
            echo "Git Repository Health Check Tool"
            echo
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  check      - Run standard health checks (default)"
            echo "  check-full - Run full health checks including integrity"
            echo "  fix        - Attempt automatic fixes, then run health check"
            echo "  report     - Generate detailed diagnostic report"
            echo "  help       - Show this help"
            ;;
        *)
            log_error "Unknown command: $action"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"