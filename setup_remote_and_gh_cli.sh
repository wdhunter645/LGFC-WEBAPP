#!/usr/bin/env bash
# Configure Git remote “origin” and ensure GitHub CLI (gh) is installed.
# Usage: ./setup_remote_and_gh_cli.sh https://github.com/<owner>/<repo>.git

set -euo pipefail

REPO_URL="${1:-}"

if [[ -z "$REPO_URL" ]]; then
  echo "Usage: $0 <repo-url>"
  exit 1
fi

echo "→ Configuring git remote…"
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi
git remote -v

echo "→ Installing GitHub CLI if missing…"
if ! command -v gh &>/dev/null; then
  if command -v apt-get &>/dev/null; then
    sudo apt-get update
    sudo apt-get install -y gh
  else
    echo "Please install GitHub CLI manually: https://cli.github.com/"
    exit 1
  fi
fi
gh --version

echo "→ Authenticating GitHub CLI (interactive)…"
if ! gh auth status &>/dev/null; then
  gh auth login
fi

echo "→ Ensuring 'main' tracks origin/main…"
git fetch origin
git branch -M main
git push -u origin main

echo "Setup complete."
