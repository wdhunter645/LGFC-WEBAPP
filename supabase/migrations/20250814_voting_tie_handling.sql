-- Add support for multiple winners in voting rounds
-- Create a new table to track multiple winners per round
CREATE TABLE IF NOT EXISTS public.round_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.voting_rounds(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.media_files(id) ON DELETE CASCADE,
  votes_received integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(round_id, image_id)
);

-- Enable RLS for round_winners
ALTER TABLE public.round_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for round_winners
CREATE POLICY "Anyone can read round winners"
  ON public.round_winners FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage round winners"
  ON public.round_winners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_round_winners_round ON public.round_winners(round_id);

-- Update the end_voting_round function to handle ties
CREATE OR REPLACE FUNCTION end_voting_round(round_id uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  max_votes integer;
  winner_ids uuid[];
BEGIN
  -- Get the maximum number of votes in this round
  SELECT MAX(votes_received) INTO max_votes
  FROM public.round_images
  WHERE round_id = round_id;
  
  -- Get all images with the maximum votes (handles ties)
  SELECT ARRAY_AGG(image_id) INTO winner_ids
  FROM public.round_images
  WHERE round_id = round_id AND votes_received = max_votes;
  
  -- Insert all winners into round_winners table
  INSERT INTO public.round_winners (round_id, image_id, votes_received)
  SELECT round_id, image_id, votes_received
  FROM public.round_images
  WHERE round_id = round_id AND votes_received = max_votes;
  
  -- Update the round status to completed
  UPDATE public.voting_rounds 
  SET 
    status = 'completed',
    total_votes = max_votes,
    updated_at = now()
  WHERE id = round_id;
  
  RETURN winner_ids;
END;
$$;

-- Update the getWinnerImages function in the automation script
-- This will be handled in the Node.js script, but we need a function to get winners
CREATE OR REPLACE FUNCTION get_round_winners(round_id uuid)
RETURNS TABLE (
  image_id uuid,
  votes_received integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT rw.image_id, rw.votes_received
  FROM public.round_winners rw
  WHERE rw.round_id = round_id
  ORDER BY rw.votes_received DESC, rw.created_at ASC;
END;
$$;

-- Function to get all winners from completed rounds
CREATE OR REPLACE FUNCTION get_all_round_winners()
RETURNS TABLE (
  image_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT rw.image_id
  FROM public.round_winners rw
  JOIN public.voting_rounds vr ON rw.round_id = vr.id
  WHERE vr.status = 'completed'
  ORDER BY rw.image_id;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_round_winners TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_all_round_winners TO authenticated, anon;