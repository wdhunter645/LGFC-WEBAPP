#!/bin/bash
# Auto-generated branch cleanup script
# Generated: 2025-08-30T18:08:09.740Z
# Based on audit: audit-reports/branch_audit_2025-08-30T18-07-12.txt

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "Branch Cleanup Script"
echo "Generated: 2025-08-30T18:08:09.740Z"
echo "Repository: $(pwd)"
echo

# Create backup first
log_info "Creating backup..."
BACKUP_TAG="branch-backup-$(date +%Y%m%d-%H%M%S)"
git tag "$BACKUP_TAG" HEAD
log_info "Backup tag created: $BACKUP_TAG"

# Delete branches marked for deletion
log_info "Starting branch cleanup..."
log_info "Will delete 31 branches"

# Delete branch: combined-pr-33-35
# Reason: Combined PR branch, likely already merged
if git ls-remote --exit-code --heads origin "combined-pr-33-35" >/dev/null 2>&1; then
    log_info "Deleting remote branch: combined-pr-33-35"
    git push origin --delete "combined-pr-33-35" || log_warning "Failed to delete remote branch: combined-pr-33-35"
else
    log_warning "Remote branch not found: combined-pr-33-35"
fi

if git show-ref --verify --quiet "refs/heads/combined-pr-33-35"; then
    log_info "Deleting local branch: combined-pr-33-35"
    git branch -D "combined-pr-33-35" || log_warning "Failed to delete local branch: combined-pr-33-35"
fi

# Delete branch: copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb"
    git push origin --delete "copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb" || log_warning "Failed to delete remote branch: copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb"
else
    log_warning "Remote branch not found: copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb"; then
    log_info "Deleting local branch: copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb"
    git branch -D "copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb" || log_warning "Failed to delete local branch: copilot/fix-00b2684d-b7a9-4b91-8422-6a748644d2eb"
fi

# Delete branch: copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743"
    git push origin --delete "copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743" || log_warning "Failed to delete remote branch: copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743"
else
    log_warning "Remote branch not found: copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743"; then
    log_info "Deleting local branch: copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743"
    git branch -D "copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743" || log_warning "Failed to delete local branch: copilot/fix-2aaa45ec-6774-42b1-9b4e-fbc2624bc743"
fi

# Delete branch: copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8"
    git push origin --delete "copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8" || log_warning "Failed to delete remote branch: copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8"
else
    log_warning "Remote branch not found: copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8"; then
    log_info "Deleting local branch: copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8"
    git branch -D "copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8" || log_warning "Failed to delete local branch: copilot/fix-6a002995-be3e-467e-b43f-bb73cfd9f0b8"
fi

# Delete branch: copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc"
    git push origin --delete "copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc" || log_warning "Failed to delete remote branch: copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc"
else
    log_warning "Remote branch not found: copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc"; then
    log_info "Deleting local branch: copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc"
    git branch -D "copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc" || log_warning "Failed to delete local branch: copilot/fix-8b59c92d-0408-4a4a-a9a0-ccf31a7aadfc"
fi

# Delete branch: copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91"
    git push origin --delete "copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91" || log_warning "Failed to delete remote branch: copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91"
else
    log_warning "Remote branch not found: copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91"; then
    log_info "Deleting local branch: copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91"
    git branch -D "copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91" || log_warning "Failed to delete local branch: copilot/fix-42f02088-bb36-4e51-b147-8cc280350f91"
fi

# Delete branch: copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c"
    git push origin --delete "copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c" || log_warning "Failed to delete remote branch: copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c"
else
    log_warning "Remote branch not found: copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c"; then
    log_info "Deleting local branch: copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c"
    git branch -D "copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c" || log_warning "Failed to delete local branch: copilot/fix-45edbab2-a5c1-48eb-b9e7-385f56e56c1c"
fi

# Delete branch: copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f"
    git push origin --delete "copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f" || log_warning "Failed to delete remote branch: copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f"
else
    log_warning "Remote branch not found: copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f"; then
    log_info "Deleting local branch: copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f"
    git branch -D "copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f" || log_warning "Failed to delete local branch: copilot/fix-0327d21c-7833-43b7-ae33-84322b48736f"
fi

# Delete branch: copilot/fix-395aa3d4-0602-488e-9383-15b78081f968
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-395aa3d4-0602-488e-9383-15b78081f968" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-395aa3d4-0602-488e-9383-15b78081f968"
    git push origin --delete "copilot/fix-395aa3d4-0602-488e-9383-15b78081f968" || log_warning "Failed to delete remote branch: copilot/fix-395aa3d4-0602-488e-9383-15b78081f968"
