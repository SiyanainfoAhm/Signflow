-- Allow users to change their own password (verify current first)
CREATE OR REPLACE FUNCTION skyline_change_password(
  p_user_id BIGINT,
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS TABLE (success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_hash TEXT;
BEGIN
  IF p_new_password IS NULL OR length(trim(p_new_password)) < 6 THEN
    RETURN QUERY SELECT FALSE, 'New password must be at least 6 characters.'::TEXT;
    RETURN;
  END IF;

  SELECT password_hash INTO v_current_hash
  FROM skyline_users
  WHERE id = p_user_id AND status = 'active';

  IF v_current_hash IS NULL THEN
    RETURN QUERY SELECT FALSE, 'User not found.'::TEXT;
    RETURN;
  END IF;

  IF v_current_hash != crypt(p_current_password, v_current_hash) THEN
    RETURN QUERY SELECT FALSE, 'Current password is incorrect.'::TEXT;
    RETURN;
  END IF;

  UPDATE skyline_users
  SET password_hash = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, 'Password updated successfully.'::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION skyline_change_password(BIGINT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION skyline_change_password(BIGINT, TEXT, TEXT) TO authenticated;
