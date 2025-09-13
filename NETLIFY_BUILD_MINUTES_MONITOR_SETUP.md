# Netlify Build Minutes Monitor Setup Guide

This document provides step-by-step instructions for setting up the automated Netlify build minutes monitoring system.

## Overview

The `.github/workflows/netlify-build-minutes-monitor.yml` workflow:
- Runs every hour to monitor build minute usage
- Creates GitHub issues when usage crosses configurable thresholds (75%, 90%, 100%)
- Prevents service outages by proactively alerting the team
- Uses the Netlify API to query account usage data

## Setup Instructions

### Step 1: Generate Netlify Personal Access Token

1. Go to your [Netlify dashboard](https://app.netlify.com/)
2. Click on your profile/avatar in the top right
3. Select **User settings**
4. Navigate to **Personal access tokens**
5. Click **New access token**
6. Give it a descriptive name: `LGFC Build Minutes Monitor`
7. Select the following permissions:
   - `Sites:Read` (minimum required)
   - Optionally `Account:Read` for additional account details
8. Click **Generate token**
9. **IMPORTANT**: Copy the token immediately - you won't see it again!

### Step 2: Find Your Netlify Account ID

**Method 1 - From Dashboard URL:**
1. In your Netlify dashboard, the URL will look like: `https://app.netlify.com/teams/YOUR_ACCOUNT_ID/overview`
2. Copy the `YOUR_ACCOUNT_ID` portion

**Method 2 - From Account Settings:**
1. Go to **User settings** > **Account settings**
2. Your account ID will be displayed in the account information section

### Step 3: Add Repository Secrets

1. Go to your GitHub repository: `https://github.com/wdhunter645/LGFC-WEBAPP`
2. Click **Settings** tab
3. Select **Secrets and variables** > **Actions** from the left sidebar
4. Click **New repository secret**

Add these two secrets:

**Secret 1: NETLIFY_AUTH_TOKEN**
- Name: `NETLIFY_AUTH_TOKEN`
- Value: [The token you generated in Step 1]

**Secret 2: NETLIFY_ACCOUNT_ID**  
- Name: `NETLIFY_ACCOUNT_ID`
- Value: [The account ID from Step 2]

### Step 4: Verify Setup

The workflow will run automatically every hour. To test immediately:

1. Go to **Actions** tab in your repository
2. Select **Netlify Build Minutes Monitor** from the workflows list
3. Click **Run workflow** > **Run workflow**
4. Monitor the execution to ensure it works correctly

## Configuration Options

### Customizing Alert Thresholds

Edit `.github/workflows/netlify-build-minutes-monitor.yml` around lines 45-47:

```bash
WARNING_THRESHOLD=75    # Default: 75% - adjust as needed
CRITICAL_THRESHOLD=90   # Default: 90% - adjust as needed  
EMERGENCY_THRESHOLD=100 # Default: 100% - keep at 100% for quota exhaustion
```

### Adjusting Schedule

Change the cron schedule on line ~27:
```yaml
- cron: "0 * * * *"  # Every hour
# Examples:
# - cron: "0 */2 * * *"  # Every 2 hours
# - cron: "0 9,17 * * *" # 9 AM and 5 PM daily
```

## Understanding Alerts

### Warning Level (75%+)
- **Priority**: Medium
- **Labels**: `ops,netlify,build-minutes,priority:medium`
- **Action**: Monitor usage, consider optimizations

### Critical Level (90%+)
- **Priority**: High  
- **Labels**: `ops,netlify,build-minutes,priority:high`
- **Action**: Immediate attention required, prepare for quota exhaustion

### Emergency Level (100%)
- **Priority**: Critical
- **Labels**: `ops,netlify,build-minutes,priority:critical`  
- **Action**: Quota exhausted - site at risk of going offline

## Troubleshooting

### Common Issues

**Error: "NETLIFY_AUTH_TOKEN secret not configured"**
- Ensure you've added the `NETLIFY_AUTH_TOKEN` repository secret
- Check the token hasn't expired (Netlify tokens can be set to expire)

**Error: "Failed to connect to Netlify API"**
- Verify your internet connection and Netlify service status
- Check if the token has proper permissions (Sites:Read minimum)

**Error: "Netlify API returned error - check credentials"**  
- Verify the `NETLIFY_ACCOUNT_ID` is correct
- Ensure the token has access to the specified account
- Check if your Netlify account is active

### Monitoring Reports

The workflow generates detailed reports in the `netlify-monitoring/` directory:
- Usage percentages and remaining minutes
- Threshold comparisons  
- API response status
- Alert generation status

### Manual Testing

To test the workflow without waiting for the schedule:
1. Go to repository **Actions** tab
2. Select **Netlify Build Minutes Monitor**
3. Click **Run workflow**
4. Monitor execution logs for any issues

## Security Considerations

- Repository secrets are encrypted and only accessible to the workflow
- The workflow uses read-only Netlify API permissions
- API tokens should be rotated periodically for security
- Monitor GitHub Actions usage as this workflow runs frequently

## Support

If you encounter issues:
1. Check the workflow execution logs in the Actions tab
2. Review the generated monitoring reports
3. Verify your Netlify account permissions and quotas
4. Create an issue in the repository with relevant error logs

## Next Steps

After setup:
1. Monitor the first few workflow runs to ensure proper operation
2. Adjust thresholds based on your typical usage patterns
3. Consider setting up Slack/email notifications for critical alerts
4. Review and optimize build processes to reduce minute consumption

---

*This monitoring system helps prevent unexpected service outages due to Netlify quota exhaustion under their subscription policies.*