#!/bin/bash
# Auto-generated branch cleanup script
# Generated: 2025-08-31T09:23:09.324Z
# Based on audit: audit-reports/branch_audit_2025-08-31T09-22-46.txt

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "Branch Cleanup Script"
echo "Generated: 2025-08-31T09:23:09.324Z"
echo "Repository: $(pwd)"
echo

# Create backup first
log_info "Creating backup..."
BACKUP_TAG="branch-backup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG" HEAD
log_info "Backup tag created: $BACKUP_TAG"

# Delete branches marked for deletion
log_info "Starting branch cleanup..."
log_info "Will delete 1 branches"

# Delete branch: copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05"
    git push origin --delete "copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05" || log_warning "Failed to delete remote branch: copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05"
else
    log_warning "Remote branch not found: copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05"; then
    log_info "Deleting local branch: copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05"
    git branch -D "copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05" || log_warning "Failed to delete local branch: copilot/fix-166dcd63-4ca6-42d4-a2bb-c8f827195e05"
fi

log_info "Branch cleanup completed!"
log_info "Deleted 1 branches"
log_info "To restore if needed, use: git checkout $BACKUP_TAG"

# Clean up remote tracking references
git remote prune origin

echo "Cleanup completed successfully!"