DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_status' AND e.enumlabel = 'archived'
  ) THEN
    ALTER TYPE user_status ADD VALUE 'archived';
  END IF;
END$$;

-- Ensure index on role/status still exists (no-op if already present)
CREATE INDEX IF NOT EXISTS users_role_status_idx ON users (role, status);
