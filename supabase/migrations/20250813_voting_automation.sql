-- Voting rounds and winners tracking
CREATE TABLE IF NOT EXISTS public.voting_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  winner_image_id uuid REFERENCES public.media_files(id),
  total_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Track which images are in each round
CREATE TABLE IF NOT EXISTS public.round_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.voting_rounds(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  votes_received integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(round_id, image_id)
);

-- Track voting history for rounds
CREATE TABLE IF NOT EXISTS public.round_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.voting_rounds(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voted_at timestamptz DEFAULT now(),
  UNIQUE(round_id, user_id)
);

-- Enable RLS
ALTER TABLE public.voting_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voting_rounds
CREATE POLICY "Anyone can read voting rounds"
  ON public.voting_rounds FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage voting rounds"
  ON public.voting_rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for round_images
CREATE POLICY "Anyone can read round images"
  ON public.round_images FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage round images"
  ON public.round_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- RLS Policies for round_votes
CREATE POLICY "Anyone can read round votes"
  ON public.round_votes FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert their own votes"
  ON public.round_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voting_rounds_status ON public.voting_rounds(status);
CREATE INDEX IF NOT EXISTS idx_voting_rounds_dates ON public.voting_rounds(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_round_images_round ON public.round_images(round_id);
CREATE INDEX IF NOT EXISTS idx_round_votes_round_user ON public.round_votes(round_id, user_id);
CREATE INDEX IF NOT EXISTS idx_round_votes_image ON public.round_votes(image_id);

-- Function to start a new voting round
CREATE OR REPLACE FUNCTION start_voting_round(
  round_number integer,
  image_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  round_id uuid;
  start_date date;
  end_date date;
BEGIN
  -- Calculate round dates (Monday to Sunday)
  start_date := date_trunc('week', current_date) + interval '1 day'; -- Monday
  end_date := start_date + interval '6 days'; -- Sunday
  
  -- Create the round
  INSERT INTO public.voting_rounds (round_number, start_date, end_date, status)
  VALUES (round_number, start_date, end_date, 'active')
  RETURNING id INTO round_id;
  
  -- Add images to the round
  INSERT INTO public.round_images (round_id, image_id)
  SELECT round_id, unnest(image_ids);
  
  RETURN round_id;
END;
$$;

-- Function to end a voting round and determine winner
CREATE OR REPLACE FUNCTION end_voting_round(round_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  winner_image_id uuid;
  total_votes_count integer;
BEGIN
  -- Get the winner (image with most votes)
  SELECT ri.image_id, ri.votes_received
  INTO winner_image_id, total_votes_count
  FROM public.round_images ri
  WHERE ri.round_id = round_id
  ORDER BY ri.votes_received DESC, ri.created_at ASC
  LIMIT 1;
  
  -- Update the round with winner and total votes
  UPDATE public.voting_rounds 
  SET 
    winner_image_id = winner_image_id,
    total_votes = total_votes_count,
    status = 'completed',
    updated_at = now()
  WHERE id = round_id;
  
  RETURN winner_image_id;
END;
$$;

-- Function to get current active round
CREATE OR REPLACE FUNCTION get_current_voting_round()
RETURNS TABLE (
  round_id uuid,
  round_number integer,
  start_date date,
  end_date date,
  total_images integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vr.id,
    vr.round_number,
    vr.start_date,
    vr.end_date,
    COUNT(ri.id)::integer as total_images
  FROM public.voting_rounds vr
  LEFT JOIN public.round_images ri ON vr.id = ri.round_id
  WHERE vr.status = 'active'
  GROUP BY vr.id, vr.round_number, vr.start_date, vr.end_date
  LIMIT 1;
END;
$$;

-- Function to record a vote in current round
CREATE OR REPLACE FUNCTION record_round_vote(image_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_round_id uuid;
  user_id uuid;
BEGIN
  -- Get current user
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get current active round
  SELECT round_id INTO current_round_id
  FROM get_current_voting_round();
  
  IF current_round_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user already voted in this round
  IF EXISTS (
    SELECT 1 FROM public.round_votes 
    WHERE round_id = current_round_id AND user_id = user_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Check if image is in current round
  IF NOT EXISTS (
    SELECT 1 FROM public.round_images 
    WHERE round_id = current_round_id AND image_id = image_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Record the vote
  INSERT INTO public.round_votes (round_id, image_id, user_id)
  VALUES (current_round_id, image_id, user_id);
  
  -- Update vote count
  UPDATE public.round_images 
  SET votes_received = votes_received + 1
  WHERE round_id = current_round_id AND image_id = image_id;
  
  RETURN true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION start_voting_round TO authenticated;
GRANT EXECUTE ON FUNCTION end_voting_round TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_voting_round TO authenticated, anon;
GRANT EXECUTE ON FUNCTION record_round_vote TO authenticated;