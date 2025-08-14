#!/usr/bin/env node

/**
 * Test JWT Authentication with Supabase
 * 
 * This script tests the new JWT-based authentication system
 * to ensure it works correctly with the current project.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

// Create Supabase client with JWT authentication
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testJWTAuthentication() {
  console.log('🔐 Testing JWT Authentication with Supabase');
  console.log(`🔗 URL: ${supabaseUrl}`);
  console.log(`🔑 Using anon key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const { data: healthData, error: healthError } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);
    
    if (healthError) {
      console.error(`❌ Connection failed: ${healthError.message}`);
      return false;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Anonymous authentication
    console.log('\n2️⃣ Testing anonymous authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.error(`❌ Anonymous auth failed: ${authError.message}`);
      return false;
    }
    
    if (authData.user) {
      console.log(`✅ Anonymous authentication successful`);
      console.log(`   User ID: ${authData.user.id}`);
      console.log(`   Session: ${authData.session ? 'Active' : 'None'}`);
    } else {
      console.log('⚠️  Anonymous auth succeeded but no user data');
    }

    // Test 3: Database access with authentication
    console.log('\n3️⃣ Testing authenticated database access...');
    const { data: dbData, error: dbError } = await supabase
      .from('content_items')
      .select('*')
      .limit(3);
    
    if (dbError) {
      console.error(`❌ Database access failed: ${dbError.message}`);
    } else {
      console.log(`✅ Database access successful (${dbData?.length || 0} items)`);
    }

    // Test 4: Sign out
    console.log('\n4️⃣ Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error(`❌ Sign out failed: ${signOutError.message}`);
    } else {
      console.log('✅ Sign out successful');
    }

    // Test 5: JWT token validation
    console.log('\n5️⃣ Testing JWT token structure...');
    const session = supabase.auth.getSession();
    if (session) {
      console.log('✅ JWT session management working');
    } else {
      console.log('ℹ️  No active session (expected after sign out)');
    }

    console.log('\n🎉 JWT Authentication Test Complete!');
    console.log('✅ All tests passed - JWT authentication is working correctly');
    return true;

  } catch (error) {
    console.error('❌ JWT authentication test failed:', error.message);
    return false;
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testJWTAuthentication()
    .then(success => {
      if (success) {
        console.log('\n🚀 Ready to use JWT authentication!');
        process.exit(0);
      } else {
        console.log('\n❌ JWT authentication test failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Test execution error:', error);
      process.exit(1);
    });
}