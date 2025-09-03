# 🔐 RLS Implementation Guide

## 📋 **Overview**
This guide provides the complete SQL commands to implement Row Level Security (RLS) across all tables in the database, enabling the search-cron scripts to work with the public API key.

## 🎯 **What This Accomplishes**
- ✅ **Enables RLS** on all tables
- ✅ **Creates policies** for public API access
- ✅ **Allows search-cron scripts** to read and write data
- ✅ **Maintains security** while enabling functionality

## 🚀 **Implementation Steps**

### **Step 1: Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vkwhrbjkdznncjkzkiuo`
3. Navigate to **SQL Editor**

### **Step 2: Execute RLS Policies**
Copy and paste the following SQL into the SQL Editor and execute:

```sql
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
```

### **Step 3: Verify Implementation**
After executing the SQL, test the search-cron scripts:

```bash
# Test check_migrations script
SUPABASE_PUBLIC_API_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs node scripts/check_migrations.mjs

# Test ingest script
SUPABASE_PUBLIC_API_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs RSS_FEEDS="https://feeds.feedburner.com/nytimes/health" NYT_API_KEY=test-key node scripts/ingest.mjs "Lou Gehrig" 1
```

## 📊 **Policy Details**

### **search_state Table**
- **Read Access**: ✅ All rows
- **Write Access**: ✅ All operations (INSERT, UPDATE, DELETE)
- **Purpose**: Track search execution state

### **content_items Table**
- **Read Access**: ✅ All rows
- **Insert Access**: ✅ New content items
- **Update Access**: ✅ Existing content items
- **Purpose**: Store ingested content

### **media_files Table**
- **Read Access**: ✅ All rows
- **Insert Access**: ✅ New media files
- **Purpose**: Store media associated with content

### **search_sessions Table**
- **Read Access**: ✅ All rows
- **Insert Access**: ✅ New search sessions
- **Purpose**: Track search execution history

## 🔒 **Security Considerations**

### **What These Policies Allow**
- ✅ **Public API key** can read all data
- ✅ **Public API key** can insert new content
- ✅ **Public API key** can update search state
- ✅ **Search-cron scripts** can function normally

### **What These Policies Prevent**
- ❌ **No user-specific data** (all data is public)
- ❌ **No authentication required** (uses public API key)
- ❌ **No row-level filtering** (all rows accessible)

## 🎯 **Expected Results**

After implementing these policies:

1. **search-cron GitHub Action** will run successfully
2. **Content ingestion** will work without errors
3. **Database updates** will be allowed
4. **All scripts** will function with public API key

## 🔧 **Troubleshooting**

### **If Policies Don't Work**
1. **Check RLS is enabled**: Verify each table has RLS enabled
2. **Check policy names**: Ensure policy names match exactly
3. **Check permissions**: Verify GRANT statements executed
4. **Test with curl**: Use direct API calls to test access

### **Alternative Approach**
If the above doesn't work, you can temporarily disable RLS:

```sql
-- Temporary disable RLS (not recommended for production)
ALTER TABLE search_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions DISABLE ROW LEVEL SECURITY;
```

## ✅ **Success Criteria**

The RLS implementation is successful when:
- ✅ All search-cron scripts run without errors
- ✅ Content can be inserted into all tables
- ✅ Search state can be updated
- ✅ GitHub Actions workflow completes successfully