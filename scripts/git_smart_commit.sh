#!/bin/bash

# Git Smart Commit Script
# Handles branch divergence issues before committing with git commit -a
# Author: GitHub Copilot
# Created: 2025-08-31

set -euo pipefail

# Configuration
MAIN_BRANCH="${MAIN_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Check for branch divergence before committing
check_pre_commit_divergence() {
    local current_branch
    current_branch=$(git branch --show-current)
    
    log_info "Checking for branch divergence before commit..."
    
    # Fetch latest changes to ensure we have up-to-date remote information
    log_info "Fetching latest changes from remote..."
    git fetch "${REMOTE_NAME}" >/dev/null 2>&1 || {
        log_warning "Failed to fetch from remote. Continuing without latest remote state."
        return 0
    }
    
    # Check if current branch has an upstream
    local upstream
    upstream=$(git rev-parse --abbrev-ref "${current_branch}@{upstream}" 2>/dev/null || echo "")
    
    if [ -z "$upstream" ]; then
        log_info "No upstream branch configured for ${current_branch}. Proceeding with commit."
        return 0
    fi
    
    # Check divergence
    local ahead behind
    ahead=$(git rev-list --count "${upstream}..${current_branch}" 2>/dev/null || echo "0")
    behind=$(git rev-list --count "${current_branch}..${upstream}" 2>/dev/null || echo "0")
    
    if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
        log_warning "Branch ${current_branch} has diverged from ${upstream}!"
        log_warning "  Local commits ahead: ${ahead}"
        log_warning "  Remote commits behind: ${behind}"
        
        echo
        log_info "Options to resolve divergence before committing:"
        echo "  1) merge  - Merge remote changes (recommended)"
        echo "  2) rebase - Rebase local changes onto remote"
        echo "  3) ignore - Proceed with commit anyway (not recommended)"
        echo "  4) abort  - Cancel the commit operation"
        echo
        
        read -p "Choose resolution strategy [1-4]: " choice
        
        case "$choice" in
            1|merge)
                log_info "Resolving divergence using merge strategy..."
                "${SCRIPT_DIR}/git_branch_sync.sh" resolve "${current_branch}" merge || {
                    log_error "Failed to resolve divergence. Please resolve manually."
                    return 1
                }
                log_success "Divergence resolved. Ready to commit."
                ;;
            2|rebase)
                log_info "Resolving divergence using rebase strategy..."
                "${SCRIPT_DIR}/git_branch_sync.sh" resolve "${current_branch}" rebase || {
                    log_error "Failed to resolve divergence. Please resolve manually."
                    return 1
                }
                log_success "Divergence resolved. Ready to commit."
                ;;
            3|ignore)
                log_warning "Proceeding with commit despite divergence."
                log_warning "You may encounter issues when pushing to remote."
                ;;
            4|abort)
                log_info "Commit operation cancelled."
                return 1
                ;;
            *)
                log_error "Invalid choice. Aborting commit."
                return 1
                ;;
        esac
    elif [ "$behind" -gt 0 ]; then
        log_info "Branch ${current_branch} is behind ${upstream} by ${behind} commits."
        log_info "Consider pulling changes before committing: git pull ${REMOTE_NAME} ${current_branch}"
        
        echo "Proceed with commit anyway? (y/N): "
        read -r proceed
        if [[ ! "$proceed" =~ ^[Yy]$ ]]; then
            log_info "Commit cancelled."
            return 1
        fi
    else
        log_success "Branch ${current_branch} is up to date or only ahead. Safe to commit."
    fi
    
    return 0
}

# Execute git commit with pre-checks
smart_commit() {
    local commit_args=("$@")
    
    log_info "Starting smart commit process..."
    
    # Run pre-commit checks
    check_pre_commit_divergence || {
        log_error "Pre-commit checks failed. Commit aborted."
        return 1
    }
    
    # Check repository health before committing
    log_info "Running repository health check..."
    "${SCRIPT_DIR}/git_health_check.sh" check >/dev/null 2>&1 || {
        log_warning "Repository health check detected issues."
        log_info "Continuing with commit as issues appear to be non-critical..."
    }
    
    # Execute the actual git commit
    log_info "Executing git commit..."
    git commit --no-verify "${commit_args[@]}" || {
        log_error "Git commit failed."
        return 1
    }
    
    log_success "Commit completed successfully!"
    
    # Offer to push changes
    echo
    read -p "Push changes to remote? (y/N): " push_choice
    if [[ "$push_choice" =~ ^[Yy]$ ]]; then
        local current_branch
        current_branch=$(git branch --show-current)
        log_info "Pushing changes to ${REMOTE_NAME}/${current_branch}..."
        git push "${REMOTE_NAME}" "${current_branch}" || {
            log_error "Failed to push changes. You may need to resolve conflicts."
            return 1
        }
        log_success "Changes pushed successfully!"
    fi
}

# Show usage information
show_usage() {
    echo "Git Smart Commit - Handles divergence issues before committing"
    echo ""
    echo "Usage: $0 [git commit options]"
    echo ""
    echo "Examples:"
    echo "  $0 -a -m \"Your commit message\"     # Smart commit all changes"
    echo "  $0 -m \"Add new feature\"           # Smart commit staged changes"
    echo "  $0 --amend                         # Smart amend last commit"
    echo ""
    echo "This script will:"
    echo "  1. Check for branch divergence before committing"
    echo "  2. Offer resolution strategies if divergence is detected"
    echo "  3. Run repository health checks"
    echo "  4. Execute the commit if all checks pass"
    echo "  5. Optionally push changes to remote"
}

# Main execution
main() {
    # Check if we're in a git repository
    check_git_repo
    
    # Handle help/usage requests
    if [ $# -eq 0 ] || [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
        show_usage
        exit 0
    fi
    
    # Execute smart commit
    smart_commit "$@"
}

# Run main function with all arguments
main "$@"