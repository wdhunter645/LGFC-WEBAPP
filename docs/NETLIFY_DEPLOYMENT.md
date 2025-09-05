# Netlify Build & Deployment Policy

**Automatic Netlify builds and deployments are disabled for this repository.**

## Policy
- No builds will be triggered from GitHub pushes, merges, or pull requests.
- All Netlify builds must be manually approved and triggered by the repository owner.

## How to request a build

1. Contact the repository owner (`wdhunter645`) to request build approval.
2. Owner will set the environment variable `NETLIFY_APPROVED=true` in the Netlify dashboard before triggering a manual build.

## Enforcement

A build-blocking script is included in this repository.  
All builds will fail unless `NETLIFY_APPROVED=true` is set.

## Disabling Automatic Builds

Automatic builds have been disabled in the Netlify dashboard for this project.  
If you need to re-enable, contact the repository owner.
