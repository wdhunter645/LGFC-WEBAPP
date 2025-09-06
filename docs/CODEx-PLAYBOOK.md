# CODEx Playbook — LGFC-WEBAPP (final)

## Goal
Enable Codex (via GitHub Actions) to: open PRs, approve/auto-merge eligible PRs, and push/delete branches — without touching the fragile chat sandbox.

---

## 0) One-time repo settings (UI)
Repo → **Settings → Actions → General**
- **Workflow permissions:** **Read and write permissions**
- ✅ **Allow GitHub Actions to create and approve pull requests**
- Save

> You **do not** need a PAT for same-repo ops. Use the built-in `${{ github.token }}`.

---

## 1) Add canonical CI check (required name)
Create **`.github/workflows/build-test.yml`**:

```yaml
name: build/test workflow

on:
  pull_request:
  push:
    branches-ignore: [main]   # PRs to main still run

permissions:
  contents: read

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install deps (tolerant)
        run: npm ci || npm install
      - name: Test (if present)
        run: npm test --if-present
      - name: Build (if present)
        run: npm run build --if-present
```

This produces the status context: **`build/test workflow / build-test`**  
(If you later re-enable protections, require **that exact** string.)

---

## 2) Auto-open PRs on branch push
Create **`.github/workflows/auto-open-pr.yml`**:

```yaml
name: open-pr

on:
  push:
    branches-ignore: [main, 'dependabot/**']

permissions:
  contents: write
  pull-requests: write

jobs:
  open-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ensure PR exists from this branch to main
        env:
          GH_TOKEN: ${{ github.token }}
          BRANCH: ${{ github.ref_name }}
        run: |
          set -e
          if gh pr list --head "$BRANCH" --base main --json number --jq '.[0].number' | grep -q '^[0-9]\+$'; then
            echo "PR already exists."
            exit 0
          fi
          gh pr create --base main --head "$BRANCH" \
            --title "Auto PR: $BRANCH → main" \
            --body "Opened automatically by open-pr workflow."
```

---

## 3) Let Codex approve & auto-merge on command
Create **`.github/workflows/codex-ops.yml`**:

```yaml
name: codex-ops

on:
  pull_request:
    types: [labeled]
  issue_comment:
    types: [created]

permissions:
  contents: write
  pull-requests: write

jobs:
  by-label:
    if: github.event_name == 'pull_request' && github.event.label.name == 'codex-approve'
    runs-on: ubuntu-latest
    steps:
      - name: Approve
        run: gh pr review "$NUMBER" --approve
        env:
          GH_TOKEN: ${{ github.token }}
          NUMBER: ${{ github.event.pull_request.number }}
      - name: Auto-merge (squash + delete branch)
        run: gh pr merge "$NUMBER" --squash --auto --delete-branch
        env:
          GH_TOKEN: ${{ github.token }}
          NUMBER: ${{ github.event.pull_request.number }}

  by-comment:
    if: >
      github.event_name == 'issue_comment' &&
      github.event.issue.pull_request != null &&
      (
        contains(github.event.comment.body, '/codex approve') ||
        contains(github.event.comment.body, '/codex merge')
      )
    runs-on: ubuntu-latest
    steps:
      - name: PR number
        id: pr
        run: echo "NUMBER=${{ github.event.issue.number }}" >> $GITHUB_OUTPUT
      - name: Approve (if requested)
        if: contains(github.event.comment.body, '/codex approve')
        run: gh pr review "${{ steps.pr.outputs.NUMBER }}" --approve
        env:
          GH_TOKEN: ${{ github.token }}
      - name: Auto-merge (if requested)
        if: contains(github.event.comment.body, '/codex merge')
        run: gh pr merge "${{ steps.pr.outputs.NUMBER }}" --squash --auto --delete-branch
        env:
          GH_TOKEN: ${{ github.token }}
```

Usage:
- Add label **`codex-approve`** to a PR, **or**
- Comment on the PR:
  ```
  /codex approve
  /codex merge
  ```

> If you later require **CODEOWNERS** reviews, a bot approval won’t satisfy that; a human code owner must approve.

---

## 4) Commit & PR (any of the above)
```bash
git checkout -b ci/codex-ops-setup
git add .github/workflows/*.yml
git commit -m "ci: add build/test, open-pr, codex-ops"
git push -u origin HEAD
gh pr create --fill --base main
```
Wait for **`build/test workflow / build-test`** to go green, then merge.

---

## 5) Finish PR #513 with Codex
Once `codex-ops.yml` is in **main**, open PR **#513** and either:
- add label **`codex-approve`**, or
- comment:
  ```
  /codex approve
  /codex merge
  ```

Auto-merge will wait for required checks (if any) and then merge + delete the branch.

---

## Notes
- The chat “Codex” environment is a sandbox (no remote, no network); use **GitHub Actions** or **Codespaces** for real read/write/delete.
- If you bring back protections later, require exactly: **`build/test workflow / build-test`**.
