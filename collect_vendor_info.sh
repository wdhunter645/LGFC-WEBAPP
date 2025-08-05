#!/bin/bash

# === Setup color codes ===
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
ERROR_LOG="vendor_reports/error_log.txt"
mkdir -p vendor_reports

echo -e "\n🔍 Checking required CLI tools..."

REQUIRED_CMDS=("curl" "netlify" "b2" "node" "npm" "python3" "pip3")
for CMD in "${REQUIRED_CMDS[@]}"; do
    if ! command -v "$CMD" >/dev/null 2>&1; then
        echo -e "${RED}❌ $CMD is not installed${NC}" | tee -a "$ERROR_LOG"
    else
        echo -e "${GREEN}✅ $CMD is installed${NC}"
    fi
done

# === NETLIFY ===
echo -e "\n🌐 Collecting Netlify environment variables..."
NETLIFY_FILE="vendor_reports/netlify_env_$(date +%Y%m%d_%H%M%S).txt"
{
  netlify env:list --json > "$NETLIFY_FILE"
  echo -e "${GREEN}✅ Netlify environment saved to $NETLIFY_FILE${NC}"
} || {
  echo -e "${RED}❌ Netlify environment fetch failed${NC}" | tee -a "$ERROR_LOG"
}

# === BACKBLAZE B2 ===
echo -e "\n☁️  Connecting to Backblaze B2..."
B2_KEY_ID="${B2_APPLICATION_KEY_ID}"
B2_KEY="${B2_APPLICATION_KEY}"
B2_FILE="vendor_reports/b2_files_$(date +%Y%m%d_%H%M%S).txt"

if [[ -z "$B2_KEY_ID" || -z "$B2_KEY" ]]; then
    echo -e "${RED}❌ B2 credentials are missing from environment${NC}" | tee -a "$ERROR_LOG"
else
  {
    b2 account authorize "$B2_KEY_ID" "$B2_KEY" >/dev/null 2>&1
    b2 ls LouGehrigFanClub --long --maxFileCount 5 > "$B2_FILE"
    echo -e "${GREEN}✅ B2 file list saved to $B2_FILE${NC}"
  } || {
    echo -e "${RED}❌ B2 authorization or listing failed${NC}" | tee -a "$ERROR_LOG"
  }
fi

# === SUPABASE ===
echo -e "\n🔐 Verifying Supabase credentials..."
SUPABASE_FILE="vendor_reports/supabase_env_$(date +%Y%m%d_%H%M%S).txt"
if [[ -f "supabase_token.sh" ]]; then
  {
    source ./supabase_token.sh
    env | grep SUPABASE > "$SUPABASE_FILE"
    echo -e "${GREEN}✅ Supabase environment variables loaded${NC}"
  } || {
    echo -e "${RED}❌ Failed to source Supabase credentials${NC}" | tee -a "$ERROR_LOG"
  }
else
  echo -e "${RED}❌ supabase_token.sh file not found${NC}" | tee -a "$ERROR_LOG"
fi

echo -e "\n📦 Vendor data collection complete"
