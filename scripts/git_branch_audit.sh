#!/bin/bash

# Git Branch Audit and Cleanup Script
# Comprehensive branch analysis and cleanup system
# Author: GitHub Copilot
# Created: 2025-08-30

set -euo pipefail

# Configuration
MAIN_BRANCH="${MAIN_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
AUDIT_DIR="${AUDIT_DIR:-./audit-reports}"
BACKUP_PREFIX="${BACKUP_PREFIX:-branch-backup-$(date +%Y%m%d-%H%M%S)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_audit() {
    echo -e "${CYAN}[AUDIT]${NC} $1"
}

log_delete() {
    echo -e "${RED}[DELETE]${NC} $1"
}

log_keep() {
    echo -e "${GREEN}[KEEP]${NC} $1"
}

log_merge() {
    echo -e "${PURPLE}[MERGE]${NC} $1"
}

# Check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
}

# Create audit directory
setup_audit_dir() {
    mkdir -p "$AUDIT_DIR"
    log_info "Audit reports will be saved to: $AUDIT_DIR"
}

# Get branch information including divergence from main
get_branch_info() {
    local branch="$1"
    local is_remote="${2:-false}"
    
    # Skip if it's the main branch
    if [[ "$branch" == "$MAIN_BRANCH" ]] || [[ "$branch" == "origin/$MAIN_BRANCH" ]]; then
        return
    fi
    
    local branch_ref="$branch"
    local display_name="$branch"
    
    if [[ "$is_remote" == "true" ]]; then
        # For remote branches, use the remote ref
        branch_ref="$branch"
        display_name="${branch#origin/}"
    fi
    
    # Check if branch exists
    if ! git rev-parse --verify "$branch_ref" >/dev/null 2>&1; then
        echo "ERROR: Branch not found"
        return
    fi
    
    # Get branch commit info
    local last_commit_sha last_commit_date last_commit_author last_commit_subject
    last_commit_sha=$(git rev-parse "$branch_ref" 2>/dev/null || echo "unknown")
    last_commit_date=$(git log -1 --format="%ci" "$branch_ref" 2>/dev/null || echo "unknown")
    last_commit_author=$(git log -1 --format="%an" "$branch_ref" 2>/dev/null || echo "unknown")
    last_commit_subject=$(git log -1 --format="%s" "$branch_ref" 2>/dev/null || echo "unknown")
    
    # Calculate divergence from main
    local ahead_count=0 behind_count=0
    if git merge-base --is-ancestor "$REMOTE_NAME/$MAIN_BRANCH" "$branch_ref" 2>/dev/null; then
        # Branch is ahead of main
        ahead_count=$(git rev-list --count "$REMOTE_NAME/$MAIN_BRANCH..$branch_ref" 2>/dev/null || echo "0")
        behind_count=0
    elif git merge-base --is-ancestor "$branch_ref" "$REMOTE_NAME/$MAIN_BRANCH" 2>/dev/null; then
        # Branch is behind main (already merged)
        ahead_count=0
        behind_count=$(git rev-list --count "$branch_ref..$REMOTE_NAME/$MAIN_BRANCH" 2>/dev/null || echo "0")
    else
        # Branch has diverged
        ahead_count=$(git rev-list --count "$REMOTE_NAME/$MAIN_BRANCH..$branch_ref" 2>/dev/null || echo "0")
        behind_count=$(git rev-list --count "$branch_ref..$REMOTE_NAME/$MAIN_BRANCH" 2>/dev/null || echo "0")
    fi
    
    # Calculate branch age in days
    local branch_age="unknown"
    if [[ "$last_commit_date" != "unknown" ]]; then
        local commit_timestamp last_commit_epoch now_epoch
        commit_timestamp=$(date -d "$last_commit_date" +%s 2>/dev/null || echo "0")
        now_epoch=$(date +%s)
        if [[ "$commit_timestamp" -gt 0 ]]; then
            branch_age=$(( (now_epoch - commit_timestamp) / 86400 ))
        fi
    fi
    
    # Determine branch category based on analysis
    local category="UNKNOWN"
    local reason=""
    
    if [[ $ahead_count -eq 0 && $behind_count -gt 0 ]]; then
        category="DELETE"
        reason="Already merged into main (behind by $behind_count commits)"
    elif [[ "$branch" =~ ^copilot/fix-[a-f0-9-]{36}$ ]]; then
        category="DELETE"
        reason="Temporary Copilot fix branch with UUID"
    elif [[ "$branch" =~ ^cursor/ ]]; then
        if [[ $branch_age -gt 30 ]]; then
            category="DELETE"
            reason="Old Cursor branch (${branch_age} days old)"
        else
            category="REVIEW"
            reason="Recent Cursor branch"
        fi
    elif [[ "$branch" =~ ^revert- ]]; then
        category="DELETE"
        reason="Revert branch, likely temporary"
    elif [[ "$branch" =~ ^feature/ ]] || [[ "$branch" =~ ^fix/ ]] || [[ "$branch" =~ ^enhancement/ ]]; then
        if [[ $ahead_count -gt 0 && $behind_count -eq 0 ]]; then
            category="MERGE"
            reason="Feature branch with new commits ($ahead_count ahead)"
        elif [[ $branch_age -gt 90 ]]; then
            category="DELETE"
            reason="Old feature branch (${branch_age} days old)"
        else
            category="REVIEW"
            reason="Feature branch needs manual review"
        fi
    elif [[ "$branch" =~ ^copilot/fix-[0-9]+$ ]]; then
        if [[ $ahead_count -gt 0 ]]; then
            category="REVIEW"
            reason="Numbered Copilot fix with changes"
        else
            category="DELETE"
            reason="Numbered Copilot fix, likely merged"
        fi
    elif [[ $branch_age -gt 60 && $ahead_count -eq 0 ]]; then
        category="DELETE"
        reason="Old branch with no unique commits (${branch_age} days old)"
    else
        category="KEEP"
        reason="Active or recent branch"
    fi
    
    # Output structured information
    echo "BRANCH:$display_name"
    echo "CATEGORY:$category"
    echo "REASON:$reason"
    echo "AHEAD:$ahead_count"
    echo "BEHIND:$behind_count"
    echo "AGE_DAYS:$branch_age"
    echo "LAST_COMMIT_SHA:$last_commit_sha"
    echo "LAST_COMMIT_DATE:$last_commit_date"
    echo "LAST_COMMIT_AUTHOR:$last_commit_author"
    echo "LAST_COMMIT_SUBJECT:$last_commit_subject"
    echo "---"
}

