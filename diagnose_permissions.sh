#!/bin/bash

# 🔐 GitHub Permissions Diagnostic Script
# Checks and reports on Copilot/Codex permissions issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

print_header() {
    echo -e "${CYAN}🔍${NC} $1"
}

echo -e "${CYAN}🔐 GitHub Permissions Diagnostic for Copilot/Codex${NC}"
echo "==============================================="

# Check if we're in the correct directory
if [[ ! -f "package.json" ]] || [[ ! -f "astro.config.mjs" ]]; then
    print_error "This script must be run from the repository root directory"
    exit 1
fi

print_header "Checking repository configuration..."

# Check git configuration
if git remote -v | grep -q "wdhunter645/LGFC-WEBAPP"; then
    print_status "Repository remote correctly configured"
else
    print_error "Repository remote not found or incorrect"
    git remote -v
fi

# Check current branch
current_branch=$(git branch --show-current)
print_info "Current branch: $current_branch"

if [[ "$current_branch" != "main" ]]; then
    print_warning "Not on main branch - this may affect some operations"
fi

print_header "Analyzing workflow files for token usage..."

# Check for token usage patterns
codex_workflows=()
while IFS= read -r -d '' workflow; do
    if grep -q "CODEX_PAT\|codex\|Codex" "$workflow"; then
        codex_workflows+=("$(basename "$workflow")")
    fi
done < <(find .github/workflows -name "*.yml" -print0)

if [[ ${#codex_workflows[@]} -gt 0 ]]; then
    print_status "Found ${#codex_workflows[@]} Codex-related workflow(s):"
    for workflow in "${codex_workflows[@]}"; do
        echo "  - $workflow"
    done
else
    print_warning "No Codex-related workflows found"
fi

print_header "Checking for required secrets..."

# List of required secrets
required_secrets=(
    "CODEX_PAT"
    "SUPABASE_ACCESS_TOKEN" 
    "SUPABASE_PROJECT_REF"
    "SUPABASE_PUBLIC_API_KEY"
)

# Check workflow files for secret usage
echo "Secret usage analysis:"
for secret in "${required_secrets[@]}"; do
    if grep -r "secrets\.$secret" .github/workflows/ >/dev/null 2>&1; then
        print_status "SECRET '$secret' - Used in workflows"
    else
        print_warning "SECRET '$secret' - Not found in workflows"
    fi
done

print_header "Analyzing token permission requirements..."

# Check for operations that need elevated permissions
elevated_ops=()

if grep -r "gh pr review\|gh pr merge" .github/workflows/ >/dev/null 2>&1; then
    elevated_ops+=("PR approval and merge operations")
fi

if grep -r "github.rest.pulls.create\|peter-evans/create-pull-request" .github/workflows/ >/dev/null 2>&1; then
    elevated_ops+=("PR creation operations") 
fi

if grep -r "github.rest.issues.create" .github/workflows/ >/dev/null 2>&1; then
    elevated_ops+=("Issue creation operations")
fi

if [[ ${#elevated_ops[@]} -gt 0 ]]; then
    print_warning "Operations requiring elevated permissions found:"
    for op in "${elevated_ops[@]}"; do
        echo "  - $op"
    done
    echo ""
    print_info "These operations require a Personal Access Token (PAT) with appropriate permissions"
else
    print_status "No elevated permission operations detected"
fi

print_header "Checking current token configuration..."

# Check if workflows are using github.token vs PAT
github_token_usage=$(grep -r "github\.token\|secrets\.GITHUB_TOKEN" .github/workflows/ | wc -l)
codex_pat_usage=$(grep -r "secrets\.CODEX_PAT" .github/workflows/ | wc -l)

echo "Token usage analysis:"
print_info "github.token usage: $github_token_usage occurrences"
print_info "CODEX_PAT usage: $codex_pat_usage occurrences"

if [[ $github_token_usage -gt 0 && $codex_pat_usage -eq 0 ]]; then
    print_error "Using github.token without CODEX_PAT fallback - LIMITED PERMISSIONS"
    echo "  This is likely the cause of permission issues!"
elif [[ $codex_pat_usage -gt 0 ]]; then
    print_status "CODEX_PAT is configured in workflows"
else
    print_warning "No token usage detected"
fi

print_header "Testing GitHub CLI access..."

# Test if gh CLI is available and can access the repo
if command -v gh >/dev/null 2>&1; then
    print_status "GitHub CLI (gh) is available"
    
    # Test authentication
    if gh auth status >/dev/null 2>&1; then
        print_status "GitHub CLI is authenticated"
        
        # Test repository access  
        if gh repo view wdhunter645/LGFC-WEBAPP --json name >/dev/null 2>&1; then
            print_status "Can access repository via GitHub CLI"
        else
            print_error "Cannot access repository via GitHub CLI"
        fi
    else
        print_warning "GitHub CLI is not authenticated"
    fi
else
    print_warning "GitHub CLI (gh) not available for testing"
fi

print_header "Summary and Recommendations..."

echo ""
echo -e "${CYAN}🎯 DIAGNOSIS RESULTS:${NC}"
echo "===================="

# Determine the most likely issue
if [[ $github_token_usage -gt 0 && $codex_pat_usage -eq 0 ]]; then
    echo -e "${RED}❌ PRIMARY ISSUE IDENTIFIED:${NC}"
    echo "   Workflows are using github.token which has LIMITED permissions"
    echo "   This prevents Copilot/Codex from performing advanced operations"
    echo ""
    echo -e "${GREEN}🛠️ SOLUTION:${NC}"
    echo "   1. Create a Personal Access Token (PAT) with full repository permissions"
    echo "   2. Add it as a repository secret named 'CODEX_PAT'"
    echo "   3. Update workflows to use the PAT (already done in this PR)"
    echo ""
elif [[ $codex_pat_usage -gt 0 ]]; then
    echo -e "${YELLOW}⚠️ POTENTIAL ISSUE:${NC}"
    echo "   Workflows are configured to use CODEX_PAT"
    echo "   The token may be missing, expired, or have insufficient permissions"
    echo ""
    echo -e "${GREEN}🛠️ SOLUTION:${NC}"
    echo "   1. Check if CODEX_PAT secret exists in repository settings"
    echo "   2. If missing, create a new PAT and add it as a repository secret"
    echo "   3. If exists, verify the token hasn't expired and has correct permissions"
    echo ""
else
    echo -e "${BLUE}ℹ️ STATUS:${NC}"
    echo "   No obvious token configuration issues detected"
    echo "   Permission issues may be caused by other factors"
fi

echo -e "${CYAN}📖 NEXT STEPS:${NC}"
echo "1. Review the detailed guide: GITHUB_SECRETS_SETUP.md"
echo "2. Set up required repository secrets"
echo "3. Test workflow functionality"
echo "4. Verify Copilot/Codex operations work correctly"

echo ""
echo -e "${GREEN}✨ Configuration files updated in this diagnostic:${NC}"
echo "   - GITHUB_SECRETS_SETUP.md (comprehensive setup guide)"
echo "   - Updated workflow files to use CODEX_PAT with github.token fallback"

echo ""
print_status "Diagnostic complete! Review the results above and follow the setup guide."