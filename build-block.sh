#!/bin/sh

if [ "$NETLIFY_APPROVED" != "true" ]; then
  echo "Netlify build denied: Approval required from repository owner."
  exit 1
fi
