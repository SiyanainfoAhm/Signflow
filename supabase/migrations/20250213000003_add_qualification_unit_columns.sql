-- Add qualification and unit columns required by admin when creating a form
ALTER TABLE skyline_forms ADD COLUMN IF NOT EXISTS qualification_code TEXT;
ALTER TABLE skyline_forms ADD COLUMN IF NOT EXISTS qualification_name TEXT;
ALTER TABLE skyline_forms ADD COLUMN IF NOT EXISTS unit_name TEXT;
