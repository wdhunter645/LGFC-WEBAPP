# ADR 0001: Ops Alerts via workflow_run

Status: Proposed
Date: 2025-08-18

Context
Ops notifications are not real-time; failures in GitHub Actions do not trigger immediate alerts. Existing ops workflows are manual or scheduled.

Decision
Add an ops-managed workflow that listens to `workflow_run` (types: completed) for critical workflows and posts alerts (issue update, optional Slack) when conclusion != success.

Consequences
- Pros: Immediate visibility, faster triage, reduced MTTR
- Cons: Potential noise; mitigated with gating and label-based filters

Implementation Sketch
- File: `.github/workflows/ops-bot-on-failure.yml` (owned by ops-bot)
- Trigger: `workflow_run` for CI, Search Cron, Traffic Simulator, Supabase backups
- Filter: `if: ${{ github.event.workflow_run.conclusion != 'success' }}`
- Action: Update/create consolidated "Ops Alerts" issue; optional Slack via `SLACK_WEBHOOK_URL`

Rollback
Disable workflow or add stricter gates; revert commit.

Next
Create ops Issue to implement and validate.