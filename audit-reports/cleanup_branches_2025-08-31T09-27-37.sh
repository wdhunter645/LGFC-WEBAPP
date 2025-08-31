#!/bin/bash
# Auto-generated branch cleanup script
# Generated: 2025-08-31T09:27:37.436Z
# Based on audit: audit-reports/branch_audit_20250831_092634.txt

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
echo "Generated: 2025-08-31T09:27:37.436Z"
echo "Repository: $(pwd)"
echo

# Create backup first
log_info "Creating backup..."
BACKUP_TAG="branch-backup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG" HEAD
log_info "Backup tag created: $BACKUP_TAG"

# Delete branches marked for deletion
log_info "Starting branch cleanup..."
log_info "Will delete 0 branches"

log_info "Branch cleanup completed!"
log_info "Deleted 0 branches"
log_info "To restore if needed, use: git checkout $BACKUP_TAG"

# Clean up remote tracking references
git remote prune origin

echo "Cleanup completed successfully!"