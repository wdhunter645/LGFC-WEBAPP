# Activity Log & Handoff Protocol

Purpose
- Create a durable, skimmable record of what changed, why, and what happens next
- Enable smooth handoffs between sessions, devices, and contributors

When to Log
- End of each working session
- Before/after significant merges or deploys
- When switching devices (e.g., desktop ↔ iPad)

Required Fields
- Date/Time (with timezone)
- Participants/Owners
- Session Goal (what we intended to do)
- Changes Made (file paths, branches, PRs)
- Why (rationale and context)
- Decisions (prefix lines with "Decision:")
- Next (explicit next actions; prefix lines with "Next:")
- Links (PRs, Issues, Workflow runs)
- Risks/Blockers
- Rollback Plan (if applicable)

Template
```
# Activity Log — YYYY-MM-DD

- Date/Time: 2025-08-18 14:30 ET (18:30 UTC)
- Participants/Owners: @wdhunter645, background agent
- Session Goal: <brief goal>

## Changes Made
- <path/to/file> — <short description>
- <branch/PR> — <short description>

## Why
- <rationale for the change>

## Decisions
- Decision: <concise decision statement>

## Next
- Next: <first concrete next step>
- Next: <second step>

## Links
- PR: <url>
- Issue: <url>
- Workflow Run: <url>

## Risks/Blockers
- <risk or blocker>

## Rollback Plan
- <how to revert or mitigate>
```

Location
- One file per day under `docs/activity-log/` named `YYYY-MM-DD.md`