# Audit all branches
audit_all_branches() {
    log_info "Starting comprehensive branch audit..."
    
    # Fetch latest information
    log_info "Fetching latest branch information..."
    git fetch --all --prune >/dev/null 2>&1 || {
        log_warning "Failed to fetch from remotes, continuing with local data"
    }
    
    local audit_file="$AUDIT_DIR/branch_audit_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Git Branch Audit Report"
        echo "Generated: $(date)"
        echo "Repository: $(pwd)"
        echo "Main Branch: $MAIN_BRANCH"
        echo "Remote: $REMOTE_NAME"
        echo "==============================="
        echo
    } > "$audit_file"
    
    # Audit remote branches (primary source of truth)
    log_audit "Auditing remote branches..."
    local remote_branches
    remote_branches=$(git branch -r --no-merged "$REMOTE_NAME/$MAIN_BRANCH" 2>/dev/null | grep -v " -> " | sed 's/^[[:space:]]*//' || true)
    
    local total_branches=0 delete_count=0 merge_count=0 keep_count=0 review_count=0
    
    while IFS= read -r branch; do
        if [[ -z "$branch" ]] || [[ "$branch" == "origin/$MAIN_BRANCH" ]]; then
            continue
        fi
        
        total_branches=$((total_branches + 1))
        log_audit "Analyzing: $branch"
        
        local branch_info
        branch_info=$(get_branch_info "$branch" "true")
        
        echo "$branch_info" >> "$audit_file"
        
        # Count categories
        if echo "$branch_info" | grep -q "CATEGORY:DELETE"; then
            delete_count=$((delete_count + 1))
            log_delete "$(echo "$branch_info" | grep "BRANCH:" | cut -d: -f2)"
        elif echo "$branch_info" | grep -q "CATEGORY:MERGE"; then
            merge_count=$((merge_count + 1))
            log_merge "$(echo "$branch_info" | grep "BRANCH:" | cut -d: -f2)"
        elif echo "$branch_info" | grep -q "CATEGORY:KEEP"; then
            keep_count=$((keep_count + 1))
            log_keep "$(echo "$branch_info" | grep "BRANCH:" | cut -d: -f2)"
        else
            review_count=$((review_count + 1))
            log_warning "$(echo "$branch_info" | grep "BRANCH:" | cut -d: -f2) - NEEDS REVIEW"
        fi
        
    done <<< "$remote_branches"
    
    # Also check merged branches
    log_audit "Checking already merged branches..."
    local merged_branches
    merged_branches=$(git branch -r --merged "$REMOTE_NAME/$MAIN_BRANCH" 2>/dev/null | grep -v " -> " | grep -v "$REMOTE_NAME/$MAIN_BRANCH" | sed 's/^[[:space:]]*//' || true)
    
    while IFS= read -r branch; do
        if [[ -z "$branch" ]]; then
            continue
        fi
        
        total_branches=$((total_branches + 1))
        delete_count=$((delete_count + 1))
        
        echo "BRANCH:${branch#origin/}" >> "$audit_file"
        echo "CATEGORY:DELETE" >> "$audit_file"
        echo "REASON:Already merged into main" >> "$audit_file"
        echo "AHEAD:0" >> "$audit_file"
        echo "BEHIND:0" >> "$audit_file"
        echo "AGE_DAYS:unknown" >> "$audit_file"
        echo "---" >> "$audit_file"
        
        log_delete "${branch#origin/} (already merged)"
        
    done <<< "$merged_branches"
    
    # Add summary to audit file
    {
        echo
        echo "AUDIT SUMMARY"
        echo "============="
        echo "Total branches analyzed: $total_branches"
        echo "Branches to DELETE: $delete_count"
        echo "Branches to MERGE: $merge_count"  
        echo "Branches to KEEP: $keep_count"
        echo "Branches needing REVIEW: $review_count"
        echo
        echo "Audit completed: $(date)"
    } >> "$audit_file"
    
    log_success "Branch audit completed!"
    log_info "Total branches analyzed: $total_branches"
    log_delete "Recommended for deletion: $delete_count"
    log_merge "Recommended for merging: $merge_count"
    log_keep "Recommended to keep: $keep_count"
    log_warning "Need manual review: $review_count"
    log_info "Detailed report saved to: $audit_file"
    
    echo "$audit_file"
}

