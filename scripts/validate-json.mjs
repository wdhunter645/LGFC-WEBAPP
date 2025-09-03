#!/usr/bin/env node

/**
 * JSON Validation Script
 * Comprehensive JSON file validation for the LGFC-WEBAPP project
 * Identifies syntax errors, schema issues, and best practice violations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('🔍 JSON Validation Script');
console.log('========================');
console.log(`Project root: ${projectRoot}`);
console.log('');

// Configuration for JSON validation
const JSON_FILE_PATTERNS = [
  '**/*.json',
  '!node_modules/**',
  '!dist/**',
  '!.astro/**'
];

const CRITICAL_FILES = [
  'package.json',
  'package-lock.json',
  'src/content/settings/site.json',
  'test-data/sample-events.json'
];

/**
 * Find all JSON files in the project
 */
function findJsonFiles(dir, files = []) {
  let items;
  try {
    items = fs.readdirSync(dir);
  } catch (error) {
    console.warn(`Cannot read directory ${dir}: ${error.message}`);
    return files;
  }
  
  for (const item of items) {
    // Skip problematic directory names
    if (item.includes("'~") || item.includes('~')) {
      continue;
    }
    
    const fullPath = path.join(dir, item);
    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch (error) {
      console.warn(`Cannot stat ${fullPath}: ${error.message}`);
      continue;
    }
    
    if (stat.isDirectory() && !['node_modules', 'dist', '.git', '.astro'].includes(item)) {
      findJsonFiles(fullPath, files);
    } else if (stat.isFile() && item.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Validate JSON syntax and structure
 */
function validateJsonFile(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  const results = {
    path: relativePath,
    valid: true,
    errors: [],
    warnings: [],
    size: 0
  };
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    results.size = content.length;
    
    // Basic syntax validation
    try {
      const parsed = JSON.parse(content);
      console.log(`✅ ${relativePath}: Valid JSON`);
      
      // Additional validation for specific files
      if (relativePath === 'package.json') {
        validatePackageJson(parsed, results);
      }
      
    } catch (parseError) {
      results.valid = false;
      results.errors.push(`JSON Syntax Error: ${parseError.message}`);
      console.log(`❌ ${relativePath}: ${parseError.message}`);
    }
    
    // Check for common issues
    if (content.includes('\t')) {
      results.warnings.push('File contains tabs instead of spaces');
    }
    
    if (content.includes('\r\n')) {
      results.warnings.push('File uses Windows line endings (CRLF)');
    }
    
    if (!content.endsWith('\n')) {
      results.warnings.push('File does not end with newline');
    }
    
  } catch (readError) {
    results.valid = false;
    results.errors.push(`File Read Error: ${readError.message}`);
    console.log(`❌ ${relativePath}: Cannot read file - ${readError.message}`);
  }
  
  return results;
}

/**
 * Validate package.json specific requirements
 */
function validatePackageJson(packageData, results) {
  const requiredFields = ['name', 'version', 'scripts'];
  
  for (const field of requiredFields) {
    if (!packageData[field]) {
      results.warnings.push(`Missing or empty required field: ${field}`);
    }
  }
  
  // Check for essential scripts
  const requiredScripts = ['dev', 'build', 'lint'];
  if (packageData.scripts) {
    for (const script of requiredScripts) {
      if (!packageData.scripts[script]) {
        results.warnings.push(`Missing essential script: ${script}`);
      }
    }
  }
  
  // Check dependencies
  if (packageData.dependencies) {
    const deps = Object.keys(packageData.dependencies);
    console.log(`   📦 Dependencies: ${deps.length}`);
  }
  
  if (packageData.devDependencies) {
    const devDeps = Object.keys(packageData.devDependencies);
    console.log(`   🔧 Dev Dependencies: ${devDeps.length}`);
  }
}

/**
 * Generate validation report
 */
function generateReport(validationResults) {
  console.log('\n📊 Validation Summary');
  console.log('====================');
  
  const totalFiles = validationResults.length;
  const validFiles = validationResults.filter(r => r.valid).length;
  const invalidFiles = totalFiles - validFiles;
  const totalWarnings = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);
  const totalErrors = validationResults.reduce((sum, r) => sum + r.errors.length, 0);
  
  console.log(`Total JSON files: ${totalFiles}`);
  console.log(`Valid files: ${validFiles}`);
  console.log(`Invalid files: ${invalidFiles}`);
  console.log(`Total warnings: ${totalWarnings}`);
  console.log(`Total errors: ${totalErrors}`);
  
  if (invalidFiles > 0) {
    console.log('\n❌ Files with errors:');
    validationResults
      .filter(r => !r.valid)
      .forEach(r => {
        console.log(`   ${r.path}`);
        r.errors.forEach(error => console.log(`     - ${error}`));
      });
  }
  
  if (totalWarnings > 0) {
    console.log('\n⚠️ Files with warnings:');
    validationResults
      .filter(r => r.warnings.length > 0)
      .forEach(r => {
        console.log(`   ${r.path}`);
        r.warnings.forEach(warning => console.log(`     - ${warning}`));
      });
  }
  
  // Check critical files
  console.log('\n🎯 Critical files status:');
  CRITICAL_FILES.forEach(criticalFile => {
    const result = validationResults.find(r => r.path === criticalFile);
    if (result) {
      const status = result.valid ? '✅' : '❌';
      console.log(`   ${status} ${criticalFile}`);
    } else {
      console.log(`   ❓ ${criticalFile} (not found)`);
    }
  });
  
  return {
    totalFiles,
    validFiles,
    invalidFiles,
    totalWarnings,
    totalErrors,
    success: invalidFiles === 0
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    const jsonFiles = findJsonFiles(projectRoot);
    console.log(`Found ${jsonFiles.length} JSON files\n`);
    
    const validationResults = jsonFiles.map(validateJsonFile);
    
    const report = generateReport(validationResults);
    
    if (report.success && report.totalWarnings === 0) {
      console.log('\n🎉 All JSON files are valid with no warnings!');
      process.exit(0);
    } else if (report.success) {
      console.log('\n✅ All JSON files are valid (with warnings)');
      process.exit(0);
    } else {
      console.log('\n💥 JSON validation failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation script error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();