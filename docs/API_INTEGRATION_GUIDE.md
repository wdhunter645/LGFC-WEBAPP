# 🔗 API Documentation & Integration Guide - Lou Gehrig Fan Club

## 📊 **API Endpoints Overview**

### **Netlify Functions** (`/.netlify/functions/`)

#### **System Health & Monitoring**

##### `GET /api/health-check`
**Purpose**: Monitor system health and connectivity
**Authentication**: None (public endpoint)
**Response**: JSON health status
```json
{
  "status": "healthy",
  "timestamp": "2024-09-02T12:53:19.000Z",
  "supabase": {
    "connected": true,
    "latency": "45ms"
  },
  "services": {
    "database": "operational",
    "functions": "operational",
    "cms": "operational"
  }
}
```

##### `GET /api/test-supabase`
**Purpose**: Test Supabase database connectivity
**Authentication**: Environment variables
**Response**: Connection status and query results
```json
{
  "connected": true,
  "url": "https://vkwhrbjkdznncjkzkiuo.supabase.co",
  "timestamp": "2024-09-02T12:53:19.000Z",
  "test_query": "SELECT 1 as test",
  "result": [{"test": 1}]
}
```

#### **Content & Search**

##### `POST /api/supabase/{path}`
**Purpose**: Proxy requests to Supabase REST API
**Authentication**: API key in headers
**Headers**:
```
Content-Type: application/json
apikey: sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
Authorization: Bearer sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
```
**Usage**: Forward any Supabase REST API call through Netlify

##### `POST /api/faq-click`
**Purpose**: Track FAQ interaction and engagement
**Authentication**: Service role key required
**Payload**:
```json
{
  "question_id": "string",
  "user_id": "string|null",
  "session_id": "string",
  "timestamp": "ISO8601"
}
```
**Response**: Success confirmation

##### `POST /api/answer-faq`
**Purpose**: Automated FAQ response system
**Authentication**: Service role key required
**Payload**:
```json
{
  "question": "string",
  "user_email": "string|null",
  "context": "object|null"
}
```
**Response**: Automated answer or escalation notice

### **Supabase REST API** (`https://vkwhrbjkdznncjkzkiuo.supabase.co/rest/v1/`)

#### **Content Tables**

##### `content_items` Table
**Purpose**: Main content storage (articles, news, posts)
**RLS**: Public read, authenticated write
**Columns**:
- `id` (uuid, primary key)
- `title` (text, required)
- `content` (text)
- `content_type` (text: 'news', 'article', 'post')
- `author` (text)
- `published_at` (timestamp)
- `source_url` (text)
- `content_hash` (text, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)

##### `media_files` Table  
**Purpose**: Media asset management
**RLS**: Public read, authenticated write
**Columns**:
- `id` (uuid, primary key)
- `filename` (text, required)
- `url` (text, required)
- `media_type` (text: 'image', 'video', 'document')
- `size` (bigint)
- `mime_type` (text)
- `alt_text` (text)
- `caption` (text)
- `created_at` (timestamp)

##### `user_votes` Table
**Purpose**: User engagement and voting
**RLS**: User can read/write own votes
**Columns**:
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `content_id` (uuid, foreign key to content_items)
- `vote_type` (text: 'up', 'down', 'favorite')
- `created_at` (timestamp)

#### **System Tables**

##### `search_sessions` Table
**Purpose**: Search query tracking and analytics
**RLS**: System access only
**Columns**:
- `id` (uuid, primary key)
- `query` (text)
- `results_count` (integer)
- `user_id` (uuid, nullable)
- `session_id` (text)
- `created_at` (timestamp)

##### `search_state` Table
**Purpose**: Content ingestion automation state
**RLS**: System access only  
**Columns**:
- `id` (uuid, primary key)
- `last_run_at` (timestamp)
- `status` (text: 'running', 'completed', 'failed')
- `sources_processed` (jsonb)
- `items_found` (integer)
- `errors` (jsonb)

### **Supabase Edge Functions** (`https://vkwhrbjkdznncjkzkiuo.supabase.co/functions/v1/`)

#### **Content Ingestion**

##### `POST /functions/v1/search-content`
**Purpose**: Automated content discovery and ingestion
**Authentication**: Service role key required
**Payload**:
```json
{
  "query": "Lou Gehrig",
  "sources": ["gdelt", "nyt", "rss", "wikipedia"],
  "limit": 50,
  "since": "ISO8601 timestamp"
}
```
**Response**: Ingestion results and statistics

##### `POST /functions/v1/process-content`
**Purpose**: Content processing and enhancement  
**Authentication**: Service role key required
**Payload**:
```json
{
  "content_id": "uuid",
  "operations": ["extract_entities", "categorize", "generate_summary"]
}
```
**Response**: Processing results

## 🔐 **Authentication & Authorization**

### **API Key Types**

#### **Public API Key (Frontend)**
- **Key**: `sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs`
- **Usage**: Client-side applications, public data access
- **Permissions**: Read public data, write authenticated user data
- **Security**: Safe to expose in frontend code

#### **Service Role Key (Backend)**
- **Key**: Stored in environment variables (placeholder in config)
- **Usage**: Server-side operations, administrative tasks
- **Permissions**: Full database access, bypass RLS
- **Security**: Must be kept secret, server-side only

### **Authentication Methods**

#### **JWT Authentication**
```javascript
// Client creation with JWT
const client = createJWTClient()
await client.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

#### **Anonymous Access**
```javascript
// Public client for read-only operations
const client = createClient()
const { data } = await client
  .from('content_items')
  .select('*')
  .eq('published', true)
