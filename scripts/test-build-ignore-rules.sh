#!/bin/bash

#
# Build Ignore Rules Test Script
# 
# This script helps test the Netlify build ignore rules to ensure
# documentation and non-critical changes don't trigger builds.
#

set -e

echo "🧪 Testing Netlify Build Ignore Rules"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_ignore_rule() {
    local test_name="$1"
    local file_pattern="$2"
    local should_ignore="$3"
    
    echo -n "Testing $test_name: "
    
    # Create a temporary commit with the test file
    if [[ "$file_pattern" == *"/"* ]]; then
        # Handle directory patterns
        mkdir -p "$(dirname "$file_pattern")"
        echo "test content" > "$file_pattern"
    else
        echo "test content" > "$file_pattern"
    fi
    
    git add "$file_pattern" > /dev/null 2>&1 || true
    
    # Test the ignore rule (simulates Netlify's check)
    # Use the same command from netlify.toml
    if git diff --quiet HEAD -- . ':!*.md' ':!docs/' ':!README*' ':!CHANGELOG*' ':!LICENSE*' ':!.github/workflows/' ':!scripts/' ':!security-*' ':!audit-reports/' ':!backups/' ':!issues/' > /dev/null 2>&1; then
        result="IGNORED"
    else
        result="BUILD"
    fi
    
    # Clean up
    rm -f "$file_pattern"
    if [[ "$file_pattern" == *"/"* ]]; then
        rmdir "$(dirname "$file_pattern")" 2>/dev/null || true
    fi
    git reset HEAD "$file_pattern" > /dev/null 2>&1 || true
    
    # Check result
    if [[ "$should_ignore" == "true" && "$result" == "IGNORED" ]] || [[ "$should_ignore" == "false" && "$result" == "BUILD" ]]; then
        echo -e "${GREEN}✅ $result (expected)${NC}"
        return 0
    else
        echo -e "${RED}❌ $result (unexpected)${NC}"
        return 1
    fi
}

echo ""
echo "📝 Testing documentation files (should be IGNORED):"

test_ignore_rule "README.md" "README.md" true
test_ignore_rule "CHANGELOG.md" "CHANGELOG.md" true  
test_ignore_rule "LICENSE" "LICENSE" true
test_ignore_rule "docs/guide.md" "docs/guide.md" true
test_ignore_rule "project.md" "project.md" true

echo ""
echo "⚙️ Testing workflow files (should be IGNORED):"

test_ignore_rule "GitHub workflow" ".github/workflows/test.yml" true
test_ignore_rule "Scripts" "scripts/test.sh" true

echo ""
echo "🔒 Testing security/audit files (should be IGNORED):"

test_ignore_rule "Security scans" "security-scans/report.json" true
test_ignore_rule "Audit reports" "audit-reports/backup.md" true
test_ignore_rule "Backups" "backups/data.sql" true
test_ignore_rule "Issues" "issues/bug-report.md" true

echo ""
echo "🚀 Testing application files (should BUILD):"

test_ignore_rule "Source code" "src/pages/test.astro" false
test_ignore_rule "Package.json" "package.json" false
test_ignore_rule "Netlify config" "netlify.toml" false
test_ignore_rule "Astro config" "astro.config.mjs" false
test_ignore_rule "Styles" "src/styles/global.css" false

echo ""
echo "📊 Test Summary:"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed! Build ignore rules are working correctly.${NC}"
    echo ""
    echo "💡 This means:"
    echo "   - Documentation changes won't trigger builds"
    echo "   - Workflow and script changes won't trigger builds" 
    echo "   - Security scan results won't trigger builds"
    echo "   - Application code changes WILL trigger builds"
    echo ""
    echo "🎯 Expected build minute savings: 40-60% reduction in build frequency"
else
    echo -e "${RED}❌ Some tests failed! Please review the ignore rules in netlify.toml${NC}"
    exit 1
fi