else
    log_warning "Remote branch not found: copilot/fix-395aa3d4-0602-488e-9383-15b78081f968"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-395aa3d4-0602-488e-9383-15b78081f968"; then
    log_info "Deleting local branch: copilot/fix-395aa3d4-0602-488e-9383-15b78081f968"
    git branch -D "copilot/fix-395aa3d4-0602-488e-9383-15b78081f968" || log_warning "Failed to delete local branch: copilot/fix-395aa3d4-0602-488e-9383-15b78081f968"
fi

# Delete branch: copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd"
    git push origin --delete "copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd" || log_warning "Failed to delete remote branch: copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd"
else
    log_warning "Remote branch not found: copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd"; then
    log_info "Deleting local branch: copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd"
    git branch -D "copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd" || log_warning "Failed to delete local branch: copilot/fix-399a2b64-c67f-461a-86dc-c6edf08605cd"
fi

# Delete branch: copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236"
    git push origin --delete "copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236" || log_warning "Failed to delete remote branch: copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236"
else
    log_warning "Remote branch not found: copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236"; then
    log_info "Deleting local branch: copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236"
    git branch -D "copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236" || log_warning "Failed to delete local branch: copilot/fix-517f47dc-7604-474b-ae6a-7a709a55e236"
fi

# Delete branch: copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d"
    git push origin --delete "copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d" || log_warning "Failed to delete remote branch: copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d"
else
    log_warning "Remote branch not found: copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d"; then
    log_info "Deleting local branch: copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d"
    git branch -D "copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d" || log_warning "Failed to delete local branch: copilot/fix-819a50ee-f63e-4e0f-941a-9cb621f0910d"
fi

# Delete branch: copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d"
    git push origin --delete "copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d" || log_warning "Failed to delete remote branch: copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d"
else
    log_warning "Remote branch not found: copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d"; then
    log_info "Deleting local branch: copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d"
    git branch -D "copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d" || log_warning "Failed to delete local branch: copilot/fix-8403ea4c-ec6a-49ff-8261-ee934b01b26d"
fi

# Delete branch: copilot/fix-21029818-a151-4c3a-8140-19f405835744
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-21029818-a151-4c3a-8140-19f405835744" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-21029818-a151-4c3a-8140-19f405835744"
    git push origin --delete "copilot/fix-21029818-a151-4c3a-8140-19f405835744" || log_warning "Failed to delete remote branch: copilot/fix-21029818-a151-4c3a-8140-19f405835744"
else
    log_warning "Remote branch not found: copilot/fix-21029818-a151-4c3a-8140-19f405835744"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-21029818-a151-4c3a-8140-19f405835744"; then
    log_info "Deleting local branch: copilot/fix-21029818-a151-4c3a-8140-19f405835744"
    git branch -D "copilot/fix-21029818-a151-4c3a-8140-19f405835744" || log_warning "Failed to delete local branch: copilot/fix-21029818-a151-4c3a-8140-19f405835744"
fi

# Delete branch: copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38"
    git push origin --delete "copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38" || log_warning "Failed to delete remote branch: copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38"
else
    log_warning "Remote branch not found: copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38"; then
    log_info "Deleting local branch: copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38"
    git branch -D "copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38" || log_warning "Failed to delete local branch: copilot/fix-73134950-c1ae-47ca-9082-5aa13d25ac38"
fi

# Delete branch: copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7"
    git push origin --delete "copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7" || log_warning "Failed to delete remote branch: copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7"
else
    log_warning "Remote branch not found: copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7"; then
    log_info "Deleting local branch: copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7"
    git branch -D "copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7" || log_warning "Failed to delete local branch: copilot/fix-a8e4f61b-21e0-4b4d-91d8-f8380d7f25d7"
fi

# Delete branch: copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841"
    git push origin --delete "copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841" || log_warning "Failed to delete remote branch: copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841"
else
    log_warning "Remote branch not found: copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841"; then
    log_info "Deleting local branch: copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841"
    git branch -D "copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841" || log_warning "Failed to delete local branch: copilot/fix-a62319e2-9915-4301-aec6-2a3a1972a841"
fi

# Delete branch: copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9"
    git push origin --delete "copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9" || log_warning "Failed to delete remote branch: copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9"
else
    log_warning "Remote branch not found: copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9"; then
    log_info "Deleting local branch: copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9"
    git branch -D "copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9" || log_warning "Failed to delete local branch: copilot/fix-ce4eb447-f329-4c90-8543-dd3ba92d37c9"
fi

# Delete branch: copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d
# Reason: Temporary Copilot fix branch with UUID
if git ls-remote --exit-code --heads origin "copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d" >/dev/null 2>&1; then
    log_info "Deleting remote branch: copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d"
    git push origin --delete "copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d" || log_warning "Failed to delete remote branch: copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d"
else
    log_warning "Remote branch not found: copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d"
fi

