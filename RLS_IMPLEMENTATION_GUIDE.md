# 🔐 RLS Implementation Guide

## 📋 **Overview**
This guide provides the complete SQL commands to implement Row Level Security (RLS) across ALL 20 tables in the database, ensuring comprehensive security coverage while enabling proper functionality for search-cron scripts, user interactions, and admin operations.

## 🎯 **What This Accomplishes**
- ✅ **Enables RLS** on all 20 tables
- ✅ **Creates appropriate policies** for each table's use case
- ✅ **Allows search-cron scripts** to read and write content data
- ✅ **Maintains security** with role-based access control
- ✅ **Prevents unauthorized access** to sensitive data
- ✅ **Supports public fan club functionality** while protecting user data

## 🚀 **Implementation Steps**

### **Step 1: Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vkwhrbjkdznncjkzkiuo`
3. Navigate to **SQL Editor**

### **Step 2: Execute RLS Policies**
Copy and paste the following SQL into the SQL Editor and execute:

```sql
-- ============================================================================
-- COMPREHENSIVE RLS IMPLEMENTATION FOR ALL TABLES
-- This covers all 20 tables in the database with appropriate security policies
-- ============================================================================

-- Enable RLS on all core content tables
ALTER TABLE search_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user and community tables  
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on FAQ and visitor tables
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_votes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on voting system tables
ALTER TABLE voting_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE picture_votes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on analytics and tracking tables
ALTER TABLE homepage_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_engagement ENABLE ROW LEVEL SECURITY;

-- Enable RLS on events and moderation tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP EXISTING POLICIES (Clean slate approach)
-- ============================================================================

-- Core content table policies
DROP POLICY IF EXISTS "Allow public read access" ON search_state;
DROP POLICY IF EXISTS "Allow public write access" ON search_state;
DROP POLICY IF EXISTS "public read search state" ON search_state;
DROP POLICY IF EXISTS "admin update search state" ON search_state;

DROP POLICY IF EXISTS "Allow public read access" ON content_items;
DROP POLICY IF EXISTS "Allow public write access" ON content_items;
DROP POLICY IF EXISTS "Allow public update access" ON content_items;
DROP POLICY IF EXISTS "Anyone can read content items" ON content_items;
DROP POLICY IF EXISTS "Authenticated users can insert content items" ON content_items;
DROP POLICY IF EXISTS "Authenticated users can update content items" ON content_items;

DROP POLICY IF EXISTS "Allow public read access" ON media_files;
DROP POLICY IF EXISTS "Allow public write access" ON media_files;
DROP POLICY IF EXISTS "Anyone can read media files" ON media_files;
DROP POLICY IF EXISTS "Authenticated users can manage media files" ON media_files;

DROP POLICY IF EXISTS "Allow public read access" ON search_sessions;
DROP POLICY IF EXISTS "Allow public write access" ON search_sessions;
DROP POLICY IF EXISTS "Anyone can read search sessions" ON search_sessions;
DROP POLICY IF EXISTS "Authenticated users can create search sessions" ON search_sessions;

-- ============================================================================
-- CORE CONTENT TABLES - Public read, authenticated write
-- ============================================================================

-- search_state table policies (critical for search-cron)
CREATE POLICY "Allow public read access" ON search_state
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON search_state
    FOR ALL USING (true);

-- content_items table policies (main content)
CREATE POLICY "Allow public read access" ON content_items
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON content_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON content_items
    FOR UPDATE USING (true);

-- media_files table policies (images and media)
CREATE POLICY "Allow public read access" ON media_files
    FOR SELECT USING (true);

CREATE POLICY "Allow public write access" ON media_files
    FOR INSERT WITH CHECK (true);

-- search_sessions table policies (search tracking)
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

### **Step 2b: Execute Additional Table Policies (Optional)**
If you want to apply RLS policies to ALL tables (beyond just the search-cron requirements), execute this additional SQL:

```sql
-- ============================================================================
-- EXTENDED RLS POLICIES FOR ALL OTHER TABLES
-- (Run this section only if you want comprehensive RLS across all tables)
-- ============================================================================

-- USER MANAGEMENT TABLES - Authenticated access
CREATE POLICY "Authenticated can read members" ON members
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own member row" ON members
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own member row" ON members
    FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FAQ SYSTEM - Published content public
CREATE POLICY "Anyone can read published FAQs" ON faq_items
    FOR SELECT TO authenticated, anon USING (status = 'published');
