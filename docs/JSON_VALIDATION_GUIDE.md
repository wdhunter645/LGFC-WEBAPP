# 📋 JSON Validation & Best Practices Guide

## 🎯 Overview

This document outlines the JSON validation system implemented to resolve JSON-related issues in the LGFC-WEBAPP project. The solution provides comprehensive JSON file validation, error detection, and formatting standards.

## 🔧 What Was Fixed

### Original Issue
The `security-reports/audit-fix-result.json` file contained npm warning output mixed with JSON data, causing JSON parsing errors throughout the system.

### Resolution Steps
1. **Identified JSON Syntax Error**: The audit report file contained non-JSON content (npm warnings) at the beginning
2. **Fixed Corrupt JSON File**: Removed npm warning text, keeping only valid JSON data
3. **Resolved Formatting Issues**: Added missing newlines to JSON files for consistency
4. **Implemented Validation System**: Created comprehensive JSON validation script
5. **Integrated with CI/CD**: Added JSON validation to build pipeline

## 🛠️ JSON Validation System

### Validation Script
Location: `scripts/validate-json.mjs`

The script performs:
- **Syntax Validation**: Ensures all JSON files have valid syntax
- **Format Checking**: Validates formatting standards (newlines, character encoding)
- **Critical File Monitoring**: Special attention to essential files like package.json
- **Detailed Reporting**: Comprehensive error and warning reports

### Usage
```bash
# Run validation manually
npm run validate:json

# Run as part of pre-commit checks
npm run precommit

# CI/CD integration (automatic)
# Runs on every pull request and push to main
```

### Files Monitored
- `package.json` - Project configuration
- `package-lock.json` - Dependency lock file
- `src/content/settings/site.json` - Site configuration
- `test-data/*.json` - Test data files
- `security-reports/*.json` - Security audit reports
- All other `*.json` files in the project

## ✅ JSON Standards & Best Practices

### File Format Requirements
1. **Valid JSON Syntax**: All files must parse without errors
2. **UTF-8 Encoding**: Use UTF-8 character encoding
3. **Unix Line Endings**: Use LF (\n) not CRLF (\r\n)
4. **Trailing Newline**: All files must end with a newline character
5. **Consistent Indentation**: Use 2 spaces (no tabs)

### Content Standards
- **No Comments**: JSON doesn't support comments (use separate documentation)
- **String Values**: Always use double quotes for strings
- **No Trailing Commas**: Remove trailing commas in objects/arrays
- **Proper Escaping**: Escape special characters correctly

### Example Valid JSON
```json
{
  "name": "lgfc-starter",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build"
  },
  "dependencies": {
    "astro": "^5.13.5"
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow
The JSON validation is integrated into `.github/workflows/ci.yml`:

```yaml
- name: Validate JSON files
  run: npm run validate:json
```

### Benefits
- **Early Detection**: Catch JSON errors before deployment
- **Consistent Quality**: Maintain JSON file standards across the project
- **Automated Reporting**: Get detailed validation reports in CI logs
- **Fail-Fast**: Stop builds immediately if JSON issues are detected

## 📊 Validation Report Example

```
🔍 JSON Validation Script
========================
Found 10 JSON files

✅ package.json: Valid JSON
   📦 Dependencies: 14
   🔧 Dev Dependencies: 13
✅ src/content/settings/site.json: Valid JSON
✅ test-data/sample-events.json: Valid JSON

📊 Validation Summary
====================
Total JSON files: 10
Valid files: 10
Invalid files: 0
Total warnings: 0
Total errors: 0

🎯 Critical files status:
   ✅ package.json
   ✅ package-lock.json
   ✅ src/content/settings/site.json
   ✅ test-data/sample-events.json

🎉 All JSON files are valid with no warnings!
```

## 🚨 Troubleshooting

### Common JSON Issues

1. **Syntax Errors**
   - Missing quotes around property names
   - Trailing commas in objects/arrays
   - Unescaped special characters

2. **File Encoding Issues**
   - Windows line endings (CRLF)
   - Non-UTF-8 encoding
   - Missing trailing newlines

3. **Mixed Content**
   - Non-JSON content in JSON files (like the original issue)
   - Comments in JSON (not supported)

### Quick Fixes
```bash
# Fix a specific JSON file
node -e "console.log(JSON.stringify(require('./file.json'), null, 2))" > temp.json && mv temp.json file.json && echo "" >> file.json

# Validate a single file
python3 -m json.tool file.json > /dev/null && echo "Valid JSON" || echo "Invalid JSON"

# Check all JSON files manually
find . -name "*.json" -not -path "./node_modules/*" -exec python3 -m json.tool {} \; > /dev/null
```

## 🔧 Maintenance

### Regular Tasks
1. **Monitor CI Builds**: Check for JSON validation failures
2. **Update Critical Files List**: Add new important JSON files to validation script
3. **Review Reports**: Address any warnings or formatting issues
4. **Update Documentation**: Keep this guide current with any changes

### When Adding New JSON Files
1. Ensure proper formatting from the start
2. Run validation: `npm run validate:json`
3. Test in CI before merging
4. Add to critical files list if essential to project functionality

## 📚 Resources

- [JSON Specification](https://www.json.org/)
- [JSON Schema Validation](https://json-schema.org/)
- [ESLint JSON Plugin](https://www.npmjs.com/package/eslint-plugin-json)
- [Prettier JSON Formatting](https://prettier.io/docs/en/options.html#parser)

---

**Status**: ✅ JSON validation system fully implemented and operational
**Last Updated**: January 2025
**Maintainer**: Lou Gehrig Fan Club Development Team