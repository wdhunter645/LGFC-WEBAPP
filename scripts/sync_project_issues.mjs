#!/usr/bin/env node
/**
 * Sync Open items from issues-list.md to GitHub Issues.
 * - Creates a GitHub issue for each Open row if one with identical title does not exist
 * - Labels: project-issue
 *
 * Requires: GITHUB_TOKEN, GITHUB_REPOSITORY env (provided in Actions)
 */

import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const issuesListPath = path.join(repoRoot, 'issues-list.md');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY; // owner/repo

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  console.log('Missing GITHUB_TOKEN or GITHUB_REPOSITORY; exiting.');
  process.exit(0);
}

async function gh(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'morning-project-issues-sync',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

function parseOpenIssuesFromMarkdown(md) {
  const openIdx = md.indexOf('### Open');
  if (openIdx === -1) return [];
  const afterOpen = md.slice(openIdx);
  const nextHeaderIdx = afterOpen.indexOf('\n### ');
  const openSection = nextHeaderIdx === -1 ? afterOpen : afterOpen.slice(0, nextHeaderIdx);
  const lines = openSection.split('\n');
  const headerSepIdx = lines.findIndex((l) => /^\|\s*-+\s*\|/.test(l));
  if (headerSepIdx === -1) return [];
  const rows = lines.slice(headerSepIdx + 1).filter((l) => l.trim().startsWith('|'));
  const items = rows.map((row) => {
    const parts = row.split('|').map((p) => p.trim());
    // | Status | Issue | Notes |
    return {
      status: parts[1],
      title: parts[2],
      notes: parts[3] || '',
    };
  }).filter((i) => i.status && i.status.toLowerCase() === 'open');
  return items;
}

async function listExistingProjectIssues() {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues?state=open&labels=${encodeURIComponent('project-issue')}&per_page=100`;
  try {
    const data = await gh(url);
    return data.map((i) => i.title);
  } catch (e) {
    // If label filter fails (label may not exist yet), fallback to all open issues first page
    const fallback = await gh(`https://api.github.com/repos/${GITHUB_REPOSITORY}/issues?state=open&per_page=100`);
    return fallback.map((i) => i.title);
  }
}

async function ensureIssue(title, body) {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/issues`;
  return gh(url, {
    method: 'POST',
    body: JSON.stringify({
      title,
      body,
      labels: ['project-issue'],
    }),
  });
}

async function main() {
  if (!fs.existsSync(issuesListPath)) {
    console.log('issues-list.md not found; nothing to sync.');
    return;
  }
  const md = fs.readFileSync(issuesListPath, 'utf8');
  const items = parseOpenIssuesFromMarkdown(md);
  if (!items.length) {
    console.log('No open items found in issues-list.md');
    return;
  }
  const existingTitles = await listExistingProjectIssues();
  for (const item of items) {
    if (existingTitles.includes(item.title)) continue;
    const body = [
      'Synced from `issues-list.md` (Open section).',
      '',
      item.notes ? `Notes: ${item.notes}` : '',
      '',
      'Source: `/issues-list.md`',
    ].join('\n');
    try {
      await ensureIssue(item.title, body);
      console.log(`Created GitHub issue: ${item.title}`);
    } catch (e) {
      console.log(`Failed to create issue for: ${item.title} -> ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error('Sync failed:', e);
  process.exit(0);
});

