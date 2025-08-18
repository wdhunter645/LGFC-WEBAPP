# Session 0818 — Ops Bot Notifications Review
_Date: 2025-08-18 (America/New_York)_

---

## 🎯 Goal
- Review GitHub Actions environment and identify why the ops bot is not triggering for active notifications.

---

## 🔎 Findings
- ops-bot workflow (`.github/workflows/ops-bot.yml`) is configured with `workflow_dispatch` only. It will never auto-trigger on repo activity.
- Daily report workflow (`.github/workflows/ops-bot-daily-report.yml`) is on a schedule (10:00 and 11:00 UTC) but self-gates to run only at 06:00 US/Eastern. It creates/updates a GitHub Issue; it does not send real-time notifications nor react to failures immediately.
- There is no workflow using `workflow_run`, `issues`, or `issue_comment` triggers to respond to events or failures in real time.
- No Slack/Discord/PagerDuty/webhook step is present; notifications are limited to GitHub Issues updates.
- Netlify previously built Deploy Previews for session/feature branches. Updated `netlify.toml` to deploy only from `main` and skip non-main branch builds.

Impact: Ops notifications are not "active" or real-time because there are no event-based triggers for failures, and no external notification channels.

---

## ✅ Conclusion (Why it’s not triggering)
- The ops bot is not configured to listen to actionable events (e.g., `workflow_run` on failure). It only runs manually or on a time windowed schedule, so no immediate notifications occur when Actions fail.

---

## 🛠️ Remediation Plan (aligned with dev-bot rules)
1. Open an `ops` Issue requesting ops-bot to add `ops-bot-on-failure.yml` with `workflow_run` failure alerts for CI, Search Cron, Traffic Simulator, and Supabase backups.
2. Include plan, validation, change, rollback, and `Next:` per ops-bot rules. Assign appropriate owner and label with `ops` and `priority:high`.
3. Keep the Daily Report workflow as a morning summary; real-time alerts handled by the new ops workflow.

---

## 📂 Files Reviewed
- `.github/workflows/ops-bot.yml`
- `.github/workflows/ops-bot-daily-report.yml`
- `.github/workflows/dev-ops-create-issue.yml`

---

## 📋 Next Actions
- [ ] Create GitHub Issue (labels: `ops`, `priority:high`) — Title: "ops-bot: add failure-triggered alerts (workflow_run)"
- [ ] Configure `SLACK_WEBHOOK_URL` secret (optional) for external alerts once ops workflow lands
- [x] Implement `.github/workflows/ops-bot-on-failure.yml` to alert on failures (consolidated Ops Alerts issue + optional Slack)
- [x] Implement `.github/workflows/ops-bot-triage.yml` to open per-failure ops Issues with details and labels
- [x] Configure Netlify to deploy only from `main` (skip non-main branches in `netlify.toml`)
- [ ] Test with a controlled failure and verify alerting
- [ ] Document behavior in `CONTEXT_TRACKING.md`

### Issue Draft (copy-paste)
Title: ops-bot: add failure-triggered alerts (workflow_run)

Body:

Problem
- Ops notifications are not real-time; failures in Actions do not trigger alerts.

Cause
- No `workflow_run`-based workflow listening for failures; ops-bot only manual or time-gated.

Plan
- Add `.github/workflows/ops-bot-on-failure.yml` triggered by `workflow_run` (types: completed) for CI, Search Cron, Traffic Simulator, and Supabase backups.
- Gate with `if: ${{ github.event.workflow_run.conclusion != 'success' }}` to only alert on failure/cancel/timeout.
- Action: Create/update a single "Ops Alerts" issue with failing run links; optional Slack via `SLACK_WEBHOOK_URL`.

Validation
- Induce a controlled failure in a sandbox workflow; confirm issue update and optional Slack message.

Rollback
- Revert workflow file or add label-based gates to mute alerts.

Impact
- Immediate visibility on failures; faster triage and MTTR reduction.

Next:
- Implement the workflow and run validation scenario.

---

## 🧭 Notes
- This session focuses on notification triggers and behavior; no code execution changes were made.

