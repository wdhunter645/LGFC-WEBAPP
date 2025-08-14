#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('=== Supabase Connection Test ===');
console.log('Time:', new Date().toISOString());
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('\n1. Testing basic connection...');
  
  try {
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
      
      // Check if it's an auth error
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔍 This suggests the anon key is incorrect for this project.');
        console.log('   Please verify the anon key in your .env file matches the current project.');
      }
      
      return false;
    } else {
      console.log('✅ Connection successful!');
      console.log('   Data:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n2. Testing health check...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    console.log('   Status:', response.status);
    console.log('   Status text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
    }
  } catch (err) {
    console.error('❌ Health check error:', err.message);
  }
}

async function main() {
  console.log('Starting connection tests...\n');
  
  await testHealthCheck();
  await testConnection();
  
  console.log('\n=== Test Complete ===');
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});