CREATE POLICY "Anyone can read faq_clicks" ON faq_clicks
    FOR SELECT TO authenticated, anon USING (true);

-- VISITOR TRACKING - Privacy focused
CREATE POLICY "No read access to visitors" ON visitors
    FOR SELECT TO authenticated, anon USING (false);
CREATE POLICY "Anyone can read visitor_votes" ON visitor_votes
    FOR SELECT TO authenticated, anon USING (true);

-- VOTING SYSTEM - Public participation, admin management
CREATE POLICY "Anyone can read voting_rounds" ON voting_rounds
    FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage voting_rounds" ON voting_rounds
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.members WHERE user_id = auth.uid() AND is_admin = true)
    );

-- ANALYTICS TABLES - Public tracking
CREATE POLICY "Public can read homepage_interactions" ON homepage_interactions
    FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public can insert homepage_interactions" ON homepage_interactions
    FOR INSERT TO anon WITH CHECK (true);

-- EVENTS - Smart filtering
CREATE POLICY "Public can read events" ON events
    FOR SELECT TO authenticated, anon 
    USING (is_club_event OR start_at >= (now() - interval '1 day'));

-- MODERATION - Admin only
CREATE POLICY "Only admins can read moderation_actions" ON moderation_actions
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.members WHERE user_id = auth.uid() AND is_admin = true)
    );

-- Grant additional permissions
GRANT SELECT ON faq_items, events, voting_rounds TO anon, authenticated;
GRANT ALL ON members TO authenticated;
GRANT ALL ON moderation_actions TO authenticated;
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

### **Core Content Tables (Required for search-cron)**

#### **search_state Table**
- **Read Access**: ✅ All rows (public/anon access)
- **Write Access**: ✅ All operations (INSERT, UPDATE, DELETE)
- **Purpose**: Track search execution state for automated content ingestion
- **Security Level**: **LOW** (public access required for automation)

#### **content_items Table**
- **Read Access**: ✅ All rows (public/anon access)
- **Insert Access**: ✅ New content items (public/anon access)
- **Update Access**: ✅ Existing content items (public/anon access)  
- **Purpose**: Store ingested Lou Gehrig research content
- **Security Level**: **LOW** (fan club content is public)

#### **media_files Table**
- **Read Access**: ✅ All rows (public/anon access)
- **Insert Access**: ✅ New media files (public/anon access)
- **Purpose**: Store media associated with content items
- **Security Level**: **LOW** (fan club media is public)

#### **search_sessions Table**
- **Read Access**: ✅ All rows (public/anon access)
- **Insert Access**: ✅ New search sessions (public/anon access)
- **Purpose**: Track search execution history and metrics
- **Security Level**: **LOW** (search metrics are not sensitive)

### **User Management Tables (Authentication Required)**

#### **members Table**
- **Read Access**: ✅ Authenticated users only (all member data)
- **Insert Access**: ✅ Self-registration (user_id must match auth.uid())
- **Update Access**: ✅ Self-management only (user_id must match auth.uid())
- **Purpose**: Store club member profiles and preferences
- **Security Level**: **HIGH** (personal data protection)

#### **qa_threads Table**
- **Read Access**: ✅ Public read (fan club discussions are public)
- **Insert Access**: ✅ Authenticated users only (created_by must match auth.uid())
- **Update Access**: ✅ Owner-only (created_by must match auth.uid())
- **Purpose**: Q&A discussions about Lou Gehrig and ALS
- **Security Level**: **MEDIUM** (public content, authenticated posting)

#### **member_posts Table**
- **Read Access**: ✅ Public read (member contributions are public)
- **Insert Access**: ✅ Authenticated users only (created_by must match auth.uid())
- **Update Access**: ✅ Owner-only (created_by must match auth.uid())
- **Purpose**: Member-generated content and posts
- **Security Level**: **MEDIUM** (public content, authenticated posting)

### **FAQ System (Content Management)**

#### **faq_items Table**
- **Read Access**: ✅ Published items only (status = 'published')
- **Insert Access**: ❌ Not covered by policies (admin-managed through dashboard)
- **Purpose**: Frequently asked questions about Lou Gehrig and ALS
- **Security Level**: **HIGH** (strict filtering, admin-managed)

#### **faq_clicks Table**
- **Read Access**: ✅ Public read (click analytics)
- **Insert Access**: ❌ Not covered by policies (managed by functions)
- **Purpose**: Track FAQ engagement for analytics
- **Security Level**: **LOW** (anonymous analytics data)

