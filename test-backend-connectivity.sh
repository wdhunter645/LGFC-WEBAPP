#!/bin/bash

echo "🔍 Backend Connectivity Test for LGFC Web App"
echo "============================================="
echo

echo "📋 Environment Configuration:"
echo "NODE_VERSION: ${NODE_VERSION:-not set}"
echo "SUPABASE_URL: ${SUPABASE_URL:-not set}"
echo "SUPABASE_PUBLIC_API_KEY: ${SUPABASE_PUBLIC_API_KEY:0:20}..." 
echo

echo "🔧 Testing Node.js and Dependencies:"
node --version
npm --version

echo "📦 Checking key dependencies:"
npm list @supabase/supabase-js | grep @supabase/supabase-js || echo "❌ @supabase/supabase-js not found"
npm list @astrojs/tailwind | grep @astrojs/tailwind || echo "❌ @astrojs/tailwind not found"

echo
echo "🏗️  Building the project:"
npm run build

echo
echo "🧪 Testing Supabase Connection:"
node -e "
console.log('Testing Supabase connection...');
import('@supabase/supabase-js').then(async ({createClient})=>{
  const supabaseUrl = process.env.SUPABASE_URL || 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
  const supabaseKey = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_XXXXXXXXXXXXXXXXXXXXXXX';
  
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.from('events').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.log('❌ Supabase connection failed:', err.message);
  }
}).catch(err => console.log('❌ Import failed:', err.message));
" 2>&1

echo
echo "🧪 Testing Netlify Functions:"
if [ -d "netlify/functions-dist" ]; then
    echo "✅ Functions built successfully"
else 
    echo "🏗️  Building Netlify functions..."
    npx @netlify/zip-it-and-ship-it netlify/functions netlify/functions-dist 2>&1
fi

echo
echo "📊 Summary:"
echo "- Project builds: $([ -d "dist" ] && echo "✅ Yes" || echo "❌ No")"
echo "- Functions built: $([ -d "netlify/functions-dist" ] && echo "✅ Yes" || echo "❌ No")"
echo "- Test data available: $([ -f "test-data/sample-events.json" ] && echo "✅ Yes" || echo "❌ No")"
echo
echo "💡 For full testing, deploy to Netlify where environment variables and external connectivity are available."