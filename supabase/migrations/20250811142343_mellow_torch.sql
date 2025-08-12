/*
  # Lou Gehrig Research Database Schema

  1. New Tables
    - `content_items`
      - `id` (uuid, primary key)
      - `title` (text, content title)
      - `content_text` (text, main content body)
      - `source_url` (text, original URL)
      - `content_hash` (text, for deduplication)
      - `content_type` (text, type of content - article, blog, news, etc.)
      - `date_found` (timestamp)
      - `search_query` (text, original search query)
      - `word_count` (integer, content length metric)
      - `relevance_score` (integer, 1-10 relevance rating)
      - `created_at` (timestamp)
    
    - `media_files`
      - `id` (uuid, primary key) 
      - `content_item_id` (uuid, foreign key)
      - `media_url` (text, URL to media file)
      - `media_type` (text, image, video, audio, document)
      - `file_name` (text, extracted filename)
      - `file_size` (bigint, file size in bytes if available)
      - `alt_text` (text, image alt text or description)
      - `created_at` (timestamp)

    - `search_sessions`
      - `id` (uuid, primary key)
      - `search_query` (text, search terms used)
      - `search_provider` (text, which search service was used)
      - `results_found` (integer, number of results)
      - `new_content_added` (integer, new items saved)
      - `duplicates_found` (integer, duplicate items encountered)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their research data
    - Public read access for viewing archived content

  3. Indexes
    - Content hash index for fast deduplication checks
    - Search query index for search history
    - URL index for duplicate URL detection
*/

-- Content Items table
CREATE TABLE IF NOT EXISTS content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  content_text text NOT NULL DEFAULT '',
  source_url text NOT NULL,
  content_hash text NOT NULL,
  content_type text NOT NULL DEFAULT 'article',
  date_found timestamptz DEFAULT now(),
  search_query text NOT NULL DEFAULT '',
  word_count integer DEFAULT 0,
  relevance_score integer DEFAULT 5 CHECK (relevance_score >= 1 AND relevance_score <= 10),
  created_at timestamptz DEFAULT now()
);

-- Media Files table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  file_name text DEFAULT '',
  file_size bigint DEFAULT 0,
  alt_text text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Search Sessions table
CREATE TABLE IF NOT EXISTS search_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query text NOT NULL,
  search_provider text NOT NULL DEFAULT 'bing',
  results_found integer DEFAULT 0,
  new_content_added integer DEFAULT 0,
  duplicates_found integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_items
CREATE POLICY "Anyone can read content items"
  ON content_items
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert content items"
  ON content_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content items"
  ON content_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for media_files
CREATE POLICY "Anyone can read media files"
  ON media_files
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can manage media files"
  ON media_files
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for search_sessions
CREATE POLICY "Anyone can read search sessions"
  ON search_sessions
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create search sessions"
  ON search_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_hash ON content_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_content_items_url ON content_items(source_url);
CREATE INDEX IF NOT EXISTS idx_content_items_query ON content_items(search_query);
CREATE INDEX IF NOT EXISTS idx_content_items_date ON content_items(date_found DESC);
CREATE INDEX IF NOT EXISTS idx_search_sessions_query ON search_sessions(search_query);
CREATE INDEX IF NOT EXISTS idx_search_sessions_date ON search_sessions(created_at DESC);