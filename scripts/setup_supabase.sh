#!/bin/bash

echo "=== Supabase Setup Script ==="
echo "This script will help set up Supabase for the search-cron action"
echo ""

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: supabase/config.toml not found. Make sure you're in the project root."
    exit 1
fi

echo "1. Installing Supabase CLI..."
# Try different installation methods
if command -v brew &> /dev/null; then
    echo "Using Homebrew..."
    brew install supabase/tap/supabase
elif command -v npm &> /dev/null; then
    echo "Using npm..."
    npm install -g @supabase/cli
else
    echo "❌ No package manager found. Please install Supabase CLI manually:"
    echo "   Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo ""
echo "2. Checking Supabase CLI installation..."
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found after installation"
    exit 1
fi

echo "✅ Supabase CLI installed successfully"
echo ""

echo "3. Current project configuration:"
echo "   Project URL: https://vkwhrbjkdznncjkzkiuo.supabase.co"
echo ""

echo "4. Next steps:"
echo "   a. Get your Supabase access token from: https://supabase.com/dashboard/account/tokens"
echo "   b. Run: supabase login"
echo "   c. Run: supabase link --project-ref vkwhrbjkdznncjkzkiuo"
echo "   d. Run: supabase db push"
echo ""

echo "5. After migrations, update GitHub secrets:"
echo "   - Go to your GitHub repository → Settings → Secrets and variables → Actions"
echo "   - Add/update these secrets:"
echo "     * SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co"
echo "     * SUPABASE_SERVICE_ROLE_KEY=<get_from_supabase_dashboard>"
echo "     * RSS_FEEDS=https://www.mlb.com/feeds/news/rss.xml,https://www.mlb.com/yankees/feeds/news/rss.xml"
echo ""

echo "6. Test the setup:"
echo "   export SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co"
echo "   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo "   node scripts/test_ingest.mjs"
echo ""

echo "=== Setup Complete ==="