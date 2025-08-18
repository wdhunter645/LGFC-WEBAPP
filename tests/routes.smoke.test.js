import { execSync } from 'node:child_process';
import fs from 'node:fs';

function buildSite() {
  execSync('npm run build', { stdio: 'inherit' });
}

describe('Static route smoke', () => {
  beforeAll(() => {
    buildSite();
  }, 300000);

  const routes = [
    '/index.html',
    '/about/index.html',
    '/leaderboard/index.html',
    '/search/index.html',
    '/login/index.html',
    '/join/index.html',
  ];

  test.each(routes)('route exists: %s', (route) => {
    const path = `dist${route}`;
    const exists = fs.existsSync(path);
    expect(exists).toBe(true);
  });
});

