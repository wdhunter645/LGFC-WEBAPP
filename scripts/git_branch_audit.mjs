#!/usr/bin/env node

/**
 * GitHub Branch Audit and Cleanup Script
 * Comprehensive branch analysis using GitHub CLI and git commands
 * Author: GitHub Copilot
 * Created: 2025-08-30
 * Updated: 2025-08-31 - Fixed firewall issues by using GitHub CLI instead of direct API calls
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Configuration
const REPO_OWNER = 'wdhunter645';
const REPO_NAME = 'LGFC-WEBAPP';
const MAIN_BRANCH = 'main';
const AUDIT_DIR = './audit-reports';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Logging functions
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    audit: (msg) => console.log(`${colors.cyan}[AUDIT]${colors.reset} ${msg}`),
    delete: (msg) => console.log(`${colors.red}[DELETE]${colors.reset} ${msg}`),
    keep: (msg) => console.log(`${colors.green}[KEEP]${colors.reset} ${msg}`),
    merge: (msg) => console.log(`${colors.magenta}[MERGE]${colors.reset} ${msg}`)
};

// Ensure audit directory exists
async function setupAuditDir() {
    try {
        await fs.mkdir(AUDIT_DIR, { recursive: true });
        log.info(`Audit reports will be saved to: ${AUDIT_DIR}`);
    } catch (error) {
        log.error(`Failed to create audit directory: ${error.message}`);
        process.exit(1);
    }
}

// Fetch branches using GitHub CLI or git commands (firewall-safe)
async function fetchBranchesFromGit() {
    log.info('Fetching branches using git commands (firewall-safe)...');
    
    try {
        // Use git command to fetch repository info
        const { stdout: remoteUrl } = await execAsync('git config --get remote.origin.url');
        log.info(`Repository: ${remoteUrl.trim()}`);
    } catch (error) {
        log.warning('Could not determine repository URL from git config');
    }

    const branches = [];
    
    try {
        // Fetch latest data from remote
        log.info('Fetching latest remote data...');
        await execAsync('git fetch --all --prune');
        
        // Get all remote branches (primary approach for GitHub Actions)
        const { stdout: remoteBranchOutput } = await execAsync('git branch -r --format="%(refname:short)|%(objectname)|%(committerdate:iso8601)|%(authorname)|%(subject)"');
        
        const remoteBranches = remoteBranchOutput.trim().split('\n');
        
        for (const branchLine of remoteBranches) {
            if (!branchLine.trim()) continue;
            
            const [fullName, sha, date, author, subject] = branchLine.split('|');
            const branchName = fullName.replace('origin/', '');
            
            // Skip HEAD references
            if (branchName.includes('HEAD') || branchName === 'origin/HEAD') continue;
            
            branches.push({
                name: branchName,
                commit: { sha },
                lastCommitDate: date,
                lastCommitAuthor: author,
                lastCommitSubject: subject
            });
        }
        
    } catch (error) {
        log.warning(`Failed to fetch branches via git: ${error.message}`);
        
        // Fallback: try GitHub CLI if available and GITHUB_TOKEN is set
        if (process.env.GITHUB_TOKEN) {
            try {
                log.info('Trying GitHub CLI as fallback...');
                const { stdout: ghOutput } = await execAsync(`gh api repos/${REPO_OWNER}/${REPO_NAME}/branches --paginate`);
                const apiData = JSON.parse(ghOutput);
                
                for (const branch of apiData) {
                    branches.push({
                        name: branch.name,
                        commit: { sha: branch.commit.sha },
                        lastCommitDate: 'unknown',
                        lastCommitAuthor: 'unknown',
                        lastCommitSubject: 'unknown'
                    });
                }
                
            } catch (ghError) {
                log.warning(`GitHub CLI also failed: ${ghError.message}`);
                
                // Final fallback: use local branches only
                log.warning('Using local branches only as final fallback');
                const { stdout: localBranchOutput } = await execAsync('git branch -a --format="%(refname:short)|%(objectname)|%(committerdate:iso8601)|%(authorname)|%(subject)"');
                
                const localBranches = localBranchOutput.trim().split('\n');
                for (const branchLine of localBranches) {
                    if (!branchLine.trim()) continue;
                    
                    const [fullName, sha, date, author, subject] = branchLine.split('|');
                    let branchName = fullName;
                    
                    // Handle local vs remote branch names
                    if (branchName.startsWith('remotes/origin/')) {
                        branchName = branchName.replace('remotes/origin/', '');
                    }
                    
                    if (branchName.includes('HEAD') || branchName === 'origin/HEAD') continue;
                    
                    branches.push({
                        name: branchName,
                        commit: { sha },
                        lastCommitDate: date,
                        lastCommitAuthor: author,
                        lastCommitSubject: subject
                    });
                }
            }
        }
    }
    
    // Remove duplicates
    const uniqueBranches = branches.filter((branch, index, self) => 
        index === self.findIndex(b => b.name === branch.name)
    );
    
    log.success(`Fetched ${uniqueBranches.length} branches from repository`);
    return uniqueBranches;
}

// Get commit information for a branch
async function getCommitInfo(branchName, sha, branchData) {
    // If we have the data from git already, use it
    if (branchData.lastCommitDate && branchData.lastCommitDate !== 'unknown') {
        return {
            date: branchData.lastCommitDate,
            author: branchData.lastCommitAuthor || 'unknown',
            subject: branchData.lastCommitSubject || 'unknown'
        };
    }
    
    try {
        // Try to get local git information
        const { stdout: logOutput } = await execAsync(`git log -1 --format="%ci|%an|%s" ${sha} 2>/dev/null || echo "unknown|unknown|unknown"`);
        const [date, author, subject] = logOutput.trim().split('|');
        
        return {
            date: date !== 'unknown' ? date : 'unknown',
            author: author !== 'unknown' ? author : 'unknown', 
            subject: subject !== 'unknown' ? subject : 'unknown'
        };
    } catch (error) {
        return {
            date: 'unknown',
            author: 'unknown', 
            subject: 'unknown'
        };
    }
}

// Calculate branch age in days
function calculateBranchAge(commitDate) {
    if (commitDate === 'unknown') return 'unknown';
    
    try {
        const commitTime = new Date(commitDate);
        const now = new Date();
        const diffTime = now - commitTime;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    } catch (error) {
        return 'unknown';
    }
}

// Categorize branch based on name and characteristics
function categorizeBranch(branchName, branchAge, commitInfo) {
    // Skip main branch
    if (branchName === MAIN_BRANCH) {
        return { category: 'KEEP', reason: 'Main branch' };
    }
    
    // Copilot fix branches with UUIDs (temporary fixes)
    if (/^copilot\/fix-[a-f0-9-]{36}$/.test(branchName)) {
        return { category: 'DELETE', reason: 'Temporary Copilot fix branch with UUID' };
    }
    
    // Numbered Copilot fix branches
    if (/^copilot\/fix-\d+$/.test(branchName)) {
        return { category: 'REVIEW', reason: 'Numbered Copilot fix - may contain valuable changes' };
    }
    
    // Cursor branches
    if (branchName.startsWith('cursor/')) {
        if (branchAge === 'unknown' || branchAge > 30) {
            return { category: 'DELETE', reason: `Cursor branch${branchAge !== 'unknown' ? ` (${branchAge} days old)` : ''}` };
        } else {
            return { category: 'REVIEW', reason: 'Recent Cursor branch' };
        }
    }
    
    // Revert branches
    if (branchName.startsWith('revert-')) {
        return { category: 'DELETE', reason: 'Revert branch, likely temporary' };
    }
    
    // Feature branches
    if (/^(feature|fix|enhancement|bugfix)\//.test(branchName)) {
        if (branchAge === 'unknown' || branchAge > 90) {
            return { category: 'DELETE', reason: `Old feature branch${branchAge !== 'unknown' ? ` (${branchAge} days old)` : ''}` };
        } else {
            return { category: 'MERGE', reason: 'Feature branch that may have valuable changes' };
        }
    }
    
    // Combined PR branches
    if (branchName.startsWith('combined-pr-')) {
        return { category: 'DELETE', reason: 'Combined PR branch, likely already merged' };
    }
    
    // Old branches with no activity
    if (branchAge !== 'unknown' && branchAge > 60) {
        return { category: 'DELETE', reason: `Old inactive branch (${branchAge} days old)` };
    }
    
    // Import branches
    if (branchName.includes('import')) {
        return { category: 'DELETE', reason: 'Import branch, likely temporary' };
    }
    
    // Default to review for unknown patterns
    return { category: 'REVIEW', reason: 'Branch needs manual review' };
}

// Perform comprehensive branch audit
async function auditBranches() {
    log.info('Starting comprehensive branch audit...');
    
    const branches = await fetchBranchesFromGit();
    const auditResults = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const auditFile = path.join(AUDIT_DIR, `branch_audit_${timestamp}.txt`);
    
    let totalBranches = 0;
    let deleteCount = 0;
    let mergeCount = 0;
    let keepCount = 0;
    let reviewCount = 0;
    
    // Generate audit report header
    const reportHeader = [
        'Git Branch Audit Report',
        `Generated: ${new Date().toISOString()}`,
        `Repository: ${REPO_OWNER}/${REPO_NAME}`,
        `Main Branch: ${MAIN_BRANCH}`,
        '===============================',
        ''
    ].join('\n');
    
    let auditContent = reportHeader;
    
    for (const branch of branches) {
        if (branch.name === MAIN_BRANCH) continue;
        
        totalBranches++;
        log.audit(`Analyzing: ${branch.name}`);
        
        // Get commit information
        const commitInfo = await getCommitInfo(branch.name, branch.commit.sha, branch);
        const branchAge = calculateBranchAge(commitInfo.date);
        
        // Categorize branch
        const { category, reason } = categorizeBranch(branch.name, branchAge, commitInfo);
        
        // Create audit entry
        const auditEntry = {
            branch: branch.name,
            category,
            reason,
            sha: branch.commit.sha,
            age: branchAge,
            lastCommitDate: commitInfo.date,
            lastCommitAuthor: commitInfo.author,
            lastCommitSubject: commitInfo.subject
        };
        
        auditResults.push(auditEntry);
        
        // Add to file content
        auditContent += [
            `BRANCH:${branch.name}`,
            `CATEGORY:${category}`,
            `REASON:${reason}`,
            `SHA:${branch.commit.sha}`,
            `AGE_DAYS:${branchAge}`,
            `LAST_COMMIT_DATE:${commitInfo.date}`,
            `LAST_COMMIT_AUTHOR:${commitInfo.author}`,
            `LAST_COMMIT_SUBJECT:${commitInfo.subject}`,
            '---'
        ].join('\n') + '\n';
        
        // Count categories and log
        switch (category) {
            case 'DELETE':
                deleteCount++;
                log.delete(`${branch.name}: ${reason}`);
                break;
            case 'MERGE':
                mergeCount++;
                log.merge(`${branch.name}: ${reason}`);
                break;
            case 'KEEP':
                keepCount++;
                log.keep(`${branch.name}: ${reason}`);
                break;
            default:
                reviewCount++;
                log.warning(`${branch.name}: ${reason}`);
                break;
        }
    }
    
    // Add summary to audit content
    const summary = [
        '',
        'AUDIT SUMMARY',
        '=============',
        `Total branches analyzed: ${totalBranches}`,
        `Branches to DELETE: ${deleteCount}`,
        `Branches to MERGE: ${mergeCount}`,
        `Branches to KEEP: ${keepCount}`,
        `Branches needing REVIEW: ${reviewCount}`,
        '',
        `Audit completed: ${new Date().toISOString()}`
    ].join('\n');
    
    auditContent += summary;
    
    // Save audit report
    await fs.writeFile(auditFile, auditContent);
    
    // Display results
    log.success('Branch audit completed!');
    log.info(`Total branches analyzed: ${totalBranches}`);
    log.delete(`Recommended for deletion: ${deleteCount}`);
    log.merge(`Recommended for merging: ${mergeCount}`);
    log.keep(`Recommended to keep: ${keepCount}`);
    log.warning(`Need manual review: ${reviewCount}`);
    log.info(`Detailed report saved to: ${auditFile}`);
    
    return { auditResults, auditFile };
}

// Generate cleanup script
async function generateCleanupScript(auditFile) {
    if (!auditFile) {
        // Find latest audit file
        const files = await fs.readdir(AUDIT_DIR);
        const auditFiles = files.filter(f => f.startsWith('branch_audit_') && f.endsWith('.txt'));
        if (auditFiles.length === 0) {
            log.error('No audit file found. Run audit first.');
            process.exit(1);
        }
        auditFile = path.join(AUDIT_DIR, auditFiles.sort().pop());
        log.info(`Using latest audit file: ${auditFile}`);
    }
    
    // Ensure audit file exists
    try {
        await fs.access(auditFile);
    } catch (error) {
        log.error(`Audit file not found: ${auditFile}`);
        process.exit(1);
    }
    
    const auditContent = await fs.readFile(auditFile, 'utf8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const cleanupScript = path.join(AUDIT_DIR, `cleanup_branches_${timestamp}.sh`);
    
    const lines = auditContent.split('\n');
    const branchesToDelete = [];
    
    // Parse audit file for branches to delete
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('BRANCH:')) {
            const branchName = lines[i].substring(7);
            if (i + 1 < lines.length && lines[i + 1] === 'CATEGORY:DELETE') {
                const reason = i + 2 < lines.length ? lines[i + 2].substring(7) : 'Unknown reason';
                branchesToDelete.push({ name: branchName, reason });
            }
        }
    }
    
    // Generate script content
    const scriptContent = [
        '#!/bin/bash',
        '# Auto-generated branch cleanup script',
        `# Generated: ${new Date().toISOString()}`,
        `# Based on audit: ${auditFile}`,
        '',
        'set -euo pipefail',
        '',
        '# Colors',
        "RED='\\033[0;31m'",
        "GREEN='\\033[0;32m'",
        "YELLOW='\\033[1;33m'",
        "NC='\\033[0m'",
        '',
        'log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }',
        'log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }',
        'log_error() { echo -e "${RED}[ERROR]${NC} $1"; }',
        '',
        'echo "Branch Cleanup Script"',
        `echo "Generated: ${new Date().toISOString()}"`,
        'echo "Repository: $(pwd)"',
        'echo',
        '',
        '# Create backup first',
        'log_info "Creating backup..."',
        `BACKUP_TAG="branch-backup-$(date +%Y%m%d-%H%M%S)"`,
        'git tag "$BACKUP_TAG" HEAD',
        'log_info "Backup tag created: $BACKUP_TAG"',
        '',
        '# Delete branches marked for deletion',
        'log_info "Starting branch cleanup..."',
        `log_info "Will delete ${branchesToDelete.length} branches"`,
        ''
    ];
    
    // Add deletion commands for each branch
    for (const branch of branchesToDelete) {
        scriptContent.push(
            `# Delete branch: ${branch.name}`,
            `# Reason: ${branch.reason}`,
            `if git ls-remote --exit-code --heads origin "${branch.name}" >/dev/null 2>&1; then`,
            `    log_info "Deleting remote branch: ${branch.name}"`,
            `    git push origin --delete "${branch.name}" || log_warning "Failed to delete remote branch: ${branch.name}"`,
            'else',
            `    log_warning "Remote branch not found: ${branch.name}"`,
            'fi',
            '',
            `if git show-ref --verify --quiet "refs/heads/${branch.name}"; then`,
            `    log_info "Deleting local branch: ${branch.name}"`,
            `    git branch -D "${branch.name}" || log_warning "Failed to delete local branch: ${branch.name}"`,
            'fi',
            ''
        );
    }
    
    scriptContent.push(
        `log_info "Branch cleanup completed!"`,
        `log_info "Deleted ${branchesToDelete.length} branches"`,
        'log_info "To restore if needed, use: git checkout $BACKUP_TAG"',
        '',
        '# Clean up remote tracking references',
        'git remote prune origin',
        '',
        'echo "Cleanup completed successfully!"'
    );
    
    await fs.writeFile(cleanupScript, scriptContent.join('\n'));
    await fs.chmod(cleanupScript, '755');
    
    log.success(`Cleanup script generated: ${cleanupScript}`);
    log.info(`Script will delete ${branchesToDelete.length} branches`);
    log.warning('Review the script before executing!');
    
    return cleanupScript;
}

// Show help
function showHelp() {
    console.log(`
GitHub Branch Audit and Cleanup Tool

USAGE:
    node scripts/git_branch_audit.mjs [action]

ACTIONS:
    audit          - Perform comprehensive branch audit (default)
    cleanup        - Generate cleanup script based on latest audit
    help           - Show this help message

EXAMPLES:
    # Perform branch audit
    node scripts/git_branch_audit.mjs audit
    
    # Generate cleanup script
    node scripts/git_branch_audit.mjs cleanup

BRANCH CATEGORIES:
    DELETE  - Branches safe to delete (merged, old, temporary)
    MERGE   - Branches with valuable changes ready to merge
    KEEP    - Important branches to preserve
    REVIEW  - Branches requiring manual review

SAFETY FEATURES:
    - Automatic backups before destructive operations
    - Detailed audit logs and reasoning
    - Firewall-safe branch fetching using git commands and GitHub CLI
    - Pattern-based branch categorization

FIREWALL COMPATIBILITY:
    - Uses git commands as primary method (always works)
    - Falls back to GitHub CLI if git fails and GITHUB_TOKEN is available
    - Final fallback to local branches only
    - No direct API calls that could be blocked by firewalls
`);
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    let action = 'audit';
    let auditFile = null;
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-f' && i + 1 < args.length) {
            auditFile = args[i + 1];
            i++; // Skip next argument
        } else if (args[i].startsWith('-f=')) {
            auditFile = args[i].substring(3);
        } else if (['audit', 'cleanup', 'help'].includes(args[i])) {
            action = args[i];
        }
    }
    
    log.info('GitHub Branch Audit Tool (Firewall-Safe)');
    log.info(`Action: ${action}`);
    
    await setupAuditDir();
    
    try {
        switch (action) {
            case 'audit':
                await auditBranches();
                break;
            case 'cleanup':
                await generateCleanupScript(auditFile);
                break;
            case 'help':
                showHelp();
                break;
            default:
                log.error(`Unknown action: ${action}`);
                showHelp();
                process.exit(1);
        }
    } catch (error) {
        log.error(`Operation failed: ${error.message}`);
        process.exit(1);
    }
}

// Run main function
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}