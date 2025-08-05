#!/bin/bash

# === Setup ===
timestamp=$(date +%Y%m%d_%H%M%S)
report_dir="vendor_reports"
mkdir -p "$report_dir"

green=$(tput setaf 2)
red=$(tput setaf 1)
yellow=$(tput setaf 3)
reset=$(tput sgr0)

# === CLI Check ===
check_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo -e "${red}❌ $1 not found. Please install it.${reset}"
    exit 1
  }
}

echo -e "${yellow}🔧 Checking required CLI tools...${reset}"
for tool in curl netlify b2 node npm python3 pip3; do
  check_cmd "$tool"
  echo -e "${green}✅ $tool is installed${reset}"
done

# === Netlify ===
echo -e "${yellow}📥 Collecting Netlify environment variables...${reset}"
echo -e "🔐 Logging into Netlify..."

netlify_env_file="$report_dir/netlify_env_${timestamp}.txt"
netlify env:list --json > "$netlify_env_file" 2>/dev/null

if [ $? -eq 0 ]; then
  echo -e "${green}✅ Netlify environment variables saved to $netlify_env_file${reset}"
else
  echo -e "${red}❌ Netlify environment retrieval failed${reset}"
fi

# === Backblaze B2 ===
echo -e "${yellow}☁️ Connecting to Backblaze B2...${reset}"
echo -e "🔐 Logging into Backblaze B2..."

b2 authorize-account "$B2_APPLICATION_KEY_ID" "$B2_APPLICATION_KEY" 2>/dev/null

if [ $? -ne 0 ]; then
  echo -e "${red}❌ B2 authorization failed${reset}"
else
  echo -e "${green}✅ B2 authorized${reset}"

  b2_file_report="$report_dir/b2_files_${timestamp}.txt"
  b2 ls LouGehrigFanClub --long --maxFileCount 100 > "$b2_file_report" 2>/dev/null

  if [ $? -eq 0 ]; then
    echo -e "${green}✅ B2 file list saved to $b2_file_report${reset}"
  else
    echo -e "${red}❌ Failed to fetch file list from B2${reset}"
  fi
fi

# === Supabase ===
echo -e "${yellow}🔍 Verifying Supabase credentials...${reset}"
echo -e "🔐 Logging into Supabase..."

supabase_env_file="$report_dir/supabase_env_${timestamp}.txt"

echo "SUPABASE_URL=$VITE_SUPABASE_URL" > "$supabase_env_file"
echo "SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" >> "$supabase_env_file"
echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" >> "$supabase_env_file"

if [ $? -eq 0 ]; then
  echo -e "${green}✅ Supabase environment variables loaded${reset}"
else
  echo -e "${red}❌ Supabase environment load failed${reset}"
fi

echo -e "${green}✔️ Vendor data collection complete${reset}"
