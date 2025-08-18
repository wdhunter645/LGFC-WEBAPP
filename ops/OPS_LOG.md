# Ops Log
Persistent operational record to survive session archiving.

---

## 2025-08-18 — Ops alerts design (workflow_run)
Context
- Ops notifications were not "active"; no real-time alerts on GitHub Actions failures.

Decision
- Request ops-bot to add a `workflow_run`-triggered alert workflow for CI, Search Cron, Traffic Simulator, and Supabase backups.

Notes
- Keep daily report for summaries; add real-time failure alerts separately.
- Optional external channel: Slack via `SLACK_WEBHOOK_URL` secret.

Links
- Session: `SESSION_0818_CONTEXT.md`
- ADR: `ops/adr/0001-ops-alerts-workflow_run.md`

Next
- Open ops Issue and implement validation scenario after merge.
