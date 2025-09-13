const fs = require('fs');
const yaml = require('yaml');

// Test to validate the incident response workflow structure
test('Incident response workflow validation', () => {
  const workflowPath = '.github/workflows/incident-response.yml';
  
  // Check if file exists
  expect(fs.existsSync(workflowPath)).toBe(true);
  
  // Parse the YAML
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  const workflow = yaml.parse(workflowContent);
  
  // Validate basic structure
  expect(workflow.name).toBe('Incident Response Bot');
  expect(workflow.on.schedule).toBeDefined();
  expect(workflow.on.workflow_dispatch).toBeDefined();
  
  // Check schedule is hourly
  expect(workflow.on.schedule[0].cron).toBe('0 * * * *');
  
  // Validate workflow_dispatch inputs
  expect(workflow.on.workflow_dispatch.inputs.check_type).toBeDefined();
  expect(workflow.on.workflow_dispatch.inputs.create_issue).toBeDefined();
  expect(workflow.on.workflow_dispatch.inputs.severity_threshold).toBeDefined();
  
  // Check permissions
  expect(workflow.permissions).toEqual({
    contents: 'read',
    issues: 'write',
    actions: 'read',
    'pull-requests': 'read',
    'security-events': 'read'
  });
  
  // Validate job structure
  expect(workflow.jobs['incident-detection']).toBeDefined();
  expect(workflow.jobs['incident-detection']['runs-on']).toBe('ubuntu-latest');
  expect(Array.isArray(workflow.jobs['incident-detection'].steps)).toBe(true);
  
  // Check for key steps
  const stepNames = workflow.jobs['incident-detection'].steps.map(step => step.name);
  expect(stepNames).toContain('Checkout repository');
  expect(stepNames).toContain('Check for workflow failures');
  expect(stepNames).toContain('Check for security alerts');
  expect(stepNames).toContain('Check system health indicators');
  expect(stepNames).toContain('Check external services availability');
  expect(stepNames).toContain('Consolidate incident findings');
  expect(stepNames).toContain('Create incident issue if needed');
  
  // Validate that key steps use proper actions
  const checkoutStep = workflow.jobs['incident-detection'].steps.find(step => step.name === 'Checkout repository');
  expect(checkoutStep.uses).toBe('actions/checkout@v4');
  
  // Validate conditional execution
  const workflowStep = workflow.jobs['incident-detection'].steps.find(step => step.name === 'Check for workflow failures');
  expect(workflowStep.if).toBeDefined();
  expect(workflowStep.uses).toBe('actions/github-script@v7');
});

// Test workflow input validation
test('Workflow input options validation', () => {
  const workflowPath = '.github/workflows/incident-response.yml';
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  const workflow = yaml.parse(workflowContent);
  
  const inputs = workflow.on.workflow_dispatch.inputs;
  
  // Check check_type options
  expect(inputs.check_type.options).toEqual([
    'all',
    'workflow_failures', 
    'security_alerts',
    'system_health',
    'external_services'
  ]);
  
  // Check severity_threshold options
  expect(inputs.severity_threshold.options).toEqual([
    'low',
    'medium', 
    'high',
    'critical'
  ]);
  
  // Check defaults
  expect(inputs.check_type.default).toBe('all');
  expect(inputs.create_issue.default).toBe(true);
  expect(inputs.severity_threshold.default).toBe('medium');
});