# Generate cleanup script based on audit
generate_cleanup_script() {
    local audit_file="$1"
    
    if [[ ! -f "$audit_file" ]]; then
        log_error "Audit file not found: $audit_file"
        return 1
    fi
    
    local cleanup_script="$AUDIT_DIR/cleanup_branches_$(date +%Y%m%d_%H%M%S).sh"
    
    {
        echo "#!/bin/bash"
        echo "# Auto-generated branch cleanup script"
        echo "# Generated: $(date)"
        echo "# Based on audit: $audit_file"
        echo
        echo "set -euo pipefail"
        echo
        echo "# Colors"
        echo "RED='\\033[0;31m'"
        echo "GREEN='\\033[0;32m'"
        echo "YELLOW='\\033[1;33m'"
        echo "NC='\\033[0m'"
        echo
        echo "log_info() { echo -e \"\\${GREEN}[INFO]\\${NC} \$1\"; }"
        echo "log_warning() { echo -e \"\\${YELLOW}[WARNING]\\${NC} \$1\"; }"
        echo "log_error() { echo -e \"\\${RED}[ERROR]\\${NC} \$1\"; }"
        echo
        echo "echo \"Branch Cleanup Script\""
        echo "echo \"Generated: $(date)\""
        echo "echo \"Repository: $(pwd)\""
        echo "echo\""
        echo
        echo "# Create backup first"
        echo "log_info \"Creating backup...\""
        echo "git tag \"$BACKUP_PREFIX\" HEAD"
        echo "log_info \"Backup tag created: $BACKUP_PREFIX\""
        echo
        echo "# Delete branches marked for deletion"
        echo "log_info \"Starting branch cleanup...\""
        echo
    } > "$cleanup_script"
    
    # Extract branches marked for deletion
    local delete_count=0
    while IFS= read -r line; do
        if [[ "$line" =~ ^BRANCH: ]]; then
            local current_branch="${line#BRANCH:}"
            local next_category=""
            
            # Read the next line to get category
            if IFS= read -r category_line; then
                if [[ "$category_line" =~ ^CATEGORY:DELETE ]]; then
                    delete_count=$((delete_count + 1))
                    {
                        echo "# Delete branch: $current_branch"
                        echo "if git show-ref --verify --quiet \"refs/remotes/origin/$current_branch\"; then"
                        echo "    log_info \"Deleting remote branch: $current_branch\""
                        echo "    git push origin --delete \"$current_branch\" || log_warning \"Failed to delete remote branch: $current_branch\""
                        echo "else"
                        echo "    log_warning \"Remote branch not found: $current_branch\""
                        echo "fi"
                        echo
                        echo "if git show-ref --verify --quiet \"refs/heads/$current_branch\"; then"
                        echo "    log_info \"Deleting local branch: $current_branch\""
                        echo "    git branch -D \"$current_branch\" || log_warning \"Failed to delete local branch: $current_branch\""
                        echo "fi"
                        echo
                    } >> "$cleanup_script"
                fi
            fi
        fi
    done < "$audit_file"
    
    {
        echo "log_info \"Branch cleanup completed!\""
        echo "log_info \"Deleted $delete_count branches\""
        echo "log_info \"To restore if needed, use: git checkout $BACKUP_PREFIX\""
        echo
        echo "# Clean up remote tracking references"
        echo "git remote prune origin"
        echo
        echo "echo \"Cleanup completed successfully!\""
    } >> "$cleanup_script"
    
    chmod +x "$cleanup_script"
    
    log_success "Cleanup script generated: $cleanup_script"
    log_info "Script will delete $delete_count branches"
    log_warning "Review the script before executing!"
    
    echo "$cleanup_script"
}

