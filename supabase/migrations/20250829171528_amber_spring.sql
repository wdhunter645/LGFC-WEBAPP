/*
  # Create News Content View

  1. New View
    - `news_content_view`
      - Filters content_items for news-type content
      - Provides clean interface for homepage news display
      - Includes relevance scoring and date formatting

  2. Security
    - Public read access for published news content
    - No additional permissions needed (uses existing content_items policies)
*/

-- Create a view for news content to make homepage queries cleaner
CREATE OR REPLACE VIEW public.news_content_view AS
SELECT 
  id,
  title,
  content_text,
  source_url,
  date_found,
  created_at,
  relevance_score,
  CASE 
    WHEN created_at >= NOW() - INTERVAL '1 day' THEN 'today'
    WHEN created_at >= NOW() - INTERVAL '7 days' THEN 'this week'
    WHEN created_at >= NOW() - INTERVAL '30 days' THEN 'this month'
    ELSE 'older'
  END as time_category
FROM public.content_items
WHERE 
  content_type IN ('news', 'article') 
  AND relevance_score >= 5
  AND title IS NOT NULL 
  AND title != ''
ORDER BY created_at DESC;

-- Grant read access to the view
GRANT SELECT ON public.news_content_view TO authenticated, anon;