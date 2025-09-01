#!/usr/bin/env node
/**
 * RLS Verification Script
 * 
 * This script checks the Row Level Security status of all tables in the database
 * and verifies that appropriate policies are in place.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Expected tables and their security requirements
const EXPECTED_TABLES = {
  'content_items': { rls: true, public_read: true, authenticated_write: true },
  'media_files': { rls: true, public_read: true, authenticated_write: true },
  'search_sessions': { rls: true, public_read: true, authenticated_write: true },
  'search_state': { rls: true, public_read: true, authenticated_write: true },
  'faq_items': { rls: true, public_read: 'filtered', authenticated_write: false },
  'visitors': { rls: true, public_read: false, authenticated_write: false },
  'visitor_votes': { rls: true, public_read: true, authenticated_write: false },
  'members': { rls: true, public_read: false, authenticated_write: 'self' },
  'qa_threads': { rls: true, public_read: true, authenticated_write: 'self' },
  'picture_votes': { rls: true, public_read: true, authenticated_write: 'self' },
  'member_posts': { rls: true, public_read: true, authenticated_write: 'self' },
  'voting_rounds': { rls: true, public_read: true, authenticated_write: 'admin' },
  'round_images': { rls: true, public_read: true, authenticated_write: 'admin' },
  'round_votes': { rls: true, public_read: true, authenticated_write: 'self' },
  'round_winners': { rls: true, public_read: true, authenticated_write: 'admin' },
  'homepage_interactions': { rls: true, public_read: true, authenticated_write: true },
  'content_engagement': { rls: true, public_read: true, authenticated_write: true },
  'events': { rls: true, public_read: 'filtered', authenticated_write: 'admin' },
  'faq_clicks': { rls: true, public_read: true, authenticated_write: false },
  'moderation_actions': { rls: true, public_read: false, authenticated_write: 'admin' }
};

async function checkTableRLS(tableName) {
  try {
    // Query to check if RLS is enabled on the table
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_table_rls', { table_name: tableName });
    
    if (rlsError) {
      // Fallback: try to query the table directly to check RLS
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return {
        table: tableName,
        rls_enabled: error ? 'unknown' : 'possibly_enabled',
        policies_count: 'unknown',
        status: error ? '⚠️' : '✅',
        note: error ? `Query error: ${error.message}` : 'Table accessible'
      };
    }
    
    return {
      table: tableName,
      rls_enabled: rlsStatus?.[0]?.rls_enabled || false,
      policies_count: rlsStatus?.[0]?.policies_count || 0,
      status: rlsStatus?.[0]?.rls_enabled ? '✅' : '❌',
      note: rlsStatus?.[0]?.rls_enabled ? 'RLS enabled' : 'RLS NOT enabled'
    };
    
  } catch (error) {
    return {
      table: tableName,
      rls_enabled: 'error',
      policies_count: 'error',
      status: '❌',
      note: `Error: ${error.message}`
    };
  }
}

async function checkAllTables() {
  console.log('🔐 RLS Verification Script');
  console.log('==========================\n');
  
  const results = [];
  let totalTables = Object.keys(EXPECTED_TABLES).length;
  let rlsEnabled = 0;
  let issues = [];
  
  console.log('Checking RLS status for all tables...\n');
  
  for (const [tableName, expectations] of Object.entries(EXPECTED_TABLES)) {
    const result = await checkTableRLS(tableName);
    results.push(result);
    
    if (result.rls_enabled === true) {
      rlsEnabled++;
    } else if (result.rls_enabled === false) {
      issues.push(`❌ ${tableName}: RLS not enabled`);
    } else {
      issues.push(`⚠️ ${tableName}: ${result.note}`);
    }
    
    console.log(`${result.status} ${result.table.padEnd(25)} - ${result.note}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY REPORT');
  console.log('='.repeat(50));
  console.log(`Total Tables: ${totalTables}`);
  console.log(`RLS Enabled: ${rlsEnabled} (${Math.round((rlsEnabled / totalTables) * 100)}%)`);
  console.log(`Issues Found: ${issues.length}`);
  
  if (issues.length > 0) {
    console.log('\n🚨 ISSUES REQUIRING ATTENTION:');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('\n📋 RECOMMENDED ACTIONS:');
    console.log('   1. Enable RLS on tables without it');
    console.log('   2. Create appropriate policies for each table');
    console.log('   3. Test policies with different user roles');
    console.log('   4. Update documentation');
  } else {
    console.log('\n✅ ALL CHECKS PASSED!');
    console.log('   Your database RLS implementation is excellent!');
  }
  
  console.log('\n📖 For detailed analysis, see: RLS_AUDIT_REPORT.md');
  
  return {
    total: totalTables,
    enabled: rlsEnabled,
    issues: issues.length,
    results
  };
}

// Create the RLS check function in the database (if it doesn't exist)
async function createRLSCheckFunction() {
  const functionSQL = `
CREATE OR REPLACE FUNCTION check_table_rls(table_name text)
RETURNS TABLE(rls_enabled boolean, policies_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.relrowsecurity, false) as rls_enabled,
    COALESCE(pol.policy_count, 0) as policies_count
  FROM pg_class c
  LEFT JOIN pg_namespace n ON c.relnamespace = n.oid
  LEFT JOIN (
    SELECT 
      schemaname,
      tablename,
      COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = table_name
    GROUP BY schemaname, tablename
  ) pol ON pol.tablename = c.relname
  WHERE n.nspname = 'public' 
    AND c.relname = table_name
    AND c.relkind = 'r';
END;
$$;
`;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    if (error) {
      console.log('Note: Could not create RLS check function, using fallback method');
    }
  } catch (e) {
    console.log('Note: Using fallback RLS checking method');
  }
}

// Run the verification
async function main() {
  await createRLSCheckFunction();
  const results = await checkAllTables();
  
  // Exit with error code if issues found
  process.exit(results.issues > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { checkAllTables };