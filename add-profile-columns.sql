-- ============================================
-- ADD MISSING PROFILE COLUMNS
-- Run this in Supabase SQL Editor if you already have a profiles table
-- ============================================

-- Add missing columns to profiles table (if they don't exist)
-- These commands are safe - they only add columns if they don't already exist

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- All new columns are nullable and optional - users can have profiles without them
-- The app will handle missing values gracefully

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
