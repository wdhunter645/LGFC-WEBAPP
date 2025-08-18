# Project Context

- Org/Repo: this repository
- Default branch: main
- Timezone: America/New_York (daily start 06:00)

Issue conventions:
- Labels: `status:*`, `priority:*`, `dev`, `feature`, `ops`, `report`
- Use a comment line starting with `Next:` (or `Next action:`) to record the next step

PR conventions:
- Draft first, small scoped changes, clear summary and checklist
- Link to the driving Issue

CI/CD:
- Use GitHub Actions; treat failures as high priority

Policies:
- Keep secrets out of code; least privilege for automation
- Infra changes require plan/dry-run and rollback steps

Daily cadence:
- At 06:00 ET, dev-bot prepares a plan; ops-bot publishes a report
- Work from highest priority open Issues first; keep `Next:` updated