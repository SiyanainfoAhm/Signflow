-- Add cover_asset_url for PDF cover page background image (user can add)
ALTER TABLE skyline_forms ADD COLUMN IF NOT EXISTS cover_asset_url TEXT;
