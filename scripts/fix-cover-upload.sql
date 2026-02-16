-- Run this in Supabase Dashboard > SQL Editor
-- Fixes: "Upload failed: database error, code: 42P17"

-- 1. Add cover_asset_url column to skyline_forms (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'skyline_forms'
    AND column_name = 'cover_asset_url'
  ) THEN
    ALTER TABLE public.skyline_forms ADD COLUMN cover_asset_url TEXT;
  END IF;
END $$;

-- 2. Add storage policies for photomedia bucket (for skyline folder uploads)
DROP POLICY IF EXISTS "photomedia_allow_insert" ON storage.objects;
CREATE POLICY "photomedia_allow_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photomedia');

DROP POLICY IF EXISTS "photomedia_allow_update" ON storage.objects;
CREATE POLICY "photomedia_allow_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photomedia');

DROP POLICY IF EXISTS "photomedia_allow_select" ON storage.objects;
CREATE POLICY "photomedia_allow_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'photomedia');
