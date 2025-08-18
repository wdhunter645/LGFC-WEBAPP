# Monitored GitHub Workflows

These workflows are monitored by ops-bot for failures (`workflow_run: completed`):

- CI (`.github/workflows/ci.yml`)
- search-cron (`.github/workflows/search-cron.yml`)
- Traffic Simulator (`.github/workflows/traffic-simulator.yml`)
- Traffic Simulator (Monitored) (`.github/workflows/traffic-simulator-monitored.yml`)
- Supabase Daily Schema Backup (`.github/workflows/supabase-backup-daily.yml`)
- Supabase Weekly Full Backup (`.github/workflows/supabase-backup-weekly.yml`)
- Supabase Monthly Full Backup (`.github/workflows/supabase-backup-monthly.yml`)
- ALS Events Scraper (`.github/workflows/als-events-scraper.yml`)
- Voting Automation (`.github/workflows/voting-automation.yml`)
- dev-bot (`.github/workflows/dev-bot.yml`)
- Dev-Bot: Daily Plan (`.github/workflows/dev-bot-daily-plan.yml`)
- Ops-Bot: Daily Report (`.github/workflows/ops-bot-daily-report.yml`)
- Dev-Ops: Create Issue (`.github/workflows/dev-ops-create-issue.yml`)
- Ops Test: Intentional Failure (`.github/workflows/ops-test-intentional-failure.yml`)
- Ops Test: Timeout (`.github/workflows/ops-test-timeout.yml`)
- Ops Self Test: Push Failure (`.github/workflows/ops-self-test.yml`)

Alerting paths
- Consolidated alerts: Issues titled "Ops Alerts (auto)"
- Per-failure triage Issues: titled `OPS: {workflow} failed (run #{n} on {branch})`
- Durable fallback: PRs appending to `infra/OPS_ALERTS_LOG.md`

Requirements
- Repository Actions setting: Workflow permissions must be "Read and write"; optionally enable PR creation
- Optional: `SLACK_WEBHOOK_URL` secret to post to Slack