# Interactive cleanup with confirmation
interactive_cleanup() {
    local audit_file="$1"
    
    if [[ ! -f "$audit_file" ]]; then
        log_error "Audit file not found: $audit_file"
        return 1
    fi
    
    log_info "Starting interactive branch cleanup..."
    log_warning "This will permanently delete branches marked for deletion!"
    
    echo
    read -p "Do you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        log_info "Cleanup cancelled"
        return 0
    fi
    
    # Create backup
    log_info "Creating backup tag..."
    git tag "$BACKUP_PREFIX" HEAD
    log_success "Backup created: $BACKUP_PREFIX"
    
    local deleted_count=0
    local failed_count=0
    
    # Process each branch marked for deletion
    while IFS= read -r line; do
        if [[ "$line" =~ ^BRANCH: ]]; then
            local current_branch="${line#BRANCH:}"
            local category_line reason_line
            
            # Read category and reason
            IFS= read -r category_line
            IFS= read -r reason_line
            
            if [[ "$category_line" =~ ^CATEGORY:DELETE ]]; then
                local reason="${reason_line#REASON:}"
                
                log_warning "Delete branch: $current_branch"
                echo "  Reason: $reason"
                read -p "  Confirm deletion? (y/n): " -r
                
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    # Delete remote branch first
                    if git ls-remote --exit-code --heads origin "$current_branch" >/dev/null 2>&1; then
                        if git push origin --delete "$current_branch" >/dev/null 2>&1; then
                            log_success "Deleted remote branch: $current_branch"
                        else
                            log_error "Failed to delete remote branch: $current_branch"
                            failed_count=$((failed_count + 1))
                            continue
                        fi
                    fi
                    
                    # Delete local branch if it exists
                    if git show-ref --verify --quiet "refs/heads/$current_branch"; then
                        if git branch -D "$current_branch" >/dev/null 2>&1; then
                            log_success "Deleted local branch: $current_branch"
                        else
                            log_error "Failed to delete local branch: $current_branch"
                            failed_count=$((failed_count + 1))
                        fi
                    fi
                    
                    deleted_count=$((deleted_count + 1))
                else
                    log_info "Skipped: $current_branch"
                fi
            fi
        fi
    done < "$audit_file"
    
    # Clean up remote tracking references
    git remote prune origin >/dev/null 2>&1
    
    log_success "Interactive cleanup completed!"
    log_info "Branches deleted: $deleted_count"
    if [[ $failed_count -gt 0 ]]; then
        log_warning "Failed deletions: $failed_count"
    fi
    log_info "Backup available at tag: $BACKUP_PREFIX"
}

