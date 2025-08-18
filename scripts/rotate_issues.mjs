#!/usr/bin/env node
/**
 * Rotate issues-list.md monthly:
 * - Rename prior month's issues-list.md snapshot to issues-archive-YYYY-MM.md
 * - Create a fresh issues-list.md for the new month
 * - Carry over current Open issues table rows and Alerts rows
 *
 * Usage: node scripts/rotate_issues.mjs
 * Optional env: ROTATE_DATE=YYYY-MM (useful for testing)
 */

import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const issuesListPath = path.join(repoRoot, 'issues-list.md');

function zeroPad(number) {
  return number.toString().padStart(2, '0');
}

function getEffectiveDate() {
  const override = process.env.ROTATE_DATE; // YYYY-MM
  if (override) {
    const [yearStr, monthStr] = override.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    if (!Number.isNaN(year) && !Number.isNaN(month)) {
      // Use first day of that month
      return new Date(Date.UTC(year, month - 1, 1));
    }
  }
  return new Date();
}

function getPreviousMonthTag(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1..12
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${zeroPad(prevMonth)}`;
}

function extractSection(content, heading) {
  // Extract block that starts with a markdown heading text, until next heading of same level (###)
  const pattern = new RegExp(`(^###\\s+${heading}\\n[\\s\\S]*?)(^###\\s+|\n###\\s+|$)`, 'm');
  const match = content.match(pattern);
  if (match) {
    return match[1].trimEnd();
  }
  return '';
}

function extractTableRows(content, heading) {
  const section = extractSection(content, heading);
  if (!section) return [];
  const lines = section.split('\n');
  // Find table header separator line index (| --- | ...)
  const sepIndex = lines.findIndex((l) => /^\|\s*-+\s*\|/.test(l));
  if (sepIndex === -1) return [];
  const rows = lines.slice(sepIndex + 1).filter((l) => l.trim().startsWith('|'));
  return rows;
}

function buildNewIssuesList(openRows, alertRows, prevTag) {
  const openTableHeader = [
    '| Status | Issue | Notes |',
    '| --- | --- | --- |',
  ].join('\n');

  const alertsTableHeader = [
    '| Status | Alert |',
    '| --- | --- |',
  ].join('\n');

  const openTable = [openTableHeader, ...(openRows.length ? openRows : [])].join('\n');
  const alertsTable = [alertsTableHeader, ...(alertRows.length ? alertRows : [])].join('\n');

  return [
    '## Issues',
    '',
    '### Open',
    '',
    openTable,
    '',
    '### Recently Closed (last 2 weeks)',
    '',
    'None yet.',
    '',
    '### Alerts (operational)',
    '',
    alertsTable,
    '',
    '### Archives',
    '',
    `- See: [\`issues-archive-${prevTag}.md\`](issues-archive-${prevTag}.md)`,
    '',
  ].join('\n');
}

function ensureArchiveHeader(tag, content) {
  const header = `## Issues Archive — ${tag}`;
  if (content.startsWith(header)) return content;
  return [
    header,
    '',
    'Closed items moved here from `issues-list.md`.',
    '',
    content.trimStart(),
  ].join('\n');
}

function main() {
  if (!fs.existsSync(issuesListPath)) {
    console.log('issues-list.md not found; nothing to rotate.');
    return;
  }

  const now = getEffectiveDate();
  const prevTag = getPreviousMonthTag(now); // YYYY-MM
  const archivePath = path.join(repoRoot, `issues-archive-${prevTag}.md`);

  const currentContent = fs.readFileSync(issuesListPath, 'utf8');

  // Extract rows to carry forward
  const openRows = extractTableRows(currentContent, 'Open');
  const alertRows = extractTableRows(currentContent, 'Alerts (operational)');

  // Write archive snapshot (overwrite to ensure the snapshot is accurate)
  const archived = ensureArchiveHeader(prevTag, currentContent);
  fs.writeFileSync(archivePath, archived, 'utf8');

  // Create fresh issues-list.md for new month, carrying Open + Alerts
  const newIssues = buildNewIssuesList(openRows, alertRows, prevTag);
  fs.writeFileSync(issuesListPath, newIssues, 'utf8');

  console.log(`Rotated issues: archived to ${path.basename(archivePath)} and refreshed issues-list.md`);
}

main();

