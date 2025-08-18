#!/usr/bin/env node
/**
 * Ensure standard labels exist in the repository.
 */

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
      'User-Agent': 'ensure-labels-script',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

async function listLabels() {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/labels?per_page=100`;
  return gh(url);
}

async function createLabel(name, color, description = '') {
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/labels`;
  try {
    await gh(url, { method: 'POST', body: JSON.stringify({ name, color, description }) });
    console.log(`Created label: ${name}`);
  } catch (e) {
    if (!e.message.includes('already_exists')) {
      console.log(`Failed to create label ${name}: ${e.message}`);
    }
  }
}

async function main() {
  const desired = [
    { name: 'project-issue', color: '1f77b4', description: 'Project implementation item' },
    { name: 'ops-summary', color: '9467bd', description: 'Daily ops summary' },
    { name: 'role:project', color: '2ca02c', description: 'Project work' },
    { name: 'role:ops', color: 'bcbd22', description: 'Operations work' },
    { name: 'priority:today', color: 'd62728', description: 'Do today' },
    { name: 'priority:this-week', color: 'ff7f0e', description: 'Do this week' },
    { name: 'sla:P1', color: 'e41a1c', description: 'High urgency (hours)' },
    { name: 'sla:P2', color: '377eb8', description: 'Normal urgency (day)' },
    { name: 'sla:P3', color: '4daf4a', description: 'Low urgency (few days)' },
    { name: 'manual-intervention', color: '8c564b', description: 'Requires human action' },
    { name: 'needs-attention', color: 'ff9896', description: 'SLA nudge' },
  ];

  const existing = await listLabels();
  const existingNames = new Set(existing.map((l) => l.name));

  for (const d of desired) {
    if (!existingNames.has(d.name)) {
      await createLabel(d.name, d.color, d.description);
    }
  }
}

main().catch((e) => {
  console.error('ensure-labels failed:', e);
  process.exit(0);
});

