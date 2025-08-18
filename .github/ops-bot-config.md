# Ops Bot Configuration (LGFC-WEBAPP)

## Purpose
Automate CI/CD, reliability, and operational hygiene tasks:
- Monitor failing GitHub Actions
- Create & label issues
- Assign owners
- Propose fixes via draft PRs

---

## Permissions
- Needs write access to Issues & Pull Requests
- Needs access to workflows: `.github/workflows/`

---

## Issue Templates

### Issue Title
ops-bot: {workflow-name} failure at {timestamp}

### Issue Body
**Workflow:** {workflow-name}  
**Failed At:** {timestamp}  
**Owner:** @{owner}  
**Error Log:**  
```
{error-log}
```
**Next:** {next-step}

### Labels
- ops
- priority:high
- workflow-failure

---

## Branch/PR Naming
- Branch: cursor/ops-bot/{slug}
- PR Title: ops-bot: {task}
- PR Body: Plan, Validation, Change, Rollback, Impact, Next:

---

## Daily Ops Bot Workflow (GitHub Actions)

```yaml name=.github/workflows/ops-bot-daily.yml
name: Ops Bot Daily CI/CD Maintenance

on:
  schedule:
    - cron: '0 6 * * *' # Daily at 06:00 New York Time
  workflow_dispatch:

jobs:
  ops-daily:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Scan Failing Workflows in Last 24h
        uses: actions/github-script@v7
        with:
          script: |
            const { Octokit } = require("@octokit/rest");
            const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
            const { owner, repo } = context.repo;
            const since = new Date(Date.now() - 24*60*60*1000).toISOString();
            const runs = await octokit.actions.listWorkflowRunsForRepo({ owner, repo, status: 'failure', per_page: 20 });
            for (const run of runs.data.workflow_runs) {
              if (new Date(run.created_at) > new Date(since)) {
                // Create Issue for failure
                await octokit.issues.create({
                  owner,
                  repo,
                  title: `ops-bot: ${run.name} failure at ${run.created_at}`,
                  body: `Workflow: ${run.name}\nFailed At: ${run.created_at}\nOwner: @${process.env.OPS_OWNER || owner}\nError Log:\n${run.conclusion}\nNext: Investigate and propose fix.`,
                  labels: ['ops', 'priority:high', 'workflow-failure']
                });
              }
            }

      - name: Triage Failing Workflows & Assign Owners
        run: echo "Assign owners and label issues (see ops-bot-config.md)"

      - name: Propose Fixes (Draft PR)
        run: echo "Propose fixes in infra/.github/k8s/terraform via draft PRs if needed"

      - name: Update Next Steps on Ops Issues
        run: echo "Update Next: comment on open ops issues"

      - name: End of Workflow
        run: echo "Ops bot daily maintenance complete."
```

---

## Example Environment Variable
- OPS_OWNER=wdhunter645

---

## Troubleshooting
- Ensure correct permissions for GITHUB_TOKEN (repo, issues, PRs)
- Bot must be able to read workflow logs
- Check logs for API rate limits/errors

---

## Next Steps
- Test by triggering a workflow failure
- Confirm issues are opened and labeled
- Validate owner assignment and draft PR creation