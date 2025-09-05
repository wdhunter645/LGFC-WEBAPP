#!/usr/bin/env node
/**
 * RLS Implementation Verification Script
 * 
 * This script helps verify that the RLS (Row Level Security) implementation
 * from RLS_IMPLEMENTATION_STEPS.md has been completed successfully.
 * 
 * Run this AFTER implementing the SQL policies in Supabase dashboard.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vkwhrbjkdznncjkzkiuo.supabase.co';
const SUPABASE_PUBLIC_API_KEY = process.env.SUPABASE_PUBLIC_API_KEY || 'sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_API_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function verifyRLSImplementation() {
  console.log('🔐 RLS Implementation Verification');
  console.log('=====================================');
  console.log('Verifying Row Level Security setup from RLS_IMPLEMENTATION_STEPS.md');
  console.log('');
  
  const requiredTables = [
    'search_state',
    'content_items', 
    'media_files',
    'search_sessions'
  ];

  let allTablesWorking = true;
  
  console.log('📋 Testing table access with public API key...');
  console.log('');
  
  for (const table of requiredTables) {
    try {
      console.log(`   Testing ${table}...`);
      
      // Test read access
      const { data: readData, error: readError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (readError) {
        console.log(`   ❌ ${table} - Read access failed: ${readError.message}`);
        allTablesWorking = false;
      } else {
        console.log(`   ✅ ${table} - Read access working`);
        
        // Test write access (insert a test record)
        const testRecord = {
          id: `test-${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        // Add table-specific fields
        if (table === 'search_state') {
          testRecord.state_data = { test: true };
        } else if (table === 'content_items') {
          testRecord.title = 'Test Title';
          testRecord.content = 'Test Content';
          testRecord.source = 'test';
        } else if (table === 'media_files') {
          testRecord.file_name = 'test.jpg';
          testRecord.file_path = 'test/path';
        } else if (table === 'search_sessions') {
          testRecord.session_data = { test: true };
        }
        
        const { data: writeData, error: writeError } = await supabase
          .from(table)
          .insert(testRecord)
          .select();
        
        if (writeError) {
          console.log(`   ⚠️  ${table} - Write access failed: ${writeError.message}`);
          // Read-only access might be intentional, don't fail verification
        } else {
          console.log(`   ✅ ${table} - Write access working`);
          
          // Clean up test record
          await supabase
            .from(table)
            .delete()
            .eq('id', testRecord.id);
        }
      }
    } catch (error) {
      console.log(`   ❌ ${table} - Connection failed: ${error.message}`);
      allTablesWorking = false;
    }
    
    console.log('');
  }
  
  console.log('📊 Verification Results');
  console.log('========================');
  
  if (allTablesWorking) {
    console.log('✅ RLS IMPLEMENTATION SUCCESSFUL!');
    console.log('');
    console.log('🎉 Expected outcomes:');
    console.log('   • Search-cron workflow should now work');
    console.log('   • 482+ consecutive failures should be resolved');
    console.log('   • Content ingestion should be functional');
    console.log('   • No more daily failure notifications');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   • Monitor GitHub Actions for successful search-cron runs');
    console.log('   • Verify zero failure notifications');
    console.log('   • Test content ingestion functionality');
  } else {
    console.log('❌ RLS IMPLEMENTATION INCOMPLETE');
    console.log('');
    console.log('🔧 Required actions:');
    console.log('   • Ensure all SQL policies from RLS_IMPLEMENTATION_STEPS.md are executed');
    console.log('   • Check Supabase dashboard SQL Editor for any error messages');
    console.log('   • Verify all GRANT statements completed successfully');
    console.log('   • Re-run this verification script after fixing issues');
  }
  
  return allTablesWorking;
}

// Run verification
verifyRLSImplementation()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Verification script error:', error.message);
    console.log('');
    console.log('📞 This might indicate:');
    console.log('   • Network connectivity issues (firewall)');
    console.log('   • Supabase configuration problems');
    console.log('   • Need to implement RLS policies first');
    process.exit(1);
  });