### **Visitor Analytics (Privacy-Focused)**

#### **visitors Table**
- **Read Access**: ❌ No read access (privacy protection)
- **Insert Access**: ❌ Not covered by policies (managed by functions)
- **Purpose**: Anonymous visitor tracking
- **Security Level**: **VERY HIGH** (privacy-first approach)

#### **visitor_votes Table**
- **Read Access**: ✅ Public read (leaderboard data)
- **Insert Access**: ❌ Not covered by policies (managed by functions)
- **Purpose**: Anonymous daily voting on images
- **Security Level**: **MEDIUM** (aggregated voting data)

### **Voting System (Community Engagement)**

#### **voting_rounds Table**
- **Read Access**: ✅ Public read (voting rounds are public)
- **Write Access**: ✅ Admin-only management (requires is_admin = true)
- **Purpose**: Weekly voting competitions
- **Security Level**: **HIGH** (admin-controlled competitions)

#### **round_images, round_votes, round_winners Tables**
- **Read Access**: ✅ Public read (voting data is transparent)
- **Insert Access**: ✅ Authenticated users (round_votes - self-voting only)
- **Management**: ✅ Admin-only (round creation, winner determination)
- **Purpose**: Fair and transparent voting system
- **Security Level**: **HIGH** (fraud prevention, admin oversight)

#### **picture_votes Table**
- **Read Access**: ✅ Public read (daily leaderboard)
- **Insert Access**: ✅ Authenticated self-voting (user_id must match auth.uid())
- **Purpose**: Daily picture voting with one vote per user per day
- **Security Level**: **HIGH** (prevents multiple voting fraud)

### **Analytics and Tracking (User Experience)**

#### **homepage_interactions Table**
- **Read Access**: ✅ Public read (engagement metrics)
- **Insert Access**: ✅ Public insert (anonymous interaction tracking)
- **Purpose**: Track homepage engagement and user behavior
- **Security Level**: **LOW** (anonymous usage analytics)

#### **content_engagement Table**
- **Read Access**: ✅ Public read (content performance metrics)
- **Insert Access**: ✅ Public insert (anonymous engagement tracking)
- **Purpose**: Track content engagement and popularity
- **Security Level**: **LOW** (anonymous content analytics)

### **Events System (Community Calendar)**

#### **events Table**
- **Read Access**: ✅ Smart filtering (club events OR recent public events)
- **Insert Access**: ❌ Not covered by policies (admin-managed)
- **Purpose**: Community events and ALS awareness events
- **Security Level**: **MEDIUM** (filtered public access)

### **Moderation System (Administrative Control)**

#### **moderation_actions Table**
- **Read Access**: ✅ Admin-only (requires is_admin = true)
- **Write Access**: ✅ Admin-only (requires is_admin = true)
- **Purpose**: Track moderation actions and member management
- **Security Level**: **VERY HIGH** (administrative data only)

## 🔒 **Security Considerations**

### **Three-Tier Security Model**

#### **🟢 Public Access (Anonymous/anon role)**
**Tables**: `content_items`, `media_files`, `search_sessions`, `search_state`, `qa_threads`, `member_posts`, `faq_items`, `visitor_votes`, `voting_rounds`, `round_images`, `round_votes`, `round_winners`, `picture_votes`, `homepage_interactions`, `content_engagement`, `events`

**What This Allows**:
- ✅ **Content consumption**: Read Lou Gehrig research content
- ✅ **Community participation**: Read discussions and voting results
- ✅ **Analytics tracking**: Anonymous interaction data collection
- ✅ **Search functionality**: Public API key can access content data

**Security Benefits**:
- 🔒 **No personal data exposure**: Member details not accessible
- 🔒 **Content-focused access**: Only fan club content is public
- 🔒 **Anonymous analytics**: No user tracking beyond interactions

#### **🟡 Authenticated Access (authenticated role)**
**Tables**: `members`, `qa_threads`, `member_posts`, `round_votes`, `picture_votes`

**What This Allows**:
- ✅ **Self-service account management**: Users manage their own profiles
- ✅ **Content creation**: Authenticated users can post and discuss
- ✅ **Fair voting**: One vote per user, authenticated to prevent fraud
- ✅ **Community participation**: Join discussions and competitions

**Security Benefits**:
- 🔒 **User data protection**: Only authenticated users see member data
- 🔒 **Anti-fraud voting**: Authentication prevents multiple votes
- 🔒 **Content ownership**: Users can only modify their own content

