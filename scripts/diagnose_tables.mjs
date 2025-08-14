#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vkwhrbjkdznncjkzkiuo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdmdpbWRubWd5d2t5dmhqdm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwMDAwMDAwMDIsImV4cCI6MjAzNTgyNDA4OX0.L1zaSyCeqylWTj4S140v2_78oxtGnHveV-GMZdc";

console.log('=== Database Table Diagnostic ===');
console.log('Time:', new Date().toISOString());
console.log('SUPABASE_URL:', SUPABASE_URL);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTables() {
  console.log('\n1. Checking Required Tables:');
  
  const requiredTables = [
    'search_state',
    'content_items', 
    'media_files',
    'search_sessions'
  ];
  
  for (const table of requiredTables) {
    try {
      console.log(`\nChecking table: ${table}`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table}: ${error.message}`);
        console.error(`   Error code: ${error.code}`);
        console.error(`   Details: ${error.details}`);
      } else {
        console.log(`✅ Table ${table}: exists and accessible`);
        if (data && data.length > 0) {
          console.log(`   Sample data:`, JSON.stringify(data[0], null, 2));
        } else {
          console.log(`   Table is empty`);
        }
      }
    } catch (err) {
      console.error(`❌ Table ${table} error:`, err.message);
    }
  }
}

async function checkSearchState() {
  console.log('\n2. Checking Search State:');
  try {
    const { data, error } = await supabase
      .from('search_state')
      .select('*')
      .eq('id', 1);
    
    if (error) {
      console.error('❌ Search state query failed:', error.message);
    } else if (!data || data.length === 0) {
      console.log('⚠️ Search state table is empty');
      console.log('   This table should have a record with id=1');
    } else {
      console.log('✅ Search state record exists:', data[0]);
    }
  } catch (err) {
    console.error('❌ Search state check failed:', err.message);
  }
}

async function checkContentItems() {
  console.log('\n3. Checking Content Items:');
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Content items query failed:', error.message);
    } else {
      console.log('✅ Content items table is accessible');
    }
  } catch (err) {
    console.error('❌ Content items check failed:', err.message);
  }
}

async function main() {
  console.log('Starting database diagnostic...\n');
  
  await checkTables();
  await checkSearchState();
  await checkContentItems();
  
  console.log('\n=== Diagnostic Complete ===');
  console.log('\nTroubleshooting Tips:');
  console.log('1. If tables are missing, run: supabase db push');
  console.log('2. If access is denied, check RLS policies');
  console.log('3. If service role key is needed, check GitHub secrets');
}

main().catch(err => {
  console.error('❌ Diagnostic failed:', err);
  process.exit(1);
});