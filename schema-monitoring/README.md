# Schema Monitoring

This directory contains database schema monitoring and drift detection reports.

## Files

- **baseline_schema.sql** - Baseline schema for comparison
- **current_schema_*.sql** - Current schema snapshots (automatically cleaned up)
- **drift-report.log** - Schema drift detection reports

## Schema Drift Detection

The workflow runs every 4 hours to detect changes in the database schema structure. It:

- Compares current schema against the baseline
- Identifies additions, removals, and modifications
- Validates required tables exist
- Checks Row Level Security (RLS) policies
- Reports security-related schema issues

## Baseline Management

The baseline schema is automatically created on first run. To update the baseline (after approved schema changes), run the workflow manually via `workflow_dispatch`.