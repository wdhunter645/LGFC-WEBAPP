# Incident Response Bot Documentation

## Overview

The Incident Response Bot is an automated workflow that runs hourly to detect potential incidents in the repository and creates GitHub issues when problems are found. It provides comprehensive monitoring across multiple areas and can be customized for specific needs.

## Schedule & Triggers

- **Scheduled Execution**: Runs every hour at the top of the hour (`0 * * * *`)
- **Manual Execution**: Can be triggered manually via workflow_dispatch with custom parameters

## Input Parameters

When running manually, you can configure:

### check_type
- `all` (default): Run all incident checks
- `workflow_failures`: Check only for failed workflows
- `security_alerts`: Check only for security issues  
- `system_health`: Check only system health indicators
- `external_services`: Check only external service availability

### create_issue
- `true` (default): Create GitHub issues for detected incidents
- `false`: Run checks but don't create issues (analysis only)

### severity_threshold
- `medium` (default): Report incidents with medium severity and above
- `low`: Report all incidents including low severity
- `high`: Report only high and critical severity incidents
- `critical`: Report only critical severity incidents

## Incident Detection Areas

### 1. Workflow Failures
- Monitors failed workflow runs in the last 24 hours
- **High Severity**: Multiple failures (≥5) or critical workflow failures
- **Medium Severity**: Some workflow failures (1-4)
- **Critical workflows**: security-scans, ops-bot, health-checks

### 2. Security Alerts
- Checks for security advisories and alerts
- Monitors open security-labeled issues
- **Critical Severity**: Critical security issues open
- **High Severity**: Multiple security issues (≥3)
- **Medium Severity**: Some security issues (1-2)

### 3. System Health
- Analyzes repository activity patterns
- Detects spikes in critical issues
- Monitors build/deployment problems
- **High Severity**: ≥3 critical issues or multiple build problems
- **Medium Severity**: Low repository activity

### 4. External Services
- Tests availability of key external services
- Currently checks: Supabase, Netlify
- **Critical Severity**: Core service unavailable (Supabase)
- **High Severity**: Support service unavailable (Netlify)

## Output & Reporting

### Artifacts
- Complete incident reports uploaded as workflow artifacts
- JSON files for programmatic analysis
- Detailed logs for troubleshooting

### Issue Creation
- Creates GitHub issues for incidents meeting severity threshold
- Issues include:
  - Severity breakdown and incident counts
  - Detailed findings for critical/high priority items
  - Actionable remediation steps
  - Resolution checklist
  - Links to workflow run for full details

### Issue Labels
- `incident`: All incident issues
- `automated`: Auto-generated content
- `priority:low/medium/high/critical`: Based on severity
- `security`: Security-related incidents
- `ci-cd`: Workflow/build related incidents
- `infrastructure`: External service incidents
- `emergency`: Added for critical incidents

## Customization Guide

### Adding New Check Types

1. Add new option to workflow inputs:
```yaml
check_type:
  options:
    - your_new_check
```

2. Create new step with conditional execution:
```yaml
- name: Check your new area
  if: inputs.check_type == 'all' || inputs.check_type == 'your_new_check' || github.event_name == 'schedule'
```

3. Follow the existing pattern for check results:
```javascript
let checkResult = {
  type: 'your_new_check',
  timestamp: new Date().toISOString(),
  severity: 'low',
  incidents: []
};
```

### Modifying Severity Thresholds

Edit the JavaScript logic in each check step to adjust when incidents are classified as different severity levels.

Example from workflow failures:
```javascript
if (workflows.total_count >= 5) {
  checkResult.severity = workflows.total_count >= 10 ? 'critical' : 'high';
}
```

### Adding New External Services

In the "Check external services availability" step, add new service checks:
```bash
# Check new service
NEW_SERVICE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://your-service.com" || echo "000")
if [ "$NEW_SERVICE_STATUS" != "200" ]; then
  echo "⚠️ HIGH: New service unavailable (HTTP $NEW_SERVICE_STATUS)"
  # Update severity and incident count
fi
```

### Customizing Issue Templates

Modify the issue creation script in the "Create incident issue if needed" step to change:
- Issue title format
- Body content and structure
- Labels applied
- Resolution checklists

### Integration with Other Tools

The workflow can be extended to integrate with:
- Slack/Teams notifications
- PagerDuty/OpsGenie alerting
- Monitoring dashboards
- External incident management systems

Add new steps or modify existing ones to call external APIs or webhooks.

## Best Practices

1. **Start Conservative**: Begin with higher severity thresholds and adjust based on noise levels
2. **Regular Review**: Periodically review incident patterns to tune detection logic
3. **False Positive Handling**: Track and address common false positives by refining detection criteria  
4. **Escalation Paths**: Define clear escalation procedures for different incident types
5. **Testing**: Use manual dispatch to test changes before they run automatically

## Troubleshooting

### Workflow Not Running
- Check repository permissions for Actions
- Verify cron syntax in schedule
- Review Actions quota limits

### No Issues Created
- Check severity threshold settings
- Review consolidation logic for bugs
- Verify issue creation permissions

### False Positives
- Adjust detection thresholds in individual check steps
- Add exclusion logic for known non-issues
- Refine severity classification rules

### API Rate Limits
- Add error handling for GitHub API limits
- Implement backoff/retry logic
- Consider reducing check frequency

## Monitoring the Monitor

To ensure the incident response bot itself is healthy:
- Monitor for bot workflow failures
- Track issue creation patterns  
- Review artifact uploads for completeness
- Set up alerts for the bot's own issues

The ops-bot workflow can be configured to handle incident response bot failures, creating a resilient monitoring system.