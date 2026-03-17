-- Fix: column reference "email" is ambiguous in skyline_verify_otp_login
-- (RETURNS TABLE has email; qualify table columns)

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
