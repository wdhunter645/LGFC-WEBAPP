# Issues List (Monitored Routines)

The following workflows and jobs should be monitored and have runbooks:

- CI
- search-cron
- Traffic Simulator
- Traffic Simulator (Monitored)
- ALS Events Scraper
- Supabase Daily Schema Backup
- Supabase Weekly Full Backup
- Supabase Monthly Full Backup
- Backup Cleanup - Retention Policy Enforcement
- Voting Automation
- Dev-Bot: Implementation Loop
- Ops-Bot: Alert Loop
- Policy Guard
- Temp Fix TTL Monitor

Next:
- Create ops/jobs/<job>/README.md, diagnose.sh, and run.sh per item above.
- Link each GitHub workflow job to its corresponding scripts.
- Ensure alerting is configured for failures.