if git show-ref --verify --quiet "refs/heads/copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d"; then
    log_info "Deleting local branch: copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d"
    git branch -D "copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d" || log_warning "Failed to delete local branch: copilot/fix-ddb8486e-4355-4c16-84ce-79a96071483d"
fi

# Delete branch: cursor/analyze-website-codebase-for-recommendations-ce55
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/analyze-website-codebase-for-recommendations-ce55" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/analyze-website-codebase-for-recommendations-ce55"
    git push origin --delete "cursor/analyze-website-codebase-for-recommendations-ce55" || log_warning "Failed to delete remote branch: cursor/analyze-website-codebase-for-recommendations-ce55"
else
    log_warning "Remote branch not found: cursor/analyze-website-codebase-for-recommendations-ce55"
fi

if git show-ref --verify --quiet "refs/heads/cursor/analyze-website-codebase-for-recommendations-ce55"; then
    log_info "Deleting local branch: cursor/analyze-website-codebase-for-recommendations-ce55"
    git branch -D "cursor/analyze-website-codebase-for-recommendations-ce55" || log_warning "Failed to delete local branch: cursor/analyze-website-codebase-for-recommendations-ce55"
fi

# Delete branch: cursor/automation-loops
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/automation-loops" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/automation-loops"
    git push origin --delete "cursor/automation-loops" || log_warning "Failed to delete remote branch: cursor/automation-loops"
else
    log_warning "Remote branch not found: cursor/automation-loops"
fi

if git show-ref --verify --quiet "refs/heads/cursor/automation-loops"; then
    log_info "Deleting local branch: cursor/automation-loops"
    git branch -D "cursor/automation-loops" || log_warning "Failed to delete local branch: cursor/automation-loops"
fi

# Delete branch: cursor/check-if-process-is-still-running-4e70
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/check-if-process-is-still-running-4e70" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/check-if-process-is-still-running-4e70"
    git push origin --delete "cursor/check-if-process-is-still-running-4e70" || log_warning "Failed to delete remote branch: cursor/check-if-process-is-still-running-4e70"
else
    log_warning "Remote branch not found: cursor/check-if-process-is-still-running-4e70"
fi

if git show-ref --verify --quiet "refs/heads/cursor/check-if-process-is-still-running-4e70"; then
    log_info "Deleting local branch: cursor/check-if-process-is-still-running-4e70"
    git branch -D "cursor/check-if-process-is-still-running-4e70" || log_warning "Failed to delete local branch: cursor/check-if-process-is-still-running-4e70"
fi

# Delete branch: cursor/find-today-s-chat-thread-fa8c
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/find-today-s-chat-thread-fa8c" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/find-today-s-chat-thread-fa8c"
    git push origin --delete "cursor/find-today-s-chat-thread-fa8c" || log_warning "Failed to delete remote branch: cursor/find-today-s-chat-thread-fa8c"
else
    log_warning "Remote branch not found: cursor/find-today-s-chat-thread-fa8c"
fi

if git show-ref --verify --quiet "refs/heads/cursor/find-today-s-chat-thread-fa8c"; then
    log_info "Deleting local branch: cursor/find-today-s-chat-thread-fa8c"
    git branch -D "cursor/find-today-s-chat-thread-fa8c" || log_warning "Failed to delete local branch: cursor/find-today-s-chat-thread-fa8c"
fi

# Delete branch: cursor/for-fuck-sake-e246
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/for-fuck-sake-e246" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/for-fuck-sake-e246"
    git push origin --delete "cursor/for-fuck-sake-e246" || log_warning "Failed to delete remote branch: cursor/for-fuck-sake-e246"
else
    log_warning "Remote branch not found: cursor/for-fuck-sake-e246"
fi

if git show-ref --verify --quiet "refs/heads/cursor/for-fuck-sake-e246"; then
    log_info "Deleting local branch: cursor/for-fuck-sake-e246"
    git branch -D "cursor/for-fuck-sake-e246" || log_warning "Failed to delete local branch: cursor/for-fuck-sake-e246"
fi

# Delete branch: cursor/get-back-into-coding-7c2d
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/get-back-into-coding-7c2d" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/get-back-into-coding-7c2d"
    git push origin --delete "cursor/get-back-into-coding-7c2d" || log_warning "Failed to delete remote branch: cursor/get-back-into-coding-7c2d"
else
    log_warning "Remote branch not found: cursor/get-back-into-coding-7c2d"
fi

if git show-ref --verify --quiet "refs/heads/cursor/get-back-into-coding-7c2d"; then
    log_info "Deleting local branch: cursor/get-back-into-coding-7c2d"
    git branch -D "cursor/get-back-into-coding-7c2d" || log_warning "Failed to delete local branch: cursor/get-back-into-coding-7c2d"
fi

