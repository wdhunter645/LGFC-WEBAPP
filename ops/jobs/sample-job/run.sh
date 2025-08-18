# Sample Job Runbook

Purpose: Example structure for job docs. Replace sample-job with your job name.

## Incident
- Summary:
- Timeline:
- Impact:

## Remediation
- Changes applied:
- Why this works:

## Verification
- Commands/scripts used:
- Result:

## Next
- Next:

## Scripts
- diagnose.sh: collect logs/state for this job
- run.sh: execute the job end-to-end to verify fix
set -euo pipefail
# Collect logs/state for this job; write to artifacts dir
ART=ops_artifacts
mkdir -p ""
echo "diagnose sample-job at 2025-08-18T15:13:57Z" | tee -a "/sample-job.log"
set -euo pipefail
# Execute the job end-to-end for verification
echo "run sample-job at 2025-08-18T15:13:57Z" 
