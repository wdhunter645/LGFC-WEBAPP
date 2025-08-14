#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://vkwhrbjkdznncjkzkiuo.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

console.log('=== Database Table JWT Diagnostic ===');
console.log('Time:', new Date().toISOString());
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

// Create JWT-compatible client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function authenticateWithJWT() {
  console.log('\n1. Authenticating with JWT...');
  
  try {
    // Test anonymous authentication
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
      console.log('⚠️  JWT authentication succeeded but no user data');
      return false;
    }
  } catch (err) {
    console.error('❌ JWT authentication error:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n2. Checking Required Tables with JWT:');
  
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
        
        // Check if it's an auth error
        if (error.message.includes('Invalid API key')) {
          console.log(`   🔍 JWT authentication works, but API calls need correct anon key.`);
        }
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
  console.log('\n3. Checking Search State with JWT:');
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
  console.log('\n4. Checking Content Items with JWT:');
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

async function checkJWTSession() {
  console.log('\n5. Checking JWT Session Management:');
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      console.log('✅ JWT session active');
      console.log('   User ID:', sessionData.session.user.id);
      console.log('   Expires:', new Date(sessionData.session.expires_at * 1000).toISOString());
    } else {
      console.log('ℹ️  No active JWT session');
    }
    
    // Test sign out
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✅ JWT sign out successful');
    }
    
  } catch (err) {
    console.error('❌ JWT session check error:', err.message);
  }
}

async function main() {
  console.log('Starting JWT database diagnostic...\n');
  
  const jwtAuth = await authenticateWithJWT();
  
  if (jwtAuth) {
    await checkTables();
    await checkSearchState();
    await checkContentItems();
    await checkJWTSession();
  }
  
  console.log('\n=== JWT Diagnostic Complete ===');
  console.log('\nJWT Authentication:', jwtAuth ? '✅ PASS' : '❌ FAIL');
  
  console.log('\nTroubleshooting Tips:');
  console.log('1. If JWT auth fails, check Supabase project configuration');
  console.log('2. If tables are missing, run: supabase db push');
  console.log('3. If API calls fail, update anon key for current project');
  console.log('4. If RLS issues, check policies in Supabase dashboard');
  console.log('5. If service role needed, check GitHub secrets');
}

main().catch(err => {
  console.error('❌ JWT diagnostic failed:', err);
  process.exit(1);
});