#!/usr/bin/env bash
set -euo pipefail

# Sample codex.sh
echo "Codex environment ready!"

# grant_codex_access.sh
#!/usr/bin/env bash
set -euo pipefail

# --- Require a PAT with sufficient scopes -----------------------------
: "${GITHUB_PAT:?Set GITHUB_PAT (repo, workflow, write:repo_hook scopes) before running}"

# --- Configure Git identity ------------------------------------------
git config --global user.name  "codex-bot"
git config --global user.email "codex@example.com"

# --- Point origin to use the PAT -------------------------------------
url="$(git remote get-url origin 2>/dev/null || echo "")"

# Normalize SSH URLs to HTTPS if needed
if [[ "$url" == git@github.com:* ]]; then
  repo="${url#git@github.com:}"
  repo="${repo%.git}"
  url="https://github.com/${repo}.git"
fi

# Inject PAT into remote URL
secure_url="${url/https:\/\/github.com/https:\/\/x-access-token:${GITHUB_PAT}@github.com}"
git remote set-url origin "$secure_url"

# --- Authenticate GitHub CLI for PR approvals ------------------------
if command -v gh >/dev/null; then
  echo "$GITHUB_PAT" | gh auth login --with-token
fi

echo "Codex now has commit/push/delete and PR approval access."
