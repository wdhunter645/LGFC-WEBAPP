#!/usr/bin/env node

/**
 * Build Usage Monitor for Netlify Build Optimization
 * 
 * This script helps monitor and analyze Netlify build usage to ensure
 * the 300 minute monthly allocation is used efficiently.
 * 
 * Usage:
 *   node scripts/monitor-build-usage.mjs
 * 
 * Prerequisites:
 *   - Netlify CLI installed: npm install -g netlify-cli
 *   - Authenticated with Netlify: netlify login
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const SITE_NAME = 'lougehrigfanclub';
const BUILD_MINUTE_LIMIT = 300; // Monthly limit
const WARNING_THRESHOLD = 0.8; // 80% of limit

async function getNetlifyBuildData() {
  try {
    // Get site info
    const siteInfoCmd = 'netlify sites:list --json';
    const sitesData = JSON.parse(execSync(siteInfoCmd, { encoding: 'utf8' }));
    const site = sitesData.find(s => s.name.includes(SITE_NAME) || s.url.includes('lougehrig'));
    
    if (!site) {
      console.error('❌ Site not found. Please check site name or authentication.');
      return null;
    }
    
    console.log(`🏠 Site: ${site.name} (${site.url})`);
    
    // Get recent deployments
    const deploysCmd = `netlify api listSiteDeploys --data '{"site_id":"${site.site_id}","per_page":50}'`;
    const deploysData = JSON.parse(execSync(deploysCmd, { encoding: 'utf8' }));
    
    return {
      site,
      deployments: deploysData
    };
  } catch (error) {
    console.error('❌ Error fetching Netlify data:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   1. Netlify CLI installed: npm install -g netlify-cli');
    console.log('   2. Authenticated: netlify login');
    return null;
  }
}

function analyzeBuildData(deployments) {
  if (!deployments || deployments.length === 0) {
    return null;
  }

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Filter deployments from this month
  const thisMonthDeploys = deployments.filter(deploy => {
    const deployDate = new Date(deploy.created_at);
    return deployDate >= thisMonth && deploy.state === 'ready';
  });

  // Calculate build statistics
  const buildTimes = thisMonthDeploys
    .filter(deploy => deploy.deploy_time)
    .map(deploy => Math.ceil(deploy.deploy_time / 60)); // Convert to minutes

  const stats = {
    totalBuilds: thisMonthDeploys.length,
    successfulBuilds: buildTimes.length,
    totalBuildMinutes: buildTimes.reduce((sum, time) => sum + time, 0),
    avgBuildTime: buildTimes.length > 0 ? Math.round(buildTimes.reduce((sum, time) => sum + time, 0) / buildTimes.length) : 0,
    minBuildTime: buildTimes.length > 0 ? Math.min(...buildTimes) : 0,
    maxBuildTime: buildTimes.length > 0 ? Math.max(...buildTimes) : 0,
    recentBuilds: thisMonthDeploys.slice(0, 10).map(deploy => ({
      id: deploy.id.substring(0, 8),
      branch: deploy.branch,
      context: deploy.context,
      buildTime: deploy.deploy_time ? Math.ceil(deploy.deploy_time / 60) : 'N/A',
      createdAt: new Date(deploy.created_at).toLocaleDateString(),
      commitMessage: deploy.title || 'No message'
    }))
  };

  return stats;
}

function generateReport(stats) {
  if (!stats) {
    return '❌ No build data available for analysis.';
  }

  const usagePercentage = (stats.totalBuildMinutes / BUILD_MINUTE_LIMIT) * 100;
  const remainingMinutes = BUILD_MINUTE_LIMIT - stats.totalBuildMinutes;
  const isWarning = usagePercentage >= (WARNING_THRESHOLD * 100);
  
  let report = '\n📊 NETLIFY BUILD USAGE REPORT\n';
  report += '='.repeat(50) + '\n\n';
  
  // Overview
  report += '📈 MONTHLY OVERVIEW\n';
  report += `   Total builds this month: ${stats.totalBuilds}\n`;
  report += `   Successful builds: ${stats.successfulBuilds}\n`;
  report += `   Build minutes used: ${stats.totalBuildMinutes}/${BUILD_MINUTE_LIMIT} (${usagePercentage.toFixed(1)}%)\n`;
  report += `   Remaining minutes: ${remainingMinutes}\n`;
  
  if (isWarning) {
    report += `   ⚠️  WARNING: Usage is at ${usagePercentage.toFixed(1)}% of monthly limit!\n`;
  } else {
    report += `   ✅ Usage is within safe limits\n`;
  }
  
  report += '\n';
  
  // Performance metrics
  report += '⚡ PERFORMANCE METRICS\n';
  report += `   Average build time: ${stats.avgBuildTime} minutes\n`;
  report += `   Fastest build: ${stats.minBuildTime} minutes\n`;
  report += `   Slowest build: ${stats.maxBuildTime} minutes\n\n`;
  
  // Recent builds
  report += '🕐 RECENT BUILDS\n';
  report += 'ID       | Branch   | Context    | Time  | Date       | Commit\n';
  report += '-'.repeat(70) + '\n';
  
  stats.recentBuilds.forEach(build => {
    const id = build.id.padEnd(8);
    const branch = (build.branch || 'main').padEnd(8);
    const context = (build.context || 'production').padEnd(10);
    const time = `${build.buildTime}m`.padEnd(5);
    const date = build.createdAt.padEnd(10);
    const message = (build.commitMessage || '').substring(0, 25);
    report += `${id} | ${branch} | ${context} | ${time} | ${date} | ${message}\n`;
  });
  
  report += '\n';
  
  // Recommendations
  report += '💡 OPTIMIZATION RECOMMENDATIONS\n';
  
  if (usagePercentage > 90) {
    report += '   🚨 URGENT: Build usage is critical!\n';
    report += '      - Review build ignore rules\n';
    report += '      - Consider batch commits\n';
    report += '      - Check for unnecessary builds\n';
  } else if (usagePercentage > 70) {
    report += '   ⚠️  Build usage is high:\n';
    report += '      - Monitor build triggers closely\n';
    report += '      - Optimize build scripts\n';
    report += '      - Consider preview build restrictions\n';
  } else {
    report += '   ✅ Build usage is healthy:\n';
    report += '      - Continue current optimization practices\n';
    report += '      - Monitor for any usage spikes\n';
  }
  
  if (stats.avgBuildTime > 4) {
    report += '   - Consider further build time optimizations\n';
  }
  
  if (stats.totalBuilds > 50) {
    report += '   - High build frequency detected - review trigger rules\n';
  }
  
  report += '\n';
  
  // Next steps
  report += '🎯 NEXT STEPS\n';
  report += '   1. Review this report monthly\n';
  report += '   2. Adjust build ignore rules if needed\n';
  report += '   3. Monitor for optimization opportunities\n';
  report += '   4. Update build scripts based on performance data\n\n';
  
  report += `📅 Report generated: ${new Date().toLocaleString()}\n`;
  report += `📍 Next review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`;
  
  return report;
}

async function saveReport(report) {
  try {
    const reportsDir = 'build-reports';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `build-usage-${timestamp}.md`;
    
    await fs.mkdir(reportsDir, { recursive: true });
    await fs.writeFile(path.join(reportsDir, filename), report);
    
    console.log(`📄 Report saved to: ${reportsDir}/${filename}`);
  } catch (error) {
    console.error('⚠️  Could not save report:', error.message);
  }
}

async function main() {
  console.log('🔍 Fetching Netlify build data...\n');
  
  const data = await getNetlifyBuildData();
  if (!data) {
    process.exit(1);
  }
  
  const stats = analyzeBuildData(data.deployments);
  const report = generateReport(stats);
  
  console.log(report);
  await saveReport(report);
  
  // Exit with warning code if usage is high
  const usagePercentage = stats ? (stats.totalBuildMinutes / BUILD_MINUTE_LIMIT) * 100 : 0;
  if (usagePercentage >= (WARNING_THRESHOLD * 100)) {
    console.log('\n⚠️  Exiting with warning due to high build usage');
    process.exit(2);
  }
  
  console.log('✅ Build usage monitoring complete');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}