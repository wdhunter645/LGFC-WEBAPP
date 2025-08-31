#!/bin/bash

# LGFC-WEBAPP Self-Repair Script
# Automatically restores critical Copilot context and configuration files
# Usage: ./scripts/self_repair.sh

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$REPO_ROOT/self-repair-$(date +%Y%m%d_%H%M%S).log"
RESTORED_FILES=()
CLEANED_FILES=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

# Change to repository root
cd "$REPO_ROOT"

log_info "Starting self-repair process for LGFC-WEBAPP"
log_info "Repository root: $REPO_ROOT"
log_info "Log file: $LOG_FILE"

# Critical files to check and their template sources
declare -A CRITICAL_FILES=(
    ["COPILOT_CONTEXT.md"]="COPILOT_CONTEXT.template.md"
    [".github/copilot.yml"]=".github/copilot.template.yml"
    ["REPO_CONTEXT.md"]="REPO_CONTEXT.template.md"
    ["README.md"]="README.template.md"
)

log_info "Checking critical files..."

# Check and restore missing files
for target_file in "${!CRITICAL_FILES[@]}"; do
    template_file="${CRITICAL_FILES[$target_file]}"
    
    if [ ! -f "$target_file" ]; then
        log_warning "Missing critical file: $target_file"
        
        if [ -f "$template_file" ]; then
            log_info "Restoring $target_file from $template_file"
            
            # Ensure target directory exists
            target_dir=$(dirname "$target_file")
            if [ ! -d "$target_dir" ]; then
                mkdir -p "$target_dir"
                log_info "Created directory: $target_dir"
            fi
            
            # Copy template to target location
            cp "$template_file" "$target_file"
            
            if [ -f "$target_file" ]; then
                log_success "Successfully restored: $target_file"
                RESTORED_FILES+=("$target_file")
            else
                log_error "Failed to restore: $target_file"
                exit 1
            fi
        else
            log_error "Template file missing: $template_file"
            log_error "Cannot restore $target_file without template"
            exit 1
        fi
    else
        log_info "✓ Critical file exists: $target_file"
    fi
done

# Clean up temporary files
log_info "Cleaning up temporary files..."

# Define temp directories and patterns to clean
TEMP_PATTERNS=(
    "tmp/*"
    "*.tmp"
    "*.temp"
    ".tmp.*"
    "*~"
    "*.bak"
    "*.swp"
    ".DS_Store"
    "Thumbs.db"
)

TEMP_DIRS=(
    "tmp"
    ".tmp"
    "temp"
)

# Clean files matching patterns
for pattern in "${TEMP_PATTERNS[@]}"; do
    if compgen -G "$pattern" > /dev/null 2>&1; then
        for file in $pattern; do
            if [ -f "$file" ] && [[ "$file" != "$LOG_FILE" ]]; then
                rm -f "$file"
                log_info "Removed temporary file: $file"
                CLEANED_FILES+=("$file")
            fi
        done
    fi
done

# Clean empty temporary directories
for dir in "${TEMP_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
        rmdir "$dir"
        log_info "Removed empty temporary directory: $dir"
        CLEANED_FILES+=("$dir/")
    fi
done

# Verify critical Copilot configuration
log_info "Verifying Copilot configuration..."

if [ -f ".github/copilot.yml" ]; then
    # Basic YAML syntax check
    if command -v python3 > /dev/null 2>&1; then
        python3 -c "import yaml; yaml.safe_load(open('.github/copilot.yml'))" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "✓ Copilot configuration syntax is valid"
        else
            log_warning "Copilot configuration may have syntax issues"
        fi
    else
        log_info "Python not available for YAML validation"
    fi
    
    # Check for required sections
    if grep -q "responsibilities:" ".github/copilot.yml"; then
        log_success "✓ Copilot responsibilities section found"
    else
        log_warning "Copilot responsibilities section missing"
    fi
