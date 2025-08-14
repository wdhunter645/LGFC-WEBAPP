#!/bin/bash

echo "🔄 Updating all pages to use JWT client..."

# Update all .astro files in src/pages to use the new JWT client
find src/pages -name "*.astro" -type f | while read file; do
    echo "Processing: $file"
    
    # Replace old createClient imports with new JWT client
    sed -i 's|import { createClient } from '\''@supabase/supabase-js'\'';|import { createClient } from '\''../lib/supabase-client.js'\'';|g' "$file"
    sed -i 's|import { createClient } from '\''https://esm.sh/@supabase/supabase-js@2'\'';|import { createClient } from '\''../lib/supabase-client.js'\'';|g' "$file"
    
    # Replace createClient calls with new pattern
    sed -i 's|createClient(import\.meta\.env\.VITE_SUPABASE_URL, import\.meta\.env\.VITE_SUPABASE_ANON_KEY)|createClient()|g' "$file"
    sed -i 's|createClient(SUPABASE_URL, SUPABASE_ANON_KEY)|createClient()|g' "$file"
    
    # Remove old variable declarations
    sed -i '/const SUPABASE_URL = import\.meta\.env\.VITE_SUPABASE_URL;/d' "$file"
    sed -i '/const SUPABASE_ANON_KEY = import\.meta\.env\.VITE_SUPABASE_ANON_KEY;/d' "$file"
    sed -i '/const SUPABASE_URL = process\.env\.VITE_SUPABASE_URL;/d' "$file"
    sed -i '/const SUPABASE_ANON_KEY = process\.env\.VITE_SUPABASE_ANON_KEY;/d' "$file"
done

echo "✅ All pages updated to use JWT client!"