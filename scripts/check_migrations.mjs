#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL');
  process.exit(1);
}

// Session-based API client - anon key for connection, JWT handles internal session management
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'jwt-only-placeholder-key', {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function checkMigrations() {
  console.log('=== Database Migration Check (Session-Based API) ===');
  
  // JWT creates session using internal Supabase variables (not exposed externally)
  console.log('1. Creating JWT session (uses internal Supabase variables)...');
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  
  if (authError) {
    console.error('❌ JWT session creation failed:', authError.message);
    console.log('Note: JWT uses internal Supabase server variables for session management');
    process.exit(1);
  }
  
  console.log('✅ JWT session created successfully');
  console.log('   User ID:', authData.user.id);
  console.log('   Session API: Active (rotates for security)');
  
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