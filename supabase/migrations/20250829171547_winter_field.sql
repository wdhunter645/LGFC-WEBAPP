/*
  # Homepage Analytics and Tracking

  1. New Tables
    - `homepage_interactions` - Track user interactions on homepage
    - `content_engagement` - Track engagement with news and FAQ content

  2. Functions
    - `track_homepage_interaction` - Record user interactions
    - `get_popular_content` - Get most engaged content for homepage

  3. Security
    - Public insert access for interaction tracking
    - Public read access for engagement metrics
*/

-- Table to track homepage interactions
CREATE TABLE IF NOT EXISTS public.homepage_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text,
  interaction_type text NOT NULL CHECK (interaction_type IN ('page_view', 'vote_click', 'faq_click', 'news_click', 'event_click')),
  target_id text,
  target_type text,
  session_day date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Table to track content engagement
CREATE TABLE IF NOT EXISTS public.content_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES public.content_items(id) ON DELETE CASCADE,
  engagement_type text NOT NULL CHECK (engagement_type IN ('view', 'click', 'share')),
  visitor_id text,
  session_day date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_engagement ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_interactions
CREATE POLICY "Public can insert homepage interactions"
  ON public.homepage_interactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read homepage interactions"
  ON public.homepage_interactions FOR SELECT
  TO authenticated, anon
  USING (true);

-- RLS Policies for content_engagement
CREATE POLICY "Public can insert content engagement"
  ON public.content_engagement FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read content engagement"
  ON public.content_engagement FOR SELECT
  TO authenticated, anon
  USING (true);

-- Function to track homepage interactions
CREATE OR REPLACE FUNCTION public.track_homepage_interaction(
  visitor_id text,
  interaction_type text,
  target_id text DEFAULT NULL,
  target_type text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.homepage_interactions (visitor_id, interaction_type, target_id, target_type)
  VALUES (visitor_id, interaction_type, target_id, target_type);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Function to get popular content for homepage
CREATE OR REPLACE FUNCTION public.get_popular_content(content_limit integer DEFAULT 5)
RETURNS TABLE (
  content_id uuid,
  title text,
  content_text text,
  source_url text,
  engagement_count bigint,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id as content_id,
    ci.title,
    ci.content_text,
    ci.source_url,
    COALESCE(ce.engagement_count, 0) as engagement_count,
    ci.created_at
  FROM public.content_items ci
  LEFT JOIN (
    SELECT 
      content_id,
      COUNT(*) as engagement_count
    FROM public.content_engagement
    WHERE created_at >= NOW() - INTERVAL '30 days'
    GROUP BY content_id
  ) ce ON ci.id = ce.content_id
  WHERE ci.content_type IN ('news', 'article')
    AND ci.relevance_score >= 5
  ORDER BY 
    COALESCE(ce.engagement_count, 0) DESC,
    ci.created_at DESC
  LIMIT content_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.track_homepage_interaction TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_popular_content TO authenticated, anon;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_homepage_interactions_type ON public.homepage_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_homepage_interactions_day ON public.homepage_interactions(session_day);
CREATE INDEX IF NOT EXISTS idx_content_engagement_content ON public.content_engagement(content_id);
CREATE INDEX IF NOT EXISTS idx_content_engagement_day ON public.content_engagement(session_day);