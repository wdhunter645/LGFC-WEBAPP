#!/bin/bash

# === Setup colors ===
green="\\033[1;32m"
red="\\033[1;31m"
yellow="\\033[1;33m"
reset="\\033[0m"

echo -e "${yellow}🔍 Checking required CLI tools for vendor data collection...${reset}"

check_cmd() {
  if command -v "$1" >/dev/null; then
    echo -e "${green}✅ $1 is installed${reset}"
  else
    echo -e "${red}❌ $1 is NOT installed${reset}"
  fi
}

check_cmd curl
check_cmd netlify
check_cmd b2
check_cmd node
check_cmd npm
check_cmd python3
check_cmd pip3
