#!/bin/bash

# Git Branch Synchronization Script
# Handles branch divergence and synchronization issues
# Author: GitHub Copilot
# Created: 2025-08-30

set -euo pipefail

# Configuration
MAIN_BRANCH="${MAIN_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BACKUP_SUFFIX="${BACKUP_SUFFIX:-backup-$(date +%Y%m%d-%H%M%S)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Clean up any interrupted rebase or merge operations
cleanup_git_operations() {
    log_info "Cleaning up any interrupted Git operations..."
    
    # Check for interrupted rebase
    if [ -d ".git/rebase-apply" ] || [ -d ".git/rebase-merge" ]; then
        log_warning "Found interrupted rebase operation"
        echo "Aborting interrupted rebase..."
        git rebase --abort || true
    fi
    
    # Check for interrupted merge
    if [ -f ".git/MERGE_HEAD" ]; then
        log_warning "Found interrupted merge operation"
        echo "Aborting interrupted merge..."
        git merge --abort || true
    fi
    
    # Check for interrupted cherry-pick
    if [ -f ".git/CHERRY_PICK_HEAD" ]; then
        log_warning "Found interrupted cherry-pick operation"
        echo "Aborting interrupted cherry-pick..."
        git cherry-pick --abort || true
    fi
    
    # Remove any lock files
    if [ -f ".git/index.lock" ]; then
        log_warning "Removing index lock file"
        rm -f ".git/index.lock"
    fi
    
    # Remove ref locks
    find .git/refs -name "*.lock" -delete 2>/dev/null || true
    
    log_success "Git operations cleanup completed"
}

# Backup current branch state
backup_current_state() {
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    local backup_branch="${current_branch}-${BACKUP_SUFFIX}"
    
    log_info "Creating backup of current branch state: ${backup_branch}"
    
    # Create backup branch
    git branch "${backup_branch}" 2>/dev/null || {
        log_warning "Backup branch already exists, using timestamp suffix"
        backup_branch="${current_branch}-backup-$(date +%Y%m%d-%H%M%S-%N)"
        git branch "${backup_branch}"
    }
    
    log_success "Backup created: ${backup_branch}"
    echo "To restore: git checkout ${backup_branch}"
}

# Check for divergence between local and remote branches
check_branch_divergence() {
    local branch="${1:-$MAIN_BRANCH}"
    local remote_branch="${REMOTE_NAME}/${branch}"
    
    log_info "Checking divergence for branch: ${branch}"
    
    # Fetch latest changes
    git fetch "${REMOTE_NAME}" "${branch}" || {
        log_error "Failed to fetch remote branch ${remote_branch}"
        return 1
    }
    
    # Check if local branch exists
    if ! git show-ref --verify --quiet "refs/heads/${branch}"; then
        log_warning "Local branch ${branch} does not exist"
        return 2
    fi
    
    # Get commit counts
    local ahead_count behind_count
    ahead_count=$(git rev-list --count "${remote_branch}..${branch}" 2>/dev/null || echo "0")
    behind_count=$(git rev-list --count "${branch}..${remote_branch}" 2>/dev/null || echo "0")
    
    echo "Branch status for ${branch}:"
    echo "  Local commits ahead of remote: ${ahead_count}"
    echo "  Remote commits ahead of local: ${behind_count}"
    
    if [ "${ahead_count}" -gt 0 ] && [ "${behind_count}" -gt 0 ]; then
        log_warning "Branch ${branch} has diverged!"
        echo "  Local has ${ahead_count} unique commits"
        echo "  Remote has ${behind_count} unique commits"
        return 3
    elif [ "${ahead_count}" -gt 0 ]; then
        log_info "Local branch is ahead by ${ahead_count} commits"
        return 4
    elif [ "${behind_count}" -gt 0 ]; then
        log_info "Local branch is behind by ${behind_count} commits"
        return 5
    else
        log_success "Branch ${branch} is synchronized"
        return 0
    fi
}

# Resolve branch divergence with different strategies
resolve_divergence() {
    local branch="${1:-$MAIN_BRANCH}"
    local strategy="${2:-merge}"  # merge, rebase, or reset
    local remote_branch="${REMOTE_NAME}/${branch}"
    
    log_info "Resolving divergence for ${branch} using strategy: ${strategy}"
    
    # Backup current state
    backup_current_state
    
    # Switch to target branch
    git checkout "${branch}" || {
        log_error "Failed to checkout branch ${branch}"
        return 1
    }
    
    case "${strategy}" in
        "merge")
            log_info "Using merge strategy..."
            git merge "${remote_branch}" || {
                log_error "Merge failed. Please resolve conflicts manually."
                return 1
            }
            ;;
        "rebase")
            log_info "Using rebase strategy..."
            git rebase "${remote_branch}" || {
                log_error "Rebase failed. Please resolve conflicts manually."
                return 1
            }
            ;;
        "reset")
            log_warning "Using reset strategy - local changes will be lost!"
            echo "Are you sure you want to reset to remote? (y/N)"
            read -r confirmation
            if [[ "${confirmation}" =~ ^[Yy]$ ]]; then
                git reset --hard "${remote_branch}"
                log_success "Branch reset to match remote"
            else
                log_info "Reset cancelled"
                return 1
            fi
            ;;
        *)
            log_error "Unknown strategy: ${strategy}"
            return 1
            ;;
    esac
    
    log_success "Divergence resolved using ${strategy} strategy"
}

# Show repository status
show_repo_status() {
    log_info "Repository Status Report"
    echo "=========================="
    
    echo "Current branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "Working directory: $(pwd)"
    echo
    
    echo "Branch information:"
    git branch -vv
    echo
    
    echo "Remote information:"
    git remote -v
    echo
    
    echo "Git status:"
    git status --porcelain | head -20
    if [ "$(git status --porcelain | wc -l)" -gt 20 ]; then
        echo "... and $(( $(git status --porcelain | wc -l) - 20 )) more files"
    fi
    echo
    
    echo "Recent commits:"
    git log --oneline -10
}

# Main function
main() {
    local action="${1:-status}"
    local branch="${2:-$MAIN_BRANCH}"
    local strategy="${3:-merge}"
    
    log_info "Git Branch Synchronization Tool"
    log_info "Action: ${action}, Branch: ${branch}, Strategy: ${strategy}"
    
    check_git_repo
    
    case "${action}" in
        "status")
            show_repo_status
            check_branch_divergence "${branch}"
            ;;
        "cleanup")
            cleanup_git_operations
            ;;
        "check")
            check_branch_divergence "${branch}"
            ;;
        "resolve")
            resolve_divergence "${branch}" "${strategy}"
            ;;
        "backup")
            backup_current_state
            ;;
        "help")
            echo "Usage: $0 [action] [branch] [strategy]"
            echo
            echo "Actions:"
            echo "  status   - Show repository status and check divergence (default)"
            echo "  cleanup  - Clean up interrupted Git operations"
            echo "  check    - Check branch divergence"
            echo "  resolve  - Resolve branch divergence"
            echo "  backup   - Backup current branch state"
            echo "  help     - Show this help"
            echo
            echo "Strategies (for resolve action):"
            echo "  merge    - Merge remote changes (default)"
            echo "  rebase   - Rebase local changes onto remote"
            echo "  reset    - Reset local branch to match remote"
            echo
            echo "Environment variables:"
            echo "  MAIN_BRANCH    - Main branch name (default: main)"
            echo "  REMOTE_NAME    - Remote name (default: origin)"
            echo "  BACKUP_SUFFIX  - Backup branch suffix"
            ;;
        *)
            log_error "Unknown action: ${action}"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"