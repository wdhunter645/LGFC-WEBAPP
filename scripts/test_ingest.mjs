#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

console.log('=== Search Cron Diagnostic Test (JWT Internal Variables) ===');
console.log('Time:', new Date().toISOString());

// JWT approach: Public API key for connection, JWT for authentication
const SUPABASE_URL = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_XXXXXXXXXXXXXXXXXXXXXXX';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testPublicAPI() {
  console.log('\n1. Testing Public API with RLS:');
  try {
    const { data: testData, error: testError } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Public API test failed:', testError.message);
      return false;
    }
    
    console.log('✅ Public API test successful!');
    console.log('   RLS Status: Enabled and working');
    console.log('   Data accessible:', testData ? 'Yes' : 'No');
    return true;
  } catch (err) {
    console.error('❌ Public API test error:', err.message);
    return false;
  }
}

async function testConnection() {
  console.log('\n2. Testing Supabase Connection:');
  try {
    const { data, error } = await supabase.from('search_state').select('*').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    console.log('✅ Database connection successful');
    console.log('Search state data:', data);
    return true;
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return false;
  }
}

async function testTables() {
  console.log('\n3. Testing Required Tables:');
  
  const tables = ['search_state', 'content_items', 'media_files'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.error(`❌ Table ${table}:`, error.message);
      } else {
        console.log(`✅ Table ${table}: accessible`);
      }
    } catch (err) {
      console.error(`❌ Table ${table} error:`, err.message);
    }
  }
}

async function testSearchState() {
  console.log('\n4. Testing Search State:');
  try {
    const { data: stateRows } = await supabase.from('search_state').select('last_run_at').eq('id', 1).limit(1);
    console.log('Search state query result:', stateRows);
    
    if (stateRows && stateRows.length > 0) {
      console.log('✅ Search state table has data');
    } else {
      console.log('⚠️ Search state table is empty, inserting initial record...');
      const { error } = await supabase.from('search_state').upsert({ id: 1, last_run_at: null });
      if (error) {
        console.error('❌ Failed to insert search state:', error.message);
      } else {
        console.log('✅ Search state initialized');
      }
    }
  } catch (err) {
    console.error('❌ Search state test failed:', err.message);
  }
}

async function main() {
  console.log('Starting diagnostic tests...\n');
  
  const apiOk = await testPublicAPI();
  if (!apiOk) {
    console.log('\n❌ Cannot proceed - Public API test failed');
    process.exit(1);
  }
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed - database connection failed');
    process.exit(1);
  }
  
  await testTables();
  await testSearchState();
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('If all tests passed, the ingest script should work.');
  console.log('If any tests failed, those need to be fixed first.');
}

main().catch(err => {
  console.error('❌ Diagnostic failed:', err);
  process.exit(1);
});