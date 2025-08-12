# Supabase Backend Components

This directory contains Supabase Edge Functions and SQL migrations for the Lou Gehrig Fan Club backend.

## Prerequisites
- Supabase project (URL and keys)
- Supabase CLI installed and authenticated

## Environment
Set these in your shell or CI prior to deploying/testing:
```
SUPABASE_URL="https://<your>.supabase.co"
SUPABASE_ANON_KEY="..."            # optional for local tests
SUPABASE_SERVICE_ROLE_KEY="..."    # required for Edge Function to insert
```

## Apply migrations
```
supabase db push   # or: supabase db reset --local (for local dev)
```

## Deploy Edge Function
Function: `search-content`
```
cd supabase/functions/search-content
supabase functions deploy search-content --project-ref <your-project-ref>
```

## Invoke (HTTP)
The function expects a POST body `{ "query": "<search terms>", "maxResults": 10 }`.
```
curl -s -X POST "https://<project>.supabase.co/functions/v1/search-content" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -d '{"query":"Lou Gehrig Day"}' | jq .
```

Notes:
- The function currently simulates search results; integrate a real search API as needed.
- Ensure RLS and table structures are compatible with the inserts performed by the function (see migrations).