#!/usr/bin/env bash
set -euo pipefail

require() { v="$1"; if [[ -z "${!v:-}" ]]; then echo "Missing env: $v" >&2; exit 1; fi; }

require SUPABASE_URL
require SUPABASE_SERVICE_ROLE_KEY

QUERY=${1:-"Lou Gehrig"}
MAX=${2:-10}

curl -s -X POST "$SUPABASE_URL/functions/v1/search-content" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d "{\"query\":\"$QUERY\",\"maxResults\":$MAX}" | jq .