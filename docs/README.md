# Security Reports

This directory contains security scan reports and vulnerability assessments.

## Report Structure

### Code Analysis
- **eslint-security.log** - ESLint security-focused analysis
- **secrets-scan.log** - Hardcoded secrets detection
- **sql-injection-scan.log** - SQL injection vulnerability scan

### Dependency Analysis  
- **npm-audit.json** - NPM audit results in JSON format
- **npm-audit.log** - Human-readable NPM audit results
- **vulnerability-db.log** - Known vulnerability database check

### Infrastructure Analysis
- **config-security.log** - Configuration security assessment

### Summary
- **security-summary.log** - Overall security status and recommendations

## Security Scanning Schedule

- **Daily**: Comprehensive security scans (3 AM UTC)
- **On Push**: Security validation for main branch
- **On PR**: Security assessment for pull requests
- **Manual**: Available via workflow dispatch

## Security Scoring

The security scan generates an overall security status:
- 🟢 **EXCELLENT**: No issues found
- 🟡 **GOOD**: Minor issues found (≤3 total issues)
- 🟠 **NEEDS ATTENTION**: Multiple issues found (4-10 total issues) 
- 🔴 **CRITICAL**: Many issues found (>10 total issues)