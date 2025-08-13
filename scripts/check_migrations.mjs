#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkMigrations() {
  console.log('=== Database Migration Check ===');
  
  const requiredTables = [
    'search_state',
    'content_items', 
    'media_files',
    'search_sessions'
  ];
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: exists and accessible`);
      }
    } catch (err) {
      console.error(`❌ Table ${table} error:`, err.message);
    }
  }
  
  // Check if search_state has the required record
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
        console.log('✅ Search state record created');
      }
    } else {
      console.log('✅ Search state record exists');
    }
  } catch (err) {
    console.error('❌ Search state check failed:', err.message);
  }
}

checkMigrations().catch(err => {
  console.error('Migration check failed:', err);
  process.exit(1);
});