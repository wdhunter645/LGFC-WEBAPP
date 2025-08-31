# Copilot Instructions

Here are the instructions for using Copilot...

## Security Workflow Management

As the assigned Copilot agent for security configuration and updates, I am responsible for:

### Security Scans Workflow (`security-scans.yml`)
- Monitor daily security scan results in `security-scans/` directory
- Suggest improvements to vulnerability detection patterns
- Optimize scan performance and reduce false positives
- Recommend new security tools and integrations
- Alert on critical security findings requiring immediate attention

### Dependency Security Updates (`dependency-security-updates.yml`)
- Monitor dependency vulnerabilities and automated updates
- Review security fix effectiveness
- Suggest dependency upgrade strategies
- Coordinate security patch deployment

### Ongoing Security Configuration
- Track security baseline configurations
- Update detection patterns for emerging threats
- Maintain security documentation
- Provide proactive security recommendations

### How to Engage Copilot for Security
- `@copilot review security configuration` - Comprehensive security assessment
- `@copilot optimize security-scans workflow` - Performance improvements
- `@copilot add security detection patterns for [threat-type]` - Pattern updates
- `@copilot analyze security-scans reports` - Report analysis and recommendations

### Branch Audit and Firewall Management
- Monitor branch audit system functionality and firewall compatibility
- Troubleshoot GitHub API connectivity issues in workflows
- Maintain workflow ordering to ensure API access before firewall activation
- Recommend allowlisting GitHub API endpoints if persistent firewall issues occur:
  - `api.github.com` for GitHub API access
  - `github.com` for GitHub CLI operations
- Review and optimize branch management automation workflows