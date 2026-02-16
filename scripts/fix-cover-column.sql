-- Run this in Supabase Dashboard > SQL Editor if cover_asset_url column is missing
-- Fixes: DatabaseError 42P17 (undefined object)

-- Add cover_asset_url to skyline_forms (for PDF cover images)
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
