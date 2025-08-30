#!/usr/bin/env node

/**
 * Workflow Project Monitor Script
 * Continuously monitors and assesses the progress of the workflow automation project
 */

import fs from 'fs';
import path from 'path';

console.log('🔄 Workflow Project Monitor');
console.log('===============================');
console.log('Time:', new Date().toISOString());
console.log('Purpose: Monitor workflow automation project progress');

// Configuration
const DETAILED_ANALYSIS = process.env.DETAILED_ANALYSIS === 'true';
const PROJECT_DOCS = [
  'PROJECT_STATUS_ASSESSMENT.md',
  'OPERATIONAL_READINESS.md', 
  'SEARCH_CRON_FINAL_STATUS.md',
  'SEARCH_CRON_VERIFICATION.md'
];

const WORKFLOW_FILES = [
  '.github/workflows/search-cron.yml',
  '.github/workflows/backup-audit.yml',
  '.github/workflows/schema-drift-detection.yml',
  '.github/workflows/health-checks.yml',
  '.github/workflows/security-scans.yml',
  '.github/workflows/voting-automation.yml',
  '.github/workflows/als-events-scraper.yml',
  '.github/workflows/ops-bot-daily-report.yml',
  '.github/workflows/workflow-project-monitor.yml'
];

const MONITORING_SCRIPTS = [
  'scripts/test_ingest.mjs',
  'scripts/ingest.mjs',
  'scripts/github_actions_debug.mjs',
  'scripts/voting_automation.mjs',
  'scripts/apply_rls_policies.mjs'
];

/**
 * Check if a file exists and get its status
 */
function checkFileStatus(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      lastModified: stats.mtime,
      isExecutable: !!(stats.mode & parseInt('111', 8))
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message
    };
  }
}

/**
 * Analyze project documentation for status indicators
 */
function analyzeProjectDocumentation() {
  console.log('\n📚 Analyzing project documentation...');
  
  const docAnalysis = {};
  
  PROJECT_DOCS.forEach(docPath => {
    const fileStatus = checkFileStatus(docPath);
    docAnalysis[docPath] = fileStatus;
    
    if (fileStatus.exists) {
      console.log(`✅ ${docPath}: Found (${fileStatus.size} bytes)`);
      
      if (DETAILED_ANALYSIS) {
        try {
          const content = fs.readFileSync(docPath, 'utf8');
          
          // Extract status indicators
          const statusIndicators = {
            completedItems: (content.match(/✅/g) || []).length,
            pendingItems: (content.match(/⏳|🔄/g) || []).length,
            failureItems: (content.match(/❌/g) || []).length,
            hasCompletionPercentage: /\d+%.*complete/i.test(content),
            lastUpdated: fileStatus.lastModified
          };
          
          docAnalysis[docPath].analysis = statusIndicators;
          
          console.log(`   - Completed items: ${statusIndicators.completedItems}`);
          console.log(`   - Pending items: ${statusIndicators.pendingItems}`);
          console.log(`   - Failed items: ${statusIndicators.failureItems}`);
        } catch (error) {
          console.log(`   ⚠️ Could not analyze content: ${error.message}`);
        }
      }
    } else {
      console.log(`❌ ${docPath}: Missing`);
    }
  });
  
  return docAnalysis;
}

/**
 * Check workflow automation files
 */
