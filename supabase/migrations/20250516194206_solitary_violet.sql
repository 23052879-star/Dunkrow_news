/*
  # Add additional profile fields

  1. Changes
    - Add bio, website, location fields to profiles table
    - Add updated_at timestamp to profiles table
*/

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DO $$ BEGIN
  CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;