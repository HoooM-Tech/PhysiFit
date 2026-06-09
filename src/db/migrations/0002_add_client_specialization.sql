ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS preferred_specialization trainer_specialization;

CREATE INDEX IF NOT EXISTS client_profiles_preferred_specialization_idx ON client_profiles (preferred_specialization);
