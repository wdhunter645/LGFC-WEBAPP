-- Fix missing RLS on moderation_actions table
-- This table contains sensitive moderation data and should be admin-only

-- Enable RLS on moderation_actions table
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can read moderation actions
CREATE POLICY "Only admins can read moderation actions"
  ON public.moderation_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can create moderation actions
CREATE POLICY "Only admins can create moderation actions"
  ON public.moderation_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can update moderation actions  
CREATE POLICY "Only admins can update moderation actions"
  ON public.moderation_actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Grant necessary permissions
GRANT ALL ON public.moderation_actions TO authenticated;