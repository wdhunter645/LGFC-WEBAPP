#!/usr/bin/env node

console.log('🔍 Environment Variable Test');
console.log('============================');

// Check if SUPABASE_PUBLIC_API_KEY is set
const apiKey = process.env.SUPABASE_PUBLIC_API_KEY;
if (apiKey) {
  console.log('✅ SUPABASE_PUBLIC_API_KEY is set');
  console.log('   Length:', apiKey.length);
  console.log('   Starts with:', apiKey.substring(0, 20) + '...');
} else {
  console.log('❌ SUPABASE_PUBLIC_API_KEY is NOT set');
}

// Check other environment variables
console.log('\n📋 Other Environment Variables:');
console.log('RSS_FEEDS:', process.env.RSS_FEEDS ? 'Set' : 'Not set');
console.log('NYT_API_KEY:', process.env.NYT_API_KEY ? 'Set' : 'Not set');

// Test basic connection
if (apiKey) {
  console.log('\n🔗 Testing connection with API key...');
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    'https://vkwhrbjkdznncjkzkiuo.supabase.co',
    apiKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  );
  
  try {
    const { data, error } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Connection successful');
      console.log('   Data received:', data ? 'Yes' : 'No');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
  }
} else {
  console.log('\n⚠️ Cannot test connection - no API key available');
}

console.log('\n🏁 Test complete');