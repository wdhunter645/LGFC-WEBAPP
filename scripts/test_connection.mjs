#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Supabase JWT Connection Test ===');
console.log('Time:', new Date().toISOString());
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');

if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

// Create JWT-compatible client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testJWTConnection() {
  console.log('\n1. Testing JWT authentication...');
  
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

async function testDatabaseAccess() {
  console.log('\n2. Testing database access with JWT...');
  
  try {
    // Test database query with JWT authentication
    const { data, error } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Database access failed:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
      
      // Check if it's an auth error
      if (error.message.includes('Invalid API key')) {
        console.log('\n🔍 This suggests the anon key is incorrect for this project.');
        console.log('   JWT authentication works, but API calls need correct anon key.');
      }
      
      return false;
    } else {
      console.log('✅ Database access successful!');
      console.log('   Data:', data);
      return true;
    }
  } catch (err) {
    console.error('❌ Database access error:', err.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n3. Testing health check...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY || ''}`
      }
    });
    
    console.log('   Status:', response.status);
    console.log('   Status text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
    }
  } catch (err) {
    console.error('❌ Health check error:', err.message);
  }
}

async function testJWTSession() {
  console.log('\n4. Testing JWT session management...');
  
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
    console.error('❌ JWT session test error:', err.message);
  }
}

async function main() {
  console.log('Starting JWT connection tests...\n');
  
  const jwtAuth = await testJWTConnection();
  const dbAccess = await testDatabaseAccess();
  await testHealthCheck();
  await testJWTSession();
  
  console.log('\n=== JWT Test Results ===');
  console.log('JWT Authentication:', jwtAuth ? '✅ PASS' : '❌ FAIL');
  console.log('Database Access:', dbAccess ? '✅ PASS' : '❌ FAIL');
  
  if (jwtAuth && dbAccess) {
    console.log('\n🎉 All JWT tests passed!');
    console.log('   Supabase is fully JWT compatible.');
  } else if (jwtAuth && !dbAccess) {
    console.log('\n⚠️  JWT authentication works, but database access needs correct anon key.');
    console.log('   Update your anon key to fix database access.');
  } else {
    console.log('\n❌ JWT tests failed.');
    console.log('   Check your Supabase configuration.');
  }
}

main().catch(err => {
  console.error('❌ JWT test failed:', err);
  process.exit(1);
});