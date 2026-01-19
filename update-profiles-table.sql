-- ============================================
-- UPDATE PROFILES TABLE WITH NEW FIELDS
-- Run this in Supabase SQL Editor AFTER setup-supabase-tables.sql
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Show updated table structure
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
