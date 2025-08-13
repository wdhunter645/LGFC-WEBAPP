-- Add fields for member photo uploads
ALTER TABLE public.media_files 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_member_upload boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS original_name text,
ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES auth.users(id);

-- Add index for tags for efficient searching
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON public.media_files USING GIN(tags);

-- Add index for member uploads
CREATE INDEX IF NOT EXISTS idx_media_files_member_uploads ON public.media_files(is_member_upload);

-- Add index for uploaded_by
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON public.media_files(uploaded_by);

-- Function to search photos by tags
CREATE OR REPLACE FUNCTION search_photos_by_tags(search_tags text[])
RETURNS TABLE (
  id uuid,
  file_name text,
  original_name text,
  media_url text,
  alt_text text,
  tags text[],
  uploaded_by uuid,
  is_member_upload boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mf.id,
    mf.file_name,
    mf.original_name,
    mf.media_url,
    mf.alt_text,
    mf.tags,
    mf.uploaded_by,
    mf.is_member_upload,
    mf.created_at
  FROM public.media_files mf
  WHERE mf.media_type = 'image'
    AND mf.tags && search_tags  -- Overlap operator for arrays
  ORDER BY mf.created_at DESC;
END;
$$;

-- Function to get member's uploaded photos
CREATE OR REPLACE FUNCTION get_member_photos(user_id uuid)
RETURNS TABLE (
  id uuid,
  file_name text,
  original_name text,
  media_url text,
  alt_text text,
  tags text[],
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mf.id,
    mf.file_name,
    mf.original_name,
    mf.media_url,
    mf.alt_text,
    mf.tags,
    mf.created_at
  FROM public.media_files mf
  WHERE mf.media_type = 'image'
    AND mf.uploaded_by = user_id
    AND mf.is_member_upload = true
  ORDER BY mf.created_at DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_photos_by_tags TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_member_photos TO authenticated;

-- RLS policy for member uploads
CREATE POLICY "Members can view their own uploads"
  ON public.media_files FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid() OR 
    is_member_upload = false OR
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Members can insert their own uploads"
  ON public.media_files FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    is_member_upload = true
  );

CREATE POLICY "Members can update their own uploads"
  ON public.media_files FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());