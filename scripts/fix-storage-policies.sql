-- Run this in Supabase Dashboard > SQL Editor if cover image upload fails
-- Adds storage policies for photomedia bucket (skyline folder for form cover images)
-- SignFlow uses anon key for form builder; these policies allow upload/read.

-- INSERT: allow uploads to photomedia (anon + authenticated)
DROP POLICY IF EXISTS "photomedia_allow_insert" ON storage.objects;
CREATE POLICY "photomedia_allow_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photomedia');

-- UPDATE: needed for upsert (overwriting existing files)
DROP POLICY IF EXISTS "photomedia_allow_update" ON storage.objects;
CREATE POLICY "photomedia_allow_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photomedia');

-- SELECT: allow public read
DROP POLICY IF EXISTS "photomedia_allow_select" ON storage.objects;
CREATE POLICY "photomedia_allow_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'photomedia');
