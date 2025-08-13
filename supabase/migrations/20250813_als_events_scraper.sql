-- Add miss_count field to events table for ALS scraper
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS miss_count integer DEFAULT 0;

-- Create function to increment miss count
CREATE OR REPLACE FUNCTION increment_event_miss_count(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events 
  SET miss_count = miss_count + 1
  WHERE id = event_id;
END;
$$;

-- Add index for miss_count for efficient queries
CREATE INDEX IF NOT EXISTS idx_events_miss_count ON public.events(miss_count);

-- Add index for source field
CREATE INDEX IF NOT EXISTS idx_events_source ON public.events(source);

-- Add RLS policy for the function
GRANT EXECUTE ON FUNCTION increment_event_miss_count TO authenticated;