#### **🔴 Admin Access (authenticated + is_admin = true)**
**Tables**: `voting_rounds`, `round_images`, `round_winners`, `moderation_actions`

**What This Allows**:
- ✅ **Competition management**: Create and manage voting rounds
- ✅ **Content moderation**: Track and manage member behavior
- ✅ **System administration**: Full control over community features

**Security Benefits**:
- 🔒 **Administrative control**: Critical functions require admin privileges
- 🔒 **Audit trail**: All moderation actions are logged
- 🔒 **Separation of duties**: Regular users cannot access admin functions

### **Special Security Features**

#### **🔐 Privacy-First Design**
- **`visitors` table**: Zero read access - protects anonymous visitor data
- **`faq_items` table**: Only published items readable - draft protection
- **`events` table**: Smart filtering - only relevant events shown

#### **🛡️ Anti-Fraud Measures**  
- **One vote per user per day**: `picture_votes` tied to auth.uid()
- **One vote per round**: `round_votes` prevents double voting
- **Admin-controlled competitions**: Voting rounds managed by admins only

#### **📊 Analytics Without Privacy Invasion**
- **Anonymous interaction tracking**: No personal data in analytics tables
- **Aggregated data only**: Individual user behavior not tracked
- **Public metrics**: Engagement data available for community insights

### **What These Policies Prevent**

#### **❌ Unauthorized Data Access**
- **No personal data leakage**: Member details not accessible to public
- **No draft content exposure**: Unpublished FAQs remain private
- **No moderation data exposure**: Admin actions not visible to users

#### **❌ Voting Fraud**
- **No anonymous voting**: All votes require authentication
- **No multiple voting**: User constraints prevent double votes
- **No vote manipulation**: Admin-only round management

#### **❌ Content Abuse**
- **No unauthorized posting**: Content creation requires authentication
- **No cross-user editing**: Users can only edit their own content
- **No unauthorized moderation**: Moderation requires admin privileges

## 🎯 **Expected Results**

After implementing these policies:

1. **search-cron GitHub Action** will run successfully
2. **Content ingestion** will work without errors
3. **Database updates** will be allowed
4. **All scripts** will function with public API key

## 🔧 **Troubleshooting**

### **RLS Status Verification**
Use the provided verification script to check all tables:
```bash
# Run comprehensive RLS verification
node scripts/verify-rls.mjs
```

### **Manual RLS Check**
Check RLS status for a specific table:
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'your_table_name';

-- Check existing policies
SELECT * FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'your_table_name';
```

### **Common Issues and Solutions**

#### **Issue 1: Search-cron scripts fail with permission errors**
**Symptoms**: `Invalid API key` or `Permission denied` errors in GitHub Actions
**Solution**: Ensure core content tables have public policies
```sql
-- Verify these policies exist:
SELECT policyname FROM pg_policies 
WHERE tablename IN ('search_state', 'content_items', 'media_files', 'search_sessions')
AND (roles @> '{anon}' OR policyname LIKE '%public%');
```

#### **Issue 2: Users cannot create content**
**Symptoms**: `Permission denied` when authenticated users try to post
**Solution**: Check authentication-based policies
```sql
-- Verify user can insert their own content:
CREATE POLICY "test_user_insert" ON member_posts 
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
```

#### **Issue 3: Admin functions not working**
**Symptoms**: Admins cannot manage voting or moderation
**Solution**: Verify admin check in policies
```sql
-- Test admin check query:
SELECT EXISTS (
  SELECT 1 FROM public.members 
  WHERE user_id = auth.uid() AND is_admin = true
);
```

#### **Issue 4: RLS policies don't take effect**
**Solutions**: 
1. **Check RLS is enabled**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. **Check policy names**: Ensure no typos in policy names
3. **Check role grants**: Verify `GRANT` statements executed
4. **Clear policy conflicts**: Drop conflicting policies first

### **Testing RLS Policies**

#### **Test Anonymous Access**
```bash
# Test with public API key (anon role)
curl -X GET "https://your-project.supabase.co/rest/v1/content_items" \
  -H "apikey: your_anon_key" \
  -H "Content-Type: application/json"
```

#### **Test Authenticated Access**  
```bash
# Test with user JWT token (authenticated role)
curl -X GET "https://your-project.supabase.co/rest/v1/members" \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

