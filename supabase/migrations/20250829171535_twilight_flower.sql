/*
  # Enhance Voting System for Homepage

  1. New Functions
    - `get_current_vote_counts` - Get real-time vote counts for homepage display
    - `check_user_voted_today` - Check if user has already voted today
    - `get_voting_round_status` - Get current voting round information

  2. Security
    - Public read access for vote counts and round status
    - Authenticated access for vote checking functions
*/

-- Function to get current vote counts for homepage display
CREATE OR REPLACE FUNCTION public.get_current_vote_counts()
RETURNS TABLE (
  image_id text,
  vote_count bigint,
  last_vote_time timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vv.image_id,
    COUNT(*) as vote_count,
    MAX(vv.voted_at) as last_vote_time
  FROM public.visitor_votes vv
  WHERE vv.session_day = CURRENT_DATE
  GROUP BY vv.image_id
  ORDER BY vote_count DESC, last_vote_time DESC;
END;
$$;

-- Function to check if a visitor has voted today
CREATE OR REPLACE FUNCTION public.check_visitor_voted_today(visitor_id text)
RETURNS TABLE (
  has_voted boolean,
  voted_for text,
  voted_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 FROM public.visitor_votes 
      WHERE visitor_id = visitor_id AND session_day = CURRENT_DATE
    ) as has_voted,
    (
      SELECT image_id FROM public.visitor_votes 
      WHERE visitor_id = visitor_id AND session_day = CURRENT_DATE 
      LIMIT 1
    ) as voted_for,
    (
      SELECT voted_at FROM public.visitor_votes 
      WHERE visitor_id = visitor_id AND session_day = CURRENT_DATE 
      LIMIT 1
    ) as voted_at;
END;
$$;

-- Function to get voting round status
CREATE OR REPLACE FUNCTION public.get_voting_round_status()
RETURNS TABLE (
  round_active boolean,
  round_id uuid,
  round_number integer,
  end_date date,
  hours_remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vr.status = 'active' as round_active,
    vr.id as round_id,
    vr.round_number,
    vr.end_date,
    EXTRACT(EPOCH FROM (vr.end_date + INTERVAL '1 day' - NOW())) / 3600 as hours_remaining
  FROM public.voting_rounds vr
  WHERE vr.status = 'active'
  ORDER BY vr.created_at DESC
  LIMIT 1;
END;
$$;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_current_vote_counts TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_visitor_voted_today TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_voting_round_status TO authenticated, anon;