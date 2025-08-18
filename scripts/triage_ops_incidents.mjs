#!/usr/bin/env node
/**
 * Morning Ops Triage
 * - Runs in GitHub Actions with GITHUB_TOKEN
 * - Checks recent workflow run statuses for key ops jobs
 * - Updates ops-incidents.md Open/Recently Closed sections accordingly
 * - Gated to only proceed when current time in America/New_York is 06:00 ± 5 min window
 */

import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const opsFilePath = path.join(repoRoot, 'ops-incidents.md');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY; // owner/repo

if (!GITHUB_REPOSITORY) {
  console.log('GITHUB_REPOSITORY is not set; skipping triage.');
  process.exit(0);
}

if (!GITHUB_TOKEN) {
  console.log('GITHUB_TOKEN is not set; skipping triage.');
  process.exit(0);
}

function isSixAmInNewYork() {
  try {
    const now = new Date();
    const nyFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const parts = nyFormatter.formatToParts(now);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    const hour = Number(get('hour'));
    const minute = Number(get('minute'));
    return hour === 6 && minute >= 0 && minute <= 10; // allow 10-min window
  } catch (e) {
    // If timezone is not available for some reason, do not block
    return true;
  }
}

function todayIso() {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

async function githubJson(url) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'morning-ops-triage-script',
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function getWorkflowIdByFile(fileName) {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/workflows/${encodeURIComponent(fileName)}`;
  try {
    const data = await githubJson(url);
    return data.id;
  } catch (e) {
    return null;
  }
}

async function getLatestRunConclusion(workflowId) {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/workflows/${workflowId}/runs?per_page=1`;
  const data = await githubJson(url);
  const run = data.workflow_runs?.[0];
  if (!run) return null;
  return run.conclusion || run.status; // conclusion: success, failure, timed_out, cancelled
}

function parseSection(content, heading) {
  const start = content.indexOf(`### ${heading}`);
  if (start === -1) return { start: -1, end: -1, body: '' };
  const rest = content.slice(start + (`### ${heading}`.length));
  const nextIdx = rest.indexOf('\n### ');
  const sectionEnd = nextIdx === -1 ? content.length : start + (`### ${heading}`.length) + nextIdx;
  const body = content.slice(start, sectionEnd);
  return { start, end: sectionEnd, body };
}

function extractTableRowsFromSection(sectionBody) {
  const lines = sectionBody.split('\n');
  const sepIndex = lines.findIndex((l) => /^\|\s*-+\s*\|/.test(l));
  if (sepIndex === -1) return { header: '', rows: [] };
  const header = lines.slice(1, sepIndex + 1).join('\n');
  const rows = lines.slice(sepIndex + 1).filter((l) => l.trim().startsWith('|'));
  return { header, rows };
}

function ensureRow(openRows, incidentText) {
  const exists = openRows.some((r) => r.toLowerCase().includes(incidentText.toLowerCase()));
  if (!exists) {
    openRows.push(`| Open | ${incidentText} |`);
  }
}

function closeRow(openRows, closedRows, incidentText) {
  const index = openRows.findIndex((r) => r.toLowerCase().includes(incidentText.toLowerCase()));
  if (index !== -1) {
    openRows.splice(index, 1);
    const date = todayIso();
    closedRows.push(`| Closed | ${incidentText} | ${date} |`);
  }
}

function rebuildSection(heading, headerLine, rows) {
  const header = headerLine || '| Status | Incident |\n| --- | --- |';
  return [`### ${heading}`, '', header, ...rows, ''].join('\n');
}

async function main() {
  if (!isSixAmInNewYork()) {
    console.log('Not within 6:00 AM America/New_York window; skipping.');
    return;
  }

  if (!fs.existsSync(opsFilePath)) {
    console.log('ops-incidents.md not found; skipping.');
    return;
  }

  const incidentsMap = [
    { file: 'supabase-backup-daily.yml', text: 'Schema Backup failed' },
    { file: 'backup-cleanup.yml', text: 'Backup cleanup failed' },
    { file: 'traffic-simulator-monitored.yml', text: 'Traffic Simulator Failing' },
  ];

  // Resolve workflow IDs and latest conclusions
  const statuses = [];
  for (const item of incidentsMap) {
    const id = await getWorkflowIdByFile(`.github/workflows/${item.file}`);
    if (!id) {
      statuses.push({ text: item.text, conclusion: null });
      continue;
    }
    const conclusion = await getLatestRunConclusion(id);
    statuses.push({ text: item.text, conclusion });
  }

  let content = fs.readFileSync(opsFilePath, 'utf8');

  const openSection = parseSection(content, 'Open');
  const closedSection = parseSection(content, 'Recently Closed (last 2 weeks)');

  const { header: openHeader, rows: openRows } = extractTableRowsFromSection(openSection.body);
  const { header: closedHeader, rows: closedRowsRaw } = extractTableRowsFromSection(closedSection.body);
  const closedHeaderNormalized = closedHeader || '| Closed | Incident | Closed On |\n| --- | --- | --- |';
  const closedRows = [...closedRowsRaw];

  for (const s of statuses) {
    if (!s.conclusion) continue;
    if (s.conclusion === 'success') {
      closeRow(openRows, closedRows, s.text);
    } else if (['failure', 'timed_out', 'cancelled'].includes(s.conclusion)) {
      ensureRow(openRows, s.text);
    }
  }

  const newOpen = rebuildSection('Open', openHeader, openRows);
  const newClosed = rebuildSection('Recently Closed (last 2 weeks)', closedHeaderNormalized, closedRows);

  // Replace sections in content
  const pre = content.slice(0, openSection.start);
  const postFrom = closedSection.end;
  const between = content.slice(openSection.end, closedSection.start);
  const post = content.slice(postFrom);

  const rebuilt = [
    pre.trimEnd(),
    '',
    newOpen,
    '',
    between.trim(),
    '',
    newClosed,
    '',
    post.trimStart(),
  ].join('\n');

  if (rebuilt !== content) {
    fs.writeFileSync(opsFilePath, rebuilt, 'utf8');
    console.log('ops-incidents.md updated by morning triage.');
  } else {
    console.log('No changes required for ops-incidents.md');
  }
}

main().catch((err) => {
  console.error('Morning ops triage failed:', err);
  process.exit(0); // do not fail the workflow hard
});

