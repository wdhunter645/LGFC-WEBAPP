#!/bin/bash

# ========== Style Helpers ==========
green="\\033[1;32m"
red="\\033[1;31m"
yellow="\\033[1;33m"
blue="\\033[1;34m"
reset="\\033[0m"

# ========== Installer Functions ==========

install_node_npm() {
  echo -e "${blue}📦 Installing Node.js and npm...${reset}"
  if command -v node >/dev/null && command -v npm >/dev/null; then
    echo -e "${green}✅ Node.js and npm already installed.${reset}"
  else
    sudo apt update && sudo apt install -y nodejs npm
    echo -e "${green}✅ Node.js and npm installed.${reset}"
  fi
}

install_netlify_cli() {
  echo -e "${blue}☁️ Installing Netlify CLI...${reset}"
  if command -v netlify >/dev/null; then
    echo -e "${green}✅ Netlify CLI already installed.${reset}"
  else
    sudo npm install -g netlify-cli && echo -e "${green}✅ Netlify CLI installed.${reset}" || echo -e "${red}❌ Netlify CLI install failed.${reset}"
  fi
}

install_b2_cli() {
  echo -e "${blue}💾 Installing Backblaze B2 CLI...${reset}"
  if command -v b2 >/dev/null; then
    echo -e "${green}✅ B2 CLI already installed.${reset}"
  else
    pip3 install --upgrade b2 && echo -e "${green}✅ B2 CLI installed.${reset}" || echo -e "${red}❌ B2 CLI install failed.${reset}"
  fi
}

# ========== Install All ==========
main() {
  echo -e "${yellow}🔍 Starting full CLI installation routine...${reset}"
  install_node_npm
  install_netlify_cli
  install_b2_cli
  echo -e "${green}🎉 All CLI installation attempts complete.${reset}"
  echo -e "🔍 Run ${blue}./check_cli_tools.sh${reset} to verify installation status."
}

main
