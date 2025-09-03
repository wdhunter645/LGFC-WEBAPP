#!/usr/bin/env node

console.log('🔍 GitHub Actions Debug Script');
console.log('==============================');
console.log('Time:', new Date().toISOString());
console.log('Node version:', process.version);
console.log('Platform:', process.platform);

// Check environment variables
console.log('\n📋 Environment Variables:');
const envVars = [
  'SUPABASE_PUBLIC_API_KEY',
  'RSS_FEEDS', 
  'NYT_API_KEY',
  'GITHUB_ACTIONS',
  'GITHUB_WORKFLOW'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set (length: ${value.length})`);
    if (varName === 'SUPABASE_PUBLIC_API_KEY') {
      console.log(`   Starts with: ${value.substring(0, 20)}...`);
    }
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// Test Supabase connection
console.log('\n🔗 Testing Supabase Connection...');

const SUPABASE_URL = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_XXXXXXXXXXXXXXXXXXXXXXX';

console.log('URL:', SUPABASE_URL);
console.log('API Key source:', process.env.SUPABASE_PUBLIC_API_KEY ? 'Environment variable' : 'Fallback hardcoded');

try {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
  
  console.log('✅ Supabase client created');
  
  // Test basic query
  const { data, error } = await supabase
    .from('search_state')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('❌ Query failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', error.details);
    console.log('Error hint:', error.hint);
  } else {
    console.log('✅ Query successful');
    console.log('Data received:', data ? 'Yes' : 'No');
    if (data && data.length > 0) {
      console.log('Sample data:', JSON.stringify(data[0], null, 2));
    }
  }
  
} catch (err) {
  console.log('❌ Connection error:', err.message);
  console.log('Error stack:', err.stack);
}

console.log('\n🏁 Debug complete');