function analyzeWorkflowFiles() {
  console.log('\n🤖 Analyzing workflow automation files...');
  
  const workflowAnalysis = {};
  
  WORKFLOW_FILES.forEach(workflowPath => {
    const fileStatus = checkFileStatus(workflowPath);
    workflowAnalysis[workflowPath] = fileStatus;
    
    if (fileStatus.exists) {
      console.log(`✅ ${workflowPath}: Found (${fileStatus.size} bytes)`);
      
      if (DETAILED_ANALYSIS) {
        try {
          const content = fs.readFileSync(workflowPath, 'utf8');
          
          // Extract workflow configuration
          const workflowConfig = {
            hasSchedule: /schedule:/.test(content),
            hasManualTrigger: /workflow_dispatch:/.test(content),
            jobCount: (content.match(/jobs:/g) || []).length,
            stepCount: (content.match(/- name:/.g) || []).length,
            usesSecrets: /secrets\./.test(content),
            lastModified: fileStatus.lastModified
          };
          
          workflowAnalysis[workflowPath].config = workflowConfig;
          
          console.log(`   - Has schedule: ${workflowConfig.hasSchedule ? '✅' : '❌'}`);
          console.log(`   - Manual trigger: ${workflowConfig.hasManualTrigger ? '✅' : '❌'}`);
          console.log(`   - Jobs: ${workflowConfig.jobCount}, Steps: ${workflowConfig.stepCount}`);
        } catch (error) {
          console.log(`   ⚠️ Could not analyze workflow: ${error.message}`);
        }
      }
    } else {
      console.log(`❌ ${workflowPath}: Missing`);
    }
  });
  
  return workflowAnalysis;
}

/**
 * Check monitoring and automation scripts
 */
function analyzeMonitoringScripts() {
  console.log('\n🔧 Analyzing monitoring scripts...');
  
  const scriptAnalysis = {};
  
  MONITORING_SCRIPTS.forEach(scriptPath => {
    const fileStatus = checkFileStatus(scriptPath);
    scriptAnalysis[scriptPath] = fileStatus;
    
    if (fileStatus.exists) {
      console.log(`✅ ${scriptPath}: Found (${fileStatus.size} bytes, executable: ${fileStatus.isExecutable})`);
      
      if (DETAILED_ANALYSIS) {
        try {
          const content = fs.readFileSync(scriptPath, 'utf8');
          
          // Analyze script capabilities
          const scriptCapabilities = {
            isExecutable: fileStatus.isExecutable,
            hasErrorHandling: /catch|try/.test(content),
            hasLogging: /console\.log|console\.error/.test(content),
            usesEnvironmentVars: /process\.env/.test(content),
            hasAsyncOperations: /async|await/.test(content),
            lastModified: fileStatus.lastModified
          };
          
          scriptAnalysis[scriptPath].capabilities = scriptCapabilities;
          
          console.log(`   - Error handling: ${scriptCapabilities.hasErrorHandling ? '✅' : '❌'}`);
          console.log(`   - Logging: ${scriptCapabilities.hasLogging ? '✅' : '❌'}`);
          console.log(`   - Async operations: ${scriptCapabilities.hasAsyncOperations ? '✅' : '❌'}`);
        } catch (error) {
          console.log(`   ⚠️ Could not analyze script: ${error.message}`);
        }
      }
    } else {
      console.log(`❌ ${scriptPath}: Missing`);
    }
  });
  
  return scriptAnalysis;
}

/**
 * Calculate overall project health score
 */
function calculateProjectHealth(docAnalysis, workflowAnalysis, scriptAnalysis) {
  console.log('\n📊 Calculating project health score...');
  
  // Documentation health (40% weight)
  const docsExisting = Object.values(docAnalysis).filter(doc => doc.exists).length;
  const docsTotal = PROJECT_DOCS.length;
  const docsScore = (docsExisting / docsTotal) * 40;
  
  // Workflow automation health (40% weight)  
  const workflowsExisting = Object.values(workflowAnalysis).filter(wf => wf.exists).length;
  const workflowsTotal = WORKFLOW_FILES.length;
  const workflowScore = (workflowsExisting / workflowsTotal) * 40;
  
  // Scripts health (20% weight)
  const scriptsExisting = Object.values(scriptAnalysis).filter(script => script.exists).length;
  const scriptsTotal = MONITORING_SCRIPTS.length;
  const scriptsScore = (scriptsExisting / scriptsTotal) * 20;
  
  const totalScore = docsScore + workflowScore + scriptsScore;
  
  console.log(`📚 Documentation: ${docsExisting}/${docsTotal} files (${docsScore.toFixed(1)}/40)`);
  console.log(`🤖 Workflows: ${workflowsExisting}/${workflowsTotal} files (${workflowScore.toFixed(1)}/40)`);  
  console.log(`🔧 Scripts: ${scriptsExisting}/${scriptsTotal} files (${scriptsScore.toFixed(1)}/20)`);
  console.log(`🎯 Overall Health: ${totalScore.toFixed(1)}/100`);
  
  return {
    documentation: { score: docsScore, existing: docsExisting, total: docsTotal },
    workflows: { score: workflowScore, existing: workflowsExisting, total: workflowsTotal },
    scripts: { score: scriptsScore, existing: scriptsExisting, total: scriptsTotal },
    overall: totalScore
  };
}

