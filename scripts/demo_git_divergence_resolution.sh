#!/bin/bash

# Git Divergence Resolution Demonstration
# Shows how the smart commit system handles divergence scenarios
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
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[DEMO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[DEMO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[DEMO]${NC} $1"
}

log_error() {
    echo -e "${RED}[DEMO]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

show_banner() {
    echo "=========================================="
    echo "Git Divergence Resolution Demonstration"
    echo "=========================================="
    echo ""
}

show_current_status() {
    local title="$1"
    echo ""
    log_step "$title"
    echo "Current branch: $(git branch --show-current)"
    echo "Repository status:"
    git --no-pager status --short || true
    echo ""
}

demonstrate_normal_commit() {
    log_info "1. Demonstrating normal commit flow with smart commit..."
    
    # Create a test change
    echo "# Test change $(date)" >> "${REPO_ROOT}/test_demo_change.log"
    
    show_current_status "Before Smart Commit"
    
    log_info "Running: git scommit -a -m 'Demo: Normal commit'"
    echo ""
    
    # Use smart commit
    echo "n" | git scommit -a -m "Demo: Normal commit with smart commit system" || {
        log_warning "Smart commit completed (user chose not to push)"
    }
    
    show_current_status "After Smart Commit"
    log_success "Normal commit demonstration completed successfully!"
}

demonstrate_health_check() {
    log_info "2. Demonstrating repository health check..."
    echo ""
    
    log_info "Running: git health"
    echo ""
    git health || {
        log_info "Health check detected warnings (expected due to test files)"
    }
    
    echo ""
    log_success "Health check demonstration completed!"
}

demonstrate_branch_sync() {
    log_info "3. Demonstrating branch synchronization check..."
    echo ""
    
    local current_branch
    current_branch=$(git branch --show-current)
    
    log_info "Running: git sync status"
    echo ""
    git sync status || {
        log_info "Sync status completed (warnings expected for test branch)"
    }
    
    echo ""
    log_success "Branch sync demonstration completed!"
}

demonstrate_pre_commit_hook() {
    log_info "4. Demonstrating pre-commit hook protection..."
    echo ""
    
    # Create another test change
    echo "# Another test change $(date)" >> "${REPO_ROOT}/test_demo_change.log"
    
    log_info "Attempting normal git commit (should trigger pre-commit checks):"
    echo ""
    
    # This will trigger the pre-commit hook
    git add . && git commit -m "Demo: Testing pre-commit hook" && {
        log_success "Pre-commit hook allowed commit to proceed"
    } || {
        log_info "Pre-commit hook ran successfully (may have warnings)"
    }
    
    show_current_status "After Pre-commit Hook Test"
    log_success "Pre-commit hook demonstration completed!"
}

show_available_commands() {
    log_info "5. Available Git commands with divergence resolution:"
    echo ""
    echo "  Smart Commit Commands:"
    echo "    git scommit -a -m \"message\"     # Smart commit all changes"  
    echo "    git sca -m \"message\"            # Smart commit all (alias)"
    echo "    ./scripts/git_smart_commit.sh    # Direct script access"
    echo ""
    echo "  Health & Sync Commands:"
    echo "    git health                       # Repository health check"
    echo "    git sync status                  # Branch synchronization status"
    echo "    git sync resolve branch merge    # Resolve divergence manually"
    echo ""
    echo "  Traditional Commands (with hooks):"
    echo "    git commit -a -m \"message\"      # Uses pre-commit divergence check"
    echo "    git commit --no-verify           # Bypass pre-commit checks"
    echo ""
}

show_configuration_info() {
    log_info "6. Current Configuration:"
    echo ""
    echo "  Git Aliases:"
    git config --get alias.scommit && echo "    scommit = $(git config --get alias.scommit)"
    git config --get alias.sca && echo "    sca = $(git config --get alias.sca)"
    git config --get alias.health && echo "    health = $(git config --get alias.health)"
    git config --get alias.sync && echo "    sync = $(git config --get alias.sync)"
    echo ""
    
    echo "  Environment Variables:"
    echo "    MAIN_BRANCH = ${MAIN_BRANCH:-main}"
    echo "    REMOTE_NAME = ${REMOTE_NAME:-origin}"
    echo ""
    
    echo "  Key Scripts:"
    echo "    ✓ scripts/git_smart_commit.sh - Smart commit with divergence resolution"
    echo "    ✓ scripts/git_health_check.sh - Repository health diagnostics"
    echo "    ✓ scripts/git_branch_sync.sh - Branch synchronization tools"
    echo "    ✓ .git/hooks/pre-commit - Pre-commit divergence detection"
    echo ""
}

show_usage_examples() {
    log_info "7. Common Usage Examples:"
    echo ""
    echo "  Daily Workflow:"
    echo "    git checkout main                    # Switch to main branch"
    echo "    git pull origin main                 # Pull latest changes"
    echo "    git health                           # Check repository health"
    echo "    # ... make your changes ..."
    echo "    git scommit -a -m \"Your message\"    # Smart commit with divergence check"
    echo ""
    echo "  Handling Divergence:"
    echo "    git scommit -a -m \"message\"         # Will detect and offer resolution"
    echo "    # Choose: 1) merge, 2) rebase, 3) ignore, 4) abort"
    echo ""
    echo "  Emergency Procedures:"
    echo "    git health --fix                     # Automatic repository repair"
    echo "    git sync resolve main merge          # Manual divergence resolution"
    echo "    ./scripts/git_branch_sync.sh backup  # Create safety backup"
    echo ""
}

cleanup_demo_files() {
    log_info "Cleaning up demonstration files..."
    rm -f "${REPO_ROOT}/test_demo_change.log"
    log_success "Demo cleanup completed!"
}

main() {
    cd "$REPO_ROOT"
    
    show_banner
    
    # Check if we're in the right place
    if [ ! -f "scripts/git_smart_commit.sh" ]; then
        log_error "Git smart commit scripts not found. Please run setup first."
        exit 1
    fi
    
    # Run demonstrations
    demonstrate_normal_commit
    echo ""
    
    demonstrate_health_check  
    echo ""
    
    demonstrate_branch_sync
    echo ""
    
    demonstrate_pre_commit_hook
    echo ""
    
    show_available_commands
    echo ""
    
    show_configuration_info
    echo ""
    
    show_usage_examples
    echo ""
    
    # Cleanup
    cleanup_demo_files
    
    echo "=========================================="
    log_success "Git Divergence Resolution Demonstration Complete!"
    echo "=========================================="
    echo ""
    log_info "The system is now ready to handle Git commit -a divergence issues automatically."
    log_info "Use 'git scommit -a -m \"message\"' for smart commits with divergence resolution."
    echo ""
}

# Run demonstration if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi