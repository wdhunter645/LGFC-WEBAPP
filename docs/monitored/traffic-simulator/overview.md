# Traffic Simulator — Overview

Purpose
- Keep the Supabase-backed app warm and simulate user traffic to endpoints and APIs

Workflows
- `.github/workflows/traffic-simulator.yml` — basic run every 5 minutes
- `.github/workflows/traffic-simulator-monitored.yml` — monitored variant with simple self-restart loop and log upload

Runtime
- Node.js 20 on GitHub-hosted runner
- Installs repo dependencies with `npm ci`
- Runs `lgfc_enhanced_jwt_traffic_simulator.cjs` for ~4 minutes per run

Schedule
- Cron: every 5 minutes; can also be triggered manually via workflow_dispatch

Requirements
- No secrets required by the simulator itself
- Network access to public endpoints of the deployed site

Outputs
- Standard Action logs; monitored job uploads `logs/` artifact when present