/**
 * Generate project recommendations
 */
function generateRecommendations(health, docAnalysis, workflowAnalysis, scriptAnalysis) {
  console.log('\n💡 Generating recommendations...');
  
  const recommendations = [];
  
  // Check for missing critical files
  const missingDocs = PROJECT_DOCS.filter(doc => !docAnalysis[doc].exists);
  const missingWorkflows = WORKFLOW_FILES.filter(wf => !workflowAnalysis[wf].exists);
  const missingScripts = MONITORING_SCRIPTS.filter(script => !scriptAnalysis[script].exists);
  
  if (missingDocs.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Documentation',
      action: `Update or create missing documentation: ${missingDocs.join(', ')}`
    });
  }
  
  if (missingWorkflows.length > 0) {
    recommendations.push({
      priority: 'CRITICAL',
      category: 'Automation',
      action: `Restore missing workflow files: ${missingWorkflows.join(', ')}`
    });
  }
  
  if (missingScripts.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Scripts',
      action: `Restore missing monitoring scripts: ${missingScripts.join(', ')}`
    });
  }
  
  // Health-based recommendations
  if (health.overall < 80) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Project Health',
      action: 'Project health below 80% - prioritize resolving missing components'
    });
  }
  
  if (health.overall >= 90) {
    recommendations.push({
      priority: 'LOW',
      category: 'Maintenance',
      action: 'Project health excellent - focus on optimization and monitoring'
    });
  }
  
  recommendations.forEach(rec => {
    console.log(`${rec.priority === 'CRITICAL' ? '🚨' : rec.priority === 'HIGH' ? '⚠️' : '💡'} [${rec.priority}] ${rec.category}: ${rec.action}`);
  });
  
  return recommendations;
}

/**
 * Main monitoring function
 */
async function main() {
  try {
    console.log('\n🔍 Starting workflow project assessment...');
    
    // Analyze different components
    const docAnalysis = analyzeProjectDocumentation();
    const workflowAnalysis = analyzeWorkflowFiles();
    const scriptAnalysis = analyzeMonitoringScripts();
    
    // Calculate health metrics
    const health = calculateProjectHealth(docAnalysis, workflowAnalysis, scriptAnalysis);
    
    // Generate recommendations
    const recommendations = generateRecommendations(health, docAnalysis, workflowAnalysis, scriptAnalysis);
    
    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      detailedAnalysis: DETAILED_ANALYSIS,
      health,
      documentation: docAnalysis,
      workflows: workflowAnalysis,
      scripts: scriptAnalysis,
      recommendations,
      summary: {
        projectHealth: health.overall,
        status: health.overall >= 90 ? 'EXCELLENT' : 
                health.overall >= 80 ? 'GOOD' : 
                health.overall >= 60 ? 'FAIR' : 'NEEDS_ATTENTION',
        criticalIssues: recommendations.filter(r => r.priority === 'CRITICAL').length,
        totalRecommendations: recommendations.length
      }
    };
    
    // Save results to file for the workflow to consume
    fs.writeFileSync('workflow-project-assessment.json', JSON.stringify(results, null, 2));
    
    console.log('\n✅ Assessment completed successfully');
    console.log(`📊 Project Health: ${health.overall.toFixed(1)}/100 (${results.summary.status})`);
    console.log(`🔢 Recommendations: ${recommendations.length} total, ${results.summary.criticalIssues} critical`);
    
    if (results.summary.criticalIssues > 0) {
      console.log('\n🚨 CRITICAL ISSUES DETECTED - Immediate attention required!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Assessment failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the assessment
main().catch(err => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});