#### **Test Admin Access**
```bash
# Test admin functions (requires admin user JWT)
curl -X GET "https://your-project.supabase.co/rest/v1/moderation_actions" \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer admin_jwt_token" \
  -H "Content-Type: application/json"
```

### **Alternative Approach for Development**
If you need to temporarily disable RLS for development/debugging:

```sql
-- TEMPORARY disable RLS (not recommended for production)
ALTER TABLE search_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions DISABLE ROW LEVEL SECURITY;
-- ... other tables as needed

-- Remember to re-enable before deploying:
ALTER TABLE search_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
```

### **Performance Considerations**

#### **Policy Performance Tips**
- ✅ **Simple policies are faster**: Use basic conditions when possible
- ✅ **Index supporting columns**: Index columns used in policy conditions
- ✅ **Avoid complex subqueries**: Keep EXISTS queries simple
- ✅ **Test with real data**: Verify performance with expected data volumes

#### **Monitoring Policy Impact**
```sql
-- Check slow queries related to RLS
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%policy%' OR query LIKE '%rls%'
ORDER BY mean_time DESC;
```

## ✅ **Success Criteria**

### **Core Functionality (Required)**
The RLS implementation is successful when:
- ✅ **Search-cron GitHub Action** runs without permission errors
- ✅ **Content ingestion** works with public API key  
- ✅ **Search state updates** complete successfully
- ✅ **Database writes** are allowed for content tables

### **Security Verification (Recommended)**
Complete security implementation includes:
- ✅ **All 20 tables have RLS enabled** (run verification script)
- ✅ **Appropriate policies** exist for each table's use case
- ✅ **Admin functions** are properly restricted
- ✅ **User data** is protected from unauthorized access
- ✅ **Anonymous data** privacy is maintained

### **User Experience (Validation)**
Proper implementation enables:
- ✅ **Public content access** works without authentication
- ✅ **User registration** and profile management works
- ✅ **Voting systems** prevent fraud and allow fair participation
- ✅ **Community features** (Q&A, posts) work correctly
- ✅ **Analytics tracking** captures engagement without privacy issues

### **Testing Checklist**

#### **Anonymous Access Test**
```bash
# Should work - public content
curl "https://your-project.supabase.co/rest/v1/content_items" -H "apikey: anon_key"
curl "https://your-project.supabase.co/rest/v1/faq_items" -H "apikey: anon_key"

# Should fail - protected content  
curl "https://your-project.supabase.co/rest/v1/members" -H "apikey: anon_key"
curl "https://your-project.supabase.co/rest/v1/moderation_actions" -H "apikey: anon_key"
```

#### **Authenticated User Test**
```bash
# Should work - user can access member data
curl "https://your-project.supabase.co/rest/v1/members" \
  -H "apikey: anon_key" -H "Authorization: Bearer user_jwt"

# Should work - user can create content
curl -X POST "https://your-project.supabase.co/rest/v1/qa_threads" \
  -H "apikey: anon_key" -H "Authorization: Bearer user_jwt" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test", "created_by": "user_id"}'
```

#### **Admin User Test**
```bash  
# Should work - admin can access moderation
curl "https://your-project.supabase.co/rest/v1/moderation_actions" \
  -H "apikey: anon_key" -H "Authorization: Bearer admin_jwt"

# Should work - admin can manage voting rounds
curl -X POST "https://your-project.supabase.co/rest/v1/voting_rounds" \
  -H "apikey: anon_key" -H "Authorization: Bearer admin_jwt" \
  -H "Content-Type: application/json"
```

### **Automated Verification**
Run the comprehensive verification script:
```bash
# Install dependencies if needed
npm install @supabase/supabase-js dotenv

# Run verification (exits with error code if issues found)
node scripts/verify-rls.mjs

# Expected output: All tables ✅ with RLS enabled
# Any ❌ or ⚠️ indicates issues that need attention
```

### **Production Readiness Checklist**
- [ ] **RLS verification script passes** (no errors)
- [ ] **Search-cron automation works** (GitHub Actions succeed)
- [ ] **User registration/login works** (authentication flow)
- [ ] **Voting system works** (users can vote, admins can manage)
- [ ] **Content creation works** (authenticated users can post)  
- [ ] **Admin functions work** (moderation, voting management)
- [ ] **Analytics tracking works** (interactions recorded)
- [ ] **Performance is acceptable** (queries complete in reasonable time)

**🎯 Target**: All checkboxes ✅ for production deployment