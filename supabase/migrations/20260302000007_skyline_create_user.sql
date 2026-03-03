-- Admin creates a new user with password (hashed server-side)
CREATE OR REPLACE FUNCTION skyline_create_user(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_status TEXT DEFAULT 'active',
  p_role TEXT DEFAULT 'trainer',
  p_password TEXT DEFAULT NULL
)
RETURNS TABLE (id BIGINT, full_name TEXT, email TEXT, phone TEXT, status TEXT, role TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id BIGINT;
  v_created TIMESTAMPTZ;
  v_password_hash TEXT;
BEGIN
  IF p_full_name IS NULL OR length(trim(p_full_name)) = 0 THEN
    RAISE EXCEPTION 'Full name is required.';
  END IF;
  IF p_email IS NULL OR length(trim(p_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required.';
  END IF;
  IF p_role IS NULL OR p_role NOT IN ('admin', 'trainer', 'office') THEN
    RAISE EXCEPTION 'Role must be admin, trainer, or office.';
  END IF;
  IF p_status IS NULL OR p_status NOT IN ('active', 'inactive') THEN
    RAISE EXCEPTION 'Status must be active or inactive.';
  END IF;
  IF p_password IS NOT NULL AND length(trim(p_password)) > 0 AND length(trim(p_password)) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters.';
  END IF;

  v_password_hash := CASE
    WHEN p_password IS NOT NULL AND length(trim(p_password)) > 0
    THEN crypt(trim(p_password), gen_salt('bf'))
    ELSE crypt('ChangeMe123', gen_salt('bf'))
  END;

  INSERT INTO skyline_users (full_name, email, phone, status, role, password_hash)
  VALUES (
    trim(p_full_name),
    trim(lower(p_email)),
    NULLIF(trim(p_phone), ''),
    p_status,
    p_role,
    v_password_hash
  )
  RETURNING skyline_users.id, skyline_users.created_at INTO v_id, v_created;

  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.status,
    u.role,
    u.created_at
  FROM skyline_users u
  WHERE u.id = v_id;
END;
$$;

-- Admin can set/reset a user's password (no current password check)
CREATE OR REPLACE FUNCTION skyline_admin_set_password(
  p_user_id BIGINT,
  p_new_password TEXT
)
RETURNS TABLE (success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_new_password IS NULL OR length(trim(p_new_password)) < 6 THEN
    RETURN QUERY SELECT FALSE, 'Password must be at least 6 characters.'::TEXT;
    RETURN;
  END IF;

  UPDATE skyline_users
  SET password_hash = crypt(trim(p_new_password), gen_salt('bf'))
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'User not found.'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Password updated.'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION skyline_create_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION skyline_create_user(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION skyline_admin_set_password(BIGINT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION skyline_admin_set_password(BIGINT, TEXT) TO authenticated;