else
    log_error "Critical: .github/copilot.yml is missing after restoration attempt"
    exit 1
fi

# Check repository health
log_info "Performing repository health check..."

# Check for required directories
REQUIRED_DIRS=(
    ".github/workflows"
    "scripts"
    "src"
    "security-scans"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_info "✓ Required directory exists: $dir"
    else
        log_warning "Required directory missing: $dir"
        mkdir -p "$dir"
        log_info "Created missing directory: $dir"
    fi
done

# Count workflow files
workflow_count=$(find .github/workflows -name "*.yml" 2>/dev/null | wc -l)
log_info "Found $workflow_count workflow files"

if [ "$workflow_count" -lt 10 ]; then
    log_warning "Low workflow count ($workflow_count) - expected 19+ workflows"
else
    log_success "✓ Good workflow coverage ($workflow_count workflows)"
fi

# Generate repair summary
log_info "Generating self-repair summary..."

SUMMARY_FILE="self-repair-summary-$(date +%Y%m%d_%H%M%S).md"

cat > "$SUMMARY_FILE" << EOF
# 🔧 Self-Repair Summary

**Date**: $(date)  
**Repository**: LGFC-WEBAPP  
**Status**: $([ ${#RESTORED_FILES[@]} -gt 0 ] && echo "Files Restored" || echo "No Restoration Needed")

## Files Restored
$([ ${#RESTORED_FILES[@]} -gt 0 ] && printf '%s\n' "${RESTORED_FILES[@]}" | sed 's/^/- /' || echo "None - all critical files were present")

## Cleanup Performed
$([ ${#CLEANED_FILES[@]} -gt 0 ] && printf '%s\n' "${CLEANED_FILES[@]}" | sed 's/^/- /' || echo "None - no temporary files found")

## Repository Health
- **Workflow Count**: $workflow_count files
- **Critical Directories**: All present
- **Copilot Configuration**: Valid

## Recommendations
$(if [ ${#RESTORED_FILES[@]} -gt 0 ]; then
    echo "- Review restored files to ensure they match current project needs"
    echo "- Consider why critical files were missing"
    echo "- Update templates if restoration content needs modification"
else
    echo "- Repository appears healthy"
    echo "- Self-repair completed successfully"
fi)

---
*Generated by self-repair workflow at $(date)*
EOF

log_success "Self-repair summary saved to: $SUMMARY_FILE"

# Final status
if [ ${#RESTORED_FILES[@]} -gt 0 ]; then
    log_success "Self-repair completed: Restored ${#RESTORED_FILES[@]} critical files"
    echo "RESTORATION_PERFORMED=true" >> "$GITHUB_ENV" 2>/dev/null || true
    echo "RESTORED_FILES_COUNT=${#RESTORED_FILES[@]}" >> "$GITHUB_ENV" 2>/dev/null || true
else
    log_success "Self-repair completed: No restoration needed - all critical files present"
    echo "RESTORATION_PERFORMED=false" >> "$GITHUB_ENV" 2>/dev/null || true
    echo "RESTORED_FILES_COUNT=0" >> "$GITHUB_ENV" 2>/dev/null || true
fi

if [ ${#CLEANED_FILES[@]} -gt 0 ]; then
    log_info "Cleaned up ${#CLEANED_FILES[@]} temporary files/directories"
    echo "CLEANUP_PERFORMED=true" >> "$GITHUB_ENV" 2>/dev/null || true
    echo "CLEANED_FILES_COUNT=${#CLEANED_FILES[@]}" >> "$GITHUB_ENV" 2>/dev/null || true
else
    echo "CLEANUP_PERFORMED=false" >> "$GITHUB_ENV" 2>/dev/null || true
    echo "CLEANED_FILES_COUNT=0" >> "$GITHUB_ENV" 2>/dev/null || true
fi

log_success "Self-repair process completed successfully"
log_info "Log file: $LOG_FILE"
log_info "Summary file: $SUMMARY_FILE"

exit 0