# 📚 LGFC-WEBAPP Documentation

This directory contains all markdown documentation for the Lou Gehrig Fan Club Web Application, automatically organized by the Documentation Sweep and Wiki Sync workflow.

## 📁 Directory Structure

- **Archive** (`archive/`) - Previous versions of updated documentation files
- **Reports** (`sweep-reports/`) - Workflow execution logs and summaries
- **Documentation** - All project documentation files, swept from across the repository

## 🔄 Automated Management

This documentation is **automatically managed** by the `doc_sweep_and_sync.yml` workflow which:

- ✅ Sweeps markdown files from the entire repository into this central location
- ✅ Synchronizes content with the GitHub Wiki
- ✅ Adds "New" badges to recently updated Wiki content
- ✅ Removes outdated "New" badges after 30 days
- ✅ Archives previous versions when files are updated
- ✅ Runs every 24 hours to maintain organization

## 🎯 Key Features

### File Organization
- **Centralized**: All `.md` files from the repository are collected here
- **Preserved**: Original files are moved (not copied) to avoid duplication
- **Archived**: When files are updated, previous versions are saved in `archive/`

### Wiki Integration
- **Synchronized**: Content changes are reflected in the GitHub Wiki
- **Badged**: New or updated sections get red "New" badges
- **Timed**: Badges are automatically removed after 30 days
- **Tracked**: Hidden timestamp comments track badge lifecycle

## 📊 Monitoring

Check the `sweep-reports/` directory for:
- **Sweep logs**: Details of file collection and organization
- **Wiki sync logs**: Information about Wiki updates and badge management  
- **Summary reports**: Overview of each workflow execution

## ⚙️ Configuration

The workflow excludes these directories from sweeping:
- `docs/` (this directory)
- `.github/` (GitHub configuration)
- `node_modules/` (dependencies)
- `vendor/` (vendor libraries)
- `.git/` (Git internals)

## 📖 More Information

See [DOC_SWEEP_AND_WIKI_SYNC.md](DOC_SWEEP_AND_WIKI_SYNC.md) for complete workflow documentation.

---

*Documentation automatically maintained by GitHub Actions*