-- OTP table for passwordless login (valid 10 minutes)
CREATE TABLE IF NOT EXISTS skyline_otps (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skyline_otps_email ON skyline_otps(email);
CREATE INDEX IF NOT EXISTS idx_skyline_otps_expires ON skyline_otps(expires_at);

-- Add is_master to exclude from user listing hints
ALTER TABLE skyline_users ADD COLUMN IF NOT EXISTS is_master BOOLEAN NOT NULL DEFAULT false;

-- Insert master Admin (gourav.gupta@siyanainfo.com) - can bypass password/OTP validation
INSERT INTO skyline_users (full_name, email, phone, status, role, password_hash, is_master)
SELECT 'Admin', 'gourav.gupta@siyanainfo.com', NULL, 'active', 'admin', NULL, true
WHERE NOT EXISTS (SELECT 1 FROM skyline_users WHERE email = 'gourav.gupta@siyanainfo.com');

-- Request OTP: check user exists first, then create OTP (valid 10 min). For Power Automate to call.
CREATE OR REPLACE FUNCTION skyline_request_otp(p_email TEXT)
RETURNS TABLE (success BOOLEAN, otp TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_otp TEXT;
  v_expires TIMESTAMPTZ;
  v_user_exists BOOLEAN;
BEGIN
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'Email is required.'::TEXT;
    RETURN;
  END IF;

  -- Check user exists and is active (master user or regular)
  SELECT EXISTS(
    SELECT 1 FROM skyline_users u
    WHERE lower(trim(u.email)) = lower(trim(p_email))
      AND u.status = 'active'
  ) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 'User not found. Contact your administrator.'::TEXT;
    RETURN;
  END IF;

  -- Generate 6-digit OTP
  v_otp := lpad(floor(random() * 1000000)::TEXT, 6, '0');
  v_expires := now() + interval '10 minutes';

  -- Invalidate any existing OTPs for this email
  DELETE FROM skyline_otps WHERE lower(skyline_otps.email) = lower(trim(p_email));

  -- Insert new OTP
  INSERT INTO skyline_otps (email, otp_code, expires_at)
  VALUES (lower(trim(p_email)), v_otp, v_expires);

  RETURN QUERY SELECT TRUE, v_otp, 'OTP generated successfully.'::TEXT;
END;
$$;

-- Verify OTP and return user (same shape as skyline_login)
CREATE OR REPLACE FUNCTION skyline_verify_otp_login(p_email TEXT, p_otp TEXT)
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
  INNER JOIN skyline_otps o ON lower(o.email) = lower(trim(p_email))
    AND o.otp_code = trim(p_otp)
    AND o.expires_at > now()
  WHERE lower(u.email) = lower(trim(p_email))
    AND u.status = 'active';

  -- Delete used OTP (qualify columns to avoid ambiguity with RETURNS TABLE)
  DELETE FROM skyline_otps
  WHERE lower(skyline_otps.email) = lower(trim(p_email))
    AND skyline_otps.otp_code = trim(p_otp);
END;
$$;

-- Update skyline_login: allow master user to login with empty password (bypass)
CREATE OR REPLACE FUNCTION skyline_login(p_email TEXT, p_password TEXT DEFAULT NULL)
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
  -- Master user: bypass password check when p_password is empty or null
  IF EXISTS (
    SELECT 1 FROM skyline_users u
    WHERE lower(u.email) = lower(trim(p_email))
      AND u.status = 'active'
      AND u.is_master = true
  ) AND (p_password IS NULL OR length(trim(p_password)) = 0) THEN
    RETURN QUERY
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      u.role
    FROM skyline_users u
    WHERE lower(u.email) = lower(trim(p_email))
      AND u.status = 'active'
      AND u.is_master = true;
    RETURN;
  END IF;

  -- Regular login: require password
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.status,
    u.role
  FROM skyline_users u
  WHERE u.email = trim(p_email)
    AND u.password_hash IS NOT NULL
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.status = 'active';
END;
$$;

GRANT EXECUTE ON FUNCTION skyline_request_otp(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION skyline_verify_otp_login(TEXT, TEXT) TO anon;
