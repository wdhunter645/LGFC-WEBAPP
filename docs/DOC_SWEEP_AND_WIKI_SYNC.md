# Documentation Sweep and Wiki Sync Workflow

## Overview

The `doc_sweep_and_sync.yml` workflow automatically manages markdown files in the repository and synchronizes them with the GitHub Wiki. This workflow runs every 24 hours to maintain organized documentation and keep the Wiki updated with "New" badges for recent content.

## Features

### 1. Automatic Markdown File Sweeping
- **Collects** all `.md` files from the repository (excluding specific directories)
- **Moves** them to the `docs/` directory for centralized documentation
- **Archives** previous versions when files are updated
- **Skips** identical files to avoid unnecessary operations

### 2. Wiki Synchronization
- **Compares** documentation files with corresponding Wiki pages
- **Adds** red "New" badges to updated sections/paragraphs
- **Includes** hidden timestamp comments for tracking
- **Removes** "New" badges after 30 days automatically

### 3. Intelligent Processing
- **Preserves** file history through archiving
- **Handles** duplicate content intelligently
- **Provides** detailed logging and reporting
- **Supports** dry-run mode for testing

## Excluded Directories

The following directories are **excluded** from the sweep:
- `docs/` - Target directory
- `.github/` - GitHub configuration
- `node_modules/` - Package dependencies
- `vendor/` - Vendor libraries
- `.git/` - Git internals
- `.cursor/` - Editor configuration
- Hidden directories (starting with `.`)

## Workflow Schedule

- **Automatic**: Every 24 hours at 2:00 AM UTC
- **Manual**: Can be triggered via workflow dispatch
- **Options**: Supports dry-run and force-sync modes

## File Structure Created

```
docs/
├── .gitkeep                    # Ensures directory is committed
├── archive/                    # Previous versions of updated files
│   ├── .gitkeep
│   └── filename_timestamp.md   # Archived files
├── sweep-reports/              # Workflow execution logs
│   ├── .gitkeep
│   ├── sweep-YYYYMMDD_HHMMSS.log
│   ├── wiki-sync-YYYYMMDD_HHMMSS.log
│   └── summary-YYYYMMDD_HHMMSS.md
└── [markdown files]            # All swept markdown files
```

## Wiki Integration

### New Badge Format
```html
<span style="background: #ff0000; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; font-weight: bold;">New</span>
<!-- timestamp:1234567890 -->
```

### Badge Lifecycle
1. **Added** when content is new or updated
2. **Maintained** for 30 days
3. **Removed** automatically after 30 days
4. **Tracked** via hidden HTML timestamp comments

## Workflow Inputs

When triggering manually:

- **dry_run**: Run without making actual changes (default: false)
- **force_sync**: Force synchronization of all documentation (default: false)

## Permissions Required

The workflow requires these GitHub permissions:
- `contents: write` - To modify repository files
- `issues: write` - To create status issues if needed
- `pull-requests: write` - To update PR descriptions

## Security Considerations

- Uses `GITHUB_TOKEN` for authenticated operations
- Follows firewall-safe API access patterns
- Early API calls before potential firewall activation
- Graceful fallback for Wiki access issues

## Monitoring and Troubleshooting

### Log Files
All operations are logged to `docs/sweep-reports/` with timestamps:
- **Sweep logs**: Details of file movements and decisions
- **Wiki sync logs**: Information about Wiki updates and badge management
- **Summary reports**: Markdown formatted summaries of each run

### Common Issues

1. **Wiki Not Accessible**
   - Check if Wiki is enabled in repository settings
   - Verify API permissions and token access
   - Review firewall-related errors in logs

2. **File Conflicts**
   - Previous versions are automatically archived
   - Check `docs/archive/` for backed up content
   - Review sweep logs for conflict resolution details

3. **Badge Management**
   - Timestamps are in Unix epoch format
   - 30-day calculation is precise to the second
   - Manual badge removal may be needed for corrupted timestamps

### Manual Operations

You can test the sweep functionality locally:
```bash
# Test sweep functionality
./test_sweep_functionality.sh

# Test Wiki functions
./test_wiki_functionality.sh
```

## Integration with Existing Workflows

This workflow is designed to complement existing repository workflows:
- **Follows** established patterns from other workflows
- **Respects** branch audit and firewall considerations
- **Integrates** with existing reporting and logging systems
- **Maintains** consistency with repository standards

## Future Enhancements

Planned improvements:
- Enhanced markdown-to-HTML conversion
- Better content diffing algorithms
- Support for custom badge styles
- Integration with issue tracking for major changes
- Automated Wiki page creation for new documentation

---

*This workflow is part of the LGFC-WEBAPP repository's comprehensive automation system.*