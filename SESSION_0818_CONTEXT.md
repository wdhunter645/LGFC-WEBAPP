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

Impact: Ops notifications are not "active" or real-time because there are no event-based triggers for failures, and no external notification channels.

---

## ✅ Conclusion (Why it’s not triggering)
- The ops bot is not configured to listen to actionable events (e.g., `workflow_run` on failure). It only runs manually or on a time windowed schedule, so no immediate notifications occur when Actions fail.

---

## 🛠️ Remediation Plan
1. Add a new workflow `ops-bot-on-failure.yml`:
   - Trigger: `workflow_run` with `types: [completed]` for critical workflows (e.g., CI, Search Cron, Traffic Simulator, Supabase backups).
   - Condition: `if: ${{ github.event.workflow_run.conclusion != 'success' }}` to limit to failed/timed_out/cancelled.
   - Action: Create/update a single "Ops Alert" issue and optionally post to Slack via `SLACK_WEBHOOK_URL` (if configured).
   - Permissions: `actions: read`, `issues: write`, `contents: read`.
2. Consider adding `issues`/`issue_comment` triggers if you want the bot to react to ops-labeled issues.
3. Keep the Daily Report as a morning summary; ensure it does not block real-time alerts.

---

## 📂 Files Reviewed
- `.github/workflows/ops-bot.yml`
- `.github/workflows/ops-bot-daily-report.yml`
- `.github/workflows/dev-ops-create-issue.yml`

---

## 📋 Next Actions
- [ ] Create `ops-bot-on-failure.yml` with `workflow_run` trigger and failure filter
- [ ] Configure `SLACK_WEBHOOK_URL` (optional) for external alerts
- [ ] Test by intentionally failing a small workflow and verifying the alert
- [ ] Document behavior in `CONTEXT_TRACKING.md`

---

## 🧭 Notes
- This session focuses on notification triggers and behavior; no code execution changes were made.

