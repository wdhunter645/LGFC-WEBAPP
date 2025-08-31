#!/bin/bash

# Setup Git remote and GitHub CLI
# Usage: ./scripts/setup_remote_and_gh_cli.sh <remote-url> [remote-name]
# Example: ./scripts/setup_remote_and_gh_cli.sh https://github.com/user/repo.git origin

set -euo pipefail

REMOTE_URL=${1:-}
REMOTE_NAME=${2:-origin}

if [ -z "$REMOTE_URL" ]; then
  echo "Usage: $0 <remote-url> [remote-name]"
  exit 1
fi

# Configure git remote
if git remote | grep -q "^${REMOTE_NAME}$"; then
  echo "Remote '$REMOTE_NAME' already exists. Updating URL..."
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
  echo "Adding remote '$REMOTE_NAME' with URL '$REMOTE_URL'"
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

# Ensure gh is installed
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI not found. Installing..."
  if command -v apt-get >/dev/null 2>&1; then
    type -p curl >/dev/null 2>&1 || sudo apt-get update && sudo apt-get install -y curl
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
    sudo apt-get update
    sudo apt-get install -y gh
  else
    echo "Unsupported platform: please install GitHub CLI manually"
    exit 1
  fi
else
  echo "GitHub CLI already installed."
fi

# Prompt to authenticate
echo "GitHub CLI installed. Run 'gh auth login' to authenticate."

# Set upstream for main branch if it exists
if git show-ref --verify --quiet refs/heads/main; then
  git fetch "$REMOTE_NAME"
  git branch --set-upstream-to "$REMOTE_NAME/main" main || true
fi