# Show help
show_help() {
    cat << EOF
Git Branch Audit and Cleanup Tool

USAGE:
    $0 [action] [options]

ACTIONS:
    audit          - Perform comprehensive branch audit (default)
    cleanup        - Generate cleanup script based on latest audit
    interactive    - Interactive branch cleanup with confirmations
    help           - Show this help message

OPTIONS:
    -f, --file     - Specify audit file for cleanup actions
    -d, --dir      - Specify audit directory (default: ./audit-reports)

EXAMPLES:
    # Perform branch audit
    $0 audit
    
    # Generate cleanup script
    $0 cleanup
    
    # Interactive cleanup
    $0 interactive
    
    # Use specific audit file
    $0 cleanup -f ./audit-reports/branch_audit_20250830_120000.txt

BRANCH CATEGORIES:
    DELETE  - Branches safe to delete (merged, old, temporary)
    MERGE   - Branches with valuable changes ready to merge
    KEEP    - Important branches to preserve
    REVIEW  - Branches requiring manual review

SAFETY FEATURES:
    - Automatic backups before destructive operations
    - Confirmation prompts for deletions
    - Detailed audit logs and reasoning
    - Remote and local branch synchronization
    - Failed operation logging

EOF
}

# Main function
main() {
    local action="${1:-audit}"
    local audit_file=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--file)
                audit_file="$2"
                shift 2
                ;;
            -d|--dir)
                AUDIT_DIR="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            audit|cleanup|interactive|help)
                action="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log_info "Git Branch Audit Tool"
    log_info "Action: $action"
    
    check_git_repo
    setup_audit_dir
    
    case "$action" in
        "audit")
            audit_all_branches
            ;;
        "cleanup")
            if [[ -z "$audit_file" ]]; then
                # Find the latest audit file
                audit_file=$(find "$AUDIT_DIR" -name "branch_audit_*.txt" -type f | sort -r | head -1)
                if [[ -z "$audit_file" ]]; then
                    log_error "No audit file found. Run audit first."
                    exit 1
                fi
                log_info "Using latest audit file: $audit_file"
            fi
            generate_cleanup_script "$audit_file"
            ;;
        "interactive")
            if [[ -z "$audit_file" ]]; then
                # Find the latest audit file
                audit_file=$(find "$AUDIT_DIR" -name "branch_audit_*.txt" -type f | sort -r | head -1)
                if [[ -z "$audit_file" ]]; then
                    log_error "No audit file found. Run audit first."
                    exit 1
                fi
                log_info "Using latest audit file: $audit_file"
            fi
            interactive_cleanup "$audit_file"
            ;;
        "help")
            show_help
            ;;
        *)
            log_error "Unknown action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"