-- RLS Policies for Search Cron Scripts
-- This migration enables RLS on all tables and creates policies for public API access

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