#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Search Cron Diagnostic Test ===');
console.log('Time:', new Date().toISOString());

// Check environment variables
console.log('\n1. Environment Variables:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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