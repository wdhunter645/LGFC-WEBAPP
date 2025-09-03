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

const rlsPolicies = `
-- Enable RLS on all tables
ALTER TABLE search_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON search_state;
DROP POLICY IF EXISTS "Allow public write access" ON search_state;
DROP POLICY IF EXISTS "Allow public read access" ON content_items;
DROP POLICY IF EXISTS "Allow public write access" ON content_items;
DROP POLICY IF EXISTS "Allow public update access" ON content_items;
DROP POLICY IF EXISTS "Allow public read access" ON media_files;
DROP POLICY IF EXISTS "Allow public write access" ON media_files;
DROP POLICY IF EXISTS "Allow public read access" ON search_sessions;
DROP POLICY IF EXISTS "Allow public write access" ON search_sessions;

-- search_state table policies
CREATE POLICY "Allow public read access" ON search_state
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON search_state
    FOR ALL USING (true);

-- content_items table policies
CREATE POLICY "Allow public read access" ON content_items
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON content_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON content_items
    FOR UPDATE USING (true);

-- media_files table policies
CREATE POLICY "Allow public read access" ON media_files
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON media_files
    FOR INSERT WITH CHECK (true);

-- search_sessions table policies
CREATE POLICY "Allow public read access" ON search_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON search_sessions
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions to authenticated and anon roles
GRANT ALL ON search_state TO anon, authenticated;
GRANT ALL ON content_items TO anon, authenticated;
GRANT ALL ON media_files TO anon, authenticated;
GRANT ALL ON search_sessions TO anon, authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
`;

async function applyRLSPolicies() {
  console.log('🔐 Applying RLS Policies for Search Cron Scripts...');
  
  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('search_state')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      return;
    }
    
    console.log('✅ Connection test successful');
    
    // Note: Direct SQL execution through REST API is limited
    // We'll need to apply these policies through Supabase Dashboard or CLI
    console.log('📋 RLS Policies to apply:');
    console.log('=====================================');
    console.log(rlsPolicies);
    console.log('=====================================');
    console.log('');
    console.log('⚠️  These policies need to be applied through:');
    console.log('   1. Supabase Dashboard → SQL Editor');
    console.log('   2. Or Supabase CLI with service role key');
    console.log('');
    console.log('🔧 Alternative: Apply policies manually in Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error.message);
  }
}

applyRLSPolicies().catch(console.error);