#!/usr/bin/env node
/**
 * Daily Ops Summary
 * - Runs in GitHub Actions at 6am America/New_York
 * - Gathers latest results from key workflows
 * - Creates (or updates) a GitHub Issue: "Daily Ops Summary - YYYY-MM-DD"
 * - Includes: Alerts observed (non-success), Healthy checks, and placeholders for troubleshooting/resolution/confirmation
 */

import fs from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY; // owner/repo
const OPS_BACKGROUND_AGENT = process.env.OPS_BACKGROUND_AGENT || '';

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
      'User-Agent': 'daily-ops-summary-script',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

function nyDateParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const parts = fmt.formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { y: get('year'), m: get('month'), d: get('day') };
}

function todayTitle() {
  const { y, m, d } = nyDateParts();
  return `Daily Ops Summary - ${y}-${m}-${d}`;
}

async function getWorkflowIdByPath(file) {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/workflows/${encodeURIComponent(file)}`;
  try {
    const data = await gh(url);
    return data.id;
  } catch (e) {
    return null;
  }
}

async function getLatestRun(workflowId) {
  if (!workflowId) return null;
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/workflows/${workflowId}/runs?per_page=1`;
  const data = await gh(url);
  const run = data.workflow_runs?.[0];
  if (!run) return null;
  return {
    conclusion: run.conclusion || run.status,
    html_url: run.html_url,
    run_number: run.run_number,
    updated_at: run.updated_at,
    name: run.name,
  };
}

async function ensureDailyIssue(title, body) {
  // Search if an issue with this exact title exists (open)
  const q = encodeURIComponent(`repo:${GITHUB_REPOSITORY} is:issue is:open in:title "${title}"`);
  const search = await gh(`https://api.github.com/search/issues?q=${q}`);
  const existing = search.items?.find((i) => i.title === title);
  if (existing) {
    // Update body (replace)
    await gh(existing.url, { method: 'PATCH', body: JSON.stringify({ body, assignees: OPS_BACKGROUND_AGENT ? [OPS_BACKGROUND_AGENT] : [] }) });
    return existing.html_url;
  }
  // Create new
  const created = await gh(`https://api.github.com/repos/${GITHUB_REPOSITORY}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels: ['ops-summary'], assignees: OPS_BACKGROUND_AGENT ? [OPS_BACKGROUND_AGENT] : [] }),
  });
  return created.html_url;
}

function buildBody(dateTitle, results) {
  const alerts = results.filter((r) => r && r.conclusion && r.conclusion !== 'success');
  const healthy = results.filter((r) => r && r.conclusion === 'success');

  const alertsLines = alerts.length
    ? alerts.map((r) => `- ${r.name || 'Workflow'}: ${r.conclusion} (run #${r.run_number}) — ${r.html_url}`).join('\n')
    : '- None observed';

  const healthyLines = healthy.length
    ? healthy.map((r) => `- ${r.name || 'Workflow'}: success (run #${r.run_number}) — ${r.html_url}`).join('\n')
    : '- None';

  return [
    `## ${dateTitle}`,
    '',
    '### Alerts observed',
    alertsLines,
    '',
    '### Healthy checks',
    healthyLines,
    '',
    '### Troubleshooting / Resolution',
    '- Add notes on root cause, mitigation steps, and verification here.',
    '',
    '### Confirmation testing results',
    '- Add results of re-runs and validation checks here.',
    '',
  ].join('\n');
}

async function main() {
  const workflows = [
    { path: '.github/workflows/supabase-backup-daily.yml', name: 'Supabase Daily Schema Backup' },
    { path: '.github/workflows/backup-cleanup.yml', name: 'Backup Cleanup' },
    { path: '.github/workflows/traffic-simulator-monitored.yml', name: 'Traffic Simulator (Monitored)' },
    { path: '.github/workflows/search-cron.yml', name: 'search-cron' },
  ];

  const results = [];
  for (const wf of workflows) {
    const id = await getWorkflowIdByPath(wf.path);
    const run = await getLatestRun(id);
    if (run) run.name = wf.name;
    results.push(run);
  }

  const title = todayTitle();
  const body = buildBody(title, results);
  const url = await ensureDailyIssue(title, body);
  console.log(`Daily Ops Summary updated: ${url}`);
}

main().catch((e) => {
  console.error('Daily ops summary failed:', e);
  process.exit(0);
});

