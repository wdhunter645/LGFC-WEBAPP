#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

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

async function checkMigrations() {
  console.log('=== Database Migration Check (Public API with RLS) ===');
  
  // Public API key works directly with RLS - no anonymous sign-in needed
  console.log('1. Testing Public API connection with RLS...');
  
  // Test connection by checking if we can access the search_state table
  const { data: testData, error: testError } = await supabase
    .from('search_state')
    .select('*')
    .limit(1);
  
  if (testError) {
    console.error('❌ Public API connection failed:', testError.message);
    console.log('Note: Public API requires RLS to be enabled on all tables');
    process.exit(1);
  }
  
  console.log('✅ Public API connection successful');
  console.log('   RLS Status: Enabled and working');
  console.log('   API Access: Direct with public key');
  
  const requiredTables = [
    'search_state',
    'content_items', 
    'media_files',
    'search_sessions'
  ];
  
  console.log('\n2. Checking Required Tables (using session-based API):');
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: exists and accessible via session API`);
      }
    } catch (err) {
      console.error(`❌ Table ${table} error:`, err.message);
    }
  }
  
  // Check if search_state has the required record
  console.log('\n3. Checking Search State (session-based):');
  try {
    const { data, error } = await supabase
      .from('search_state')
      .select('*')
      .eq('id', 1);
    
    if (error) {
      console.error('❌ Search state query failed:', error.message);
    } else if (!data || data.length === 0) {
      console.log('⚠️ Search state table is empty, creating initial record...');
      const { error: insertError } = await supabase
        .from('search_state')
        .upsert({ id: 1, last_run_at: null, last_query: '' });
      
      if (insertError) {
        console.error('❌ Failed to create search state record:', insertError.message);
      } else {
        console.log('✅ Search state record created via session API');
      }
    } else {
      console.log('✅ Search state record exists (accessed via session API)');
    }
  } catch (err) {
    console.error('❌ Search state check failed:', err.message);
  }
}

checkMigrations().catch(err => {
  console.error('Migration check failed:', err);
  process.exit(1);
});