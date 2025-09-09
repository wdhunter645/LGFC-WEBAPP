# Deploy Reports

This directory contains deployment health check reports from Netlify preview deployments.

## Report Types

- **health-check-*.md** - Preview deployment health check summaries
- Reports include:
  - Build and test validation
  - Critical page accessibility
  - API endpoint availability
  - Performance metrics
  - Security headers validation
  - Content verification

## Integration

These reports are automatically generated for pull request preview deployments and posted as PR comments for review.