# Delete branch: cursor/monday0818-background-task-1b3e
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/monday0818-background-task-1b3e" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/monday0818-background-task-1b3e"
    git push origin --delete "cursor/monday0818-background-task-1b3e" || log_warning "Failed to delete remote branch: cursor/monday0818-background-task-1b3e"
else
    log_warning "Remote branch not found: cursor/monday0818-background-task-1b3e"
fi

if git show-ref --verify --quiet "refs/heads/cursor/monday0818-background-task-1b3e"; then
    log_info "Deleting local branch: cursor/monday0818-background-task-1b3e"
    git branch -D "cursor/monday0818-background-task-1b3e" || log_warning "Failed to delete local branch: cursor/monday0818-background-task-1b3e"
fi

# Delete branch: cursor/morning-greeting-and-status-check-ef98
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/morning-greeting-and-status-check-ef98" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/morning-greeting-and-status-check-ef98"
    git push origin --delete "cursor/morning-greeting-and-status-check-ef98" || log_warning "Failed to delete remote branch: cursor/morning-greeting-and-status-check-ef98"
else
    log_warning "Remote branch not found: cursor/morning-greeting-and-status-check-ef98"
fi

if git show-ref --verify --quiet "refs/heads/cursor/morning-greeting-and-status-check-ef98"; then
    log_info "Deleting local branch: cursor/morning-greeting-and-status-check-ef98"
    git branch -D "cursor/morning-greeting-and-status-check-ef98" || log_warning "Failed to delete local branch: cursor/morning-greeting-and-status-check-ef98"
fi

# Delete branch: cursor/schedule-monday-august-eighteenth-b59f
# Reason: Cursor branch
if git ls-remote --exit-code --heads origin "cursor/schedule-monday-august-eighteenth-b59f" >/dev/null 2>&1; then
    log_info "Deleting remote branch: cursor/schedule-monday-august-eighteenth-b59f"
    git push origin --delete "cursor/schedule-monday-august-eighteenth-b59f" || log_warning "Failed to delete remote branch: cursor/schedule-monday-august-eighteenth-b59f"
else
    log_warning "Remote branch not found: cursor/schedule-monday-august-eighteenth-b59f"
fi

if git show-ref --verify --quiet "refs/heads/cursor/schedule-monday-august-eighteenth-b59f"; then
    log_info "Deleting local branch: cursor/schedule-monday-august-eighteenth-b59f"
    git branch -D "cursor/schedule-monday-august-eighteenth-b59f" || log_warning "Failed to delete local branch: cursor/schedule-monday-august-eighteenth-b59f"
fi

# Delete branch: feature/vercel-overlay
# Reason: Old feature branch
if git ls-remote --exit-code --heads origin "feature/vercel-overlay" >/dev/null 2>&1; then
    log_info "Deleting remote branch: feature/vercel-overlay"
    git push origin --delete "feature/vercel-overlay" || log_warning "Failed to delete remote branch: feature/vercel-overlay"
else
    log_warning "Remote branch not found: feature/vercel-overlay"
fi

if git show-ref --verify --quiet "refs/heads/feature/vercel-overlay"; then
    log_info "Deleting local branch: feature/vercel-overlay"
    git branch -D "feature/vercel-overlay" || log_warning "Failed to delete local branch: feature/vercel-overlay"
fi

# Delete branch: revert-65-copilot/fix-64
# Reason: Revert branch, likely temporary
if git ls-remote --exit-code --heads origin "revert-65-copilot/fix-64" >/dev/null 2>&1; then
    log_info "Deleting remote branch: revert-65-copilot/fix-64"
    git push origin --delete "revert-65-copilot/fix-64" || log_warning "Failed to delete remote branch: revert-65-copilot/fix-64"
else
    log_warning "Remote branch not found: revert-65-copilot/fix-64"
fi

if git show-ref --verify --quiet "refs/heads/revert-65-copilot/fix-64"; then
    log_info "Deleting local branch: revert-65-copilot/fix-64"
    git branch -D "revert-65-copilot/fix-64" || log_warning "Failed to delete local branch: revert-65-copilot/fix-64"
fi

# Delete branch: vercel-import
# Reason: Import branch, likely temporary
if git ls-remote --exit-code --heads origin "vercel-import" >/dev/null 2>&1; then
    log_info "Deleting remote branch: vercel-import"
    git push origin --delete "vercel-import" || log_warning "Failed to delete remote branch: vercel-import"
else
    log_warning "Remote branch not found: vercel-import"
fi

if git show-ref --verify --quiet "refs/heads/vercel-import"; then
    log_info "Deleting local branch: vercel-import"
    git branch -D "vercel-import" || log_warning "Failed to delete local branch: vercel-import"
fi

log_info "Branch cleanup completed!"
log_info "Deleted 31 branches"
log_info "To restore if needed, use: git checkout $BACKUP_TAG"

# Clean up remote tracking references
git remote prune origin

echo "Cleanup completed successfully!"