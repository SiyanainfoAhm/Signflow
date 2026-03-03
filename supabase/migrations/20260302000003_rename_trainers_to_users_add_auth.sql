-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add role and password_hash to trainers, then rename to skyline_users
ALTER TABLE skyline_trainers
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'trainer' CHECK (role IN ('admin', 'trainer', 'office')),
  ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Rename table
ALTER TABLE skyline_trainers RENAME TO skyline_users;

-- Update FK constraint name if needed (optional - PostgreSQL keeps FK valid after rename)
-- Batch table trainer_id still references this table (same OID)

-- Ensure admin user exists: subscriptions@slit.edu.au (default password: Admin@123)
INSERT INTO skyline_users (full_name, email, phone, status, role, password_hash)
SELECT 'Admin', 'subscriptions@slit.edu.au', NULL, 'active', 'admin', crypt('Admin@123', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM skyline_users WHERE email = 'subscriptions@slit.edu.au');

-- Set password for existing users without one (default: ChangeMe123)
UPDATE skyline_users
SET password_hash = crypt('ChangeMe123', gen_salt('bf'))
WHERE password_hash IS NULL;

-- Login RPC: returns user (without password_hash) if email+password valid
CREATE OR REPLACE FUNCTION skyline_login(p_email TEXT, p_password TEXT)
RETURNS TABLE (
  id BIGINT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.status,
    u.role
  FROM skyline_users u
  WHERE u.email = p_email
    AND u.password_hash IS NOT NULL
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.status = 'active';
END;
$$;

-- Allow anon/authenticated to call login (no Supabase auth - we use our own)
GRANT EXECUTE ON FUNCTION skyline_login(TEXT, TEXT) TO anon;
