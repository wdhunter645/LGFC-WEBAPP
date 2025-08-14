#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

console.log('=== Search Cron Diagnostic Test (JWT Internal Variables) ===');
console.log('Time:', new Date().toISOString());

// JWT uses internal Supabase server variables - no need for external env vars
// The client will automatically connect using internal configuration
const supabase = createClient(
  'https://vkwhrbjkdznncjkzkiuo.supabase.co', // Direct URL since no env var needed
  'jwt-only-placeholder-key', // Placeholder since JWT handles auth internally
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

async function authenticateWithJWT() {
  console.log('\n1. Testing JWT Authentication (Internal Variables):');
  try {
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.error('❌ JWT authentication failed:', authError.message);
      return false;
    }
    
    if (authData.user) {
      console.log('✅ JWT authentication successful!');
      console.log('   User ID:', authData.user.id);
      console.log('   Session:', authData.session ? 'Active' : 'None');
      return true;
    } else {
      console.log('⚠️ JWT authentication succeeded but no user data');
      return false;
    }
  } catch (err) {
    console.error('❌ JWT authentication error:', err.message);
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
  
  const authOk = await authenticateWithJWT();
  if (!authOk) {
    console.log('\n❌ Cannot proceed - JWT authentication failed');
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