```

### **Row Level Security (RLS) Policies**

#### **Public Content Policy**
```sql
-- Allow public read access to published content
CREATE POLICY "Public content read" ON content_items
  FOR SELECT USING (published = true);
```

#### **User Content Policy**
```sql
-- Users can read/write their own data
CREATE POLICY "User data access" ON user_votes
  FOR ALL USING (auth.uid() = user_id);
```

#### **Admin Access Policy**
```sql
-- Admins have full access
CREATE POLICY "Admin full access" ON content_items
  FOR ALL USING (auth.jwt()->>'role' = 'admin');
```

## 🌐 **External API Integrations**

### **Content Sources**

#### **MLB RSS Feeds**
- **URL**: `https://www.mlb.com/feeds/news/rss.xml`
- **Yankees Feed**: `https://www.mlb.com/yankees/feeds/news/rss.xml`
- **Frequency**: Hourly checks via GitHub Actions
- **Processing**: Parse XML, extract relevant articles

#### **New York Times Archive API**
- **Endpoint**: `https://api.nytimes.com/svc/archive/v1/`
- **Authentication**: API key required (`NYT_API_KEY`)
- **Rate Limits**: 1000 requests/day
- **Usage**: Historical article search

#### **GDELT Project**
- **Endpoint**: `https://api.gdeltproject.org/api/v2/doc/doc`
- **Authentication**: None (public API)
- **Rate Limits**: 10 requests/minute
- **Usage**: Global news monitoring

#### **Internet Archive**
- **Endpoint**: `https://archive.org/advancedsearch.php`
- **Authentication**: None (public API)
- **Rate Limits**: Respectful usage
- **Usage**: Historical document discovery

### **Service Integrations**

#### **SendGrid Email API**
- **Endpoint**: `https://api.sendgrid.com/v3/mail/send`
- **Authentication**: API key (`SENDGRID_API_KEY`)
- **Usage**: FAQ responses, notifications
- **Configuration**:
```javascript
{
  from: 'noreply@lougehrigfanclub.com',
  template_id: 'faq-response-template',
  personalizations: [...]
}
```

#### **Backblaze B2 Storage**
- **Endpoint**: `https://api.backblazeb2.com/`
- **Authentication**: Application key and ID
- **Usage**: File storage and backup
- **Configuration**: Bucket-based organization

## 📡 **Real-time Features**

### **Supabase Realtime**
```javascript
// Subscribe to content updates
client
  .channel('content_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'content_items' },
    handleContentUpdate
  )
  .subscribe()
```

### **Live Search**
```javascript
// Real-time search results
const searchChannel = client
  .channel('search_results')
  .on('broadcast', { event: 'search_update' }, handleSearchUpdate)
  .subscribe()
```

## 🔧 **Environment Configuration**

### **Required Environment Variables**

#### **Supabase Configuration**
```bash
SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
SUPABASE_PUBLIC_API_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
SUPABASE_SERVICE_ROLE_KEY=sb_service_role_key_placeholder_for_faq_clicks

# Multiple naming conventions for compatibility
PUBLIC_SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
VITE_SUPABASE_URL=https://vkwhrbjkdznncjkzkiuo.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Ujfa9-Q184jwhMXRHt3NFQ_DGXvAcDs
```

#### **Email Configuration**
```bash
SENDGRID_API_KEY=sendgrid_api_key_placeholder
SENDGRID_FROM=noreply@lougehrigfanclub.com
```

#### **External APIs**
```bash
NYT_API_KEY=your_nyt_api_key_here
RSS_FEEDS=https://www.mlb.com/feeds/news/rss.xml,https://www.mlb.com/yankees/feeds/news/rss.xml
```

#### **Storage Configuration**
```bash
B2_APPLICATION_KEY_ID=your_b2_key_id_here
B2_APPLICATION_KEY=your_b2_application_key_here
```

## 📊 **API Usage Examples**

### **Content Retrieval**
```javascript
// Get recent articles
const { data: articles } = await client
  .from('content_items')
  .select(`
    id,
    title,
    content,
    author,
    published_at,
    media_files(url, alt_text)
  `)
  .eq('content_type', 'article')
  .order('published_at', { ascending: false })
  .limit(10)
```

### **User Interaction**
```javascript
// Record user vote
const { data } = await client
  .from('user_votes')
  .insert({
    content_id: articleId,
    vote_type: 'favorite',
    user_id: userId
  })
```

### **Search Operations**
```javascript
// Full-text search
const { data: results } = await client
  .from('content_items')
  .select('*')
  .textSearch('title', query, {
    type: 'websearch',
    config: 'english'
  })
```

## 🛡️ **Security Best Practices**

### **API Security**
- **Always validate input** - Prevent injection attacks
- **Use appropriate auth** - Public vs service keys
- **Implement rate limiting** - Prevent abuse
- **Log API usage** - Monitor for anomalies

### **Data Protection**
- **Encrypt sensitive data** - PII and credentials
- **Implement CORS properly** - Control origin access
- **Use HTTPS everywhere** - Secure data transmission
- **Regular security audits** - Automated scanning

### **Error Handling**
- **Don't expose internal errors** - Generic error messages
- **Log detailed errors server-side** - For debugging
- **Implement circuit breakers** - Prevent cascade failures
- **Graceful degradation** - Fallback mechanisms

---

**This API documentation provides ChatGPT Codex with complete knowledge of all endpoints, authentication methods, and integration patterns for the Lou Gehrig Fan Club application.**