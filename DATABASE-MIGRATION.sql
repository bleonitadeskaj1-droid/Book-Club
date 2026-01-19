-- Database Migration: Add Page Navigation and Profile Fields
-- This migration adds support for page-based reading and profile persistence

-- ===========================================================
-- PART 1: Add missing columns to profiles table
-- ===========================================================

-- If the profiles table doesn't have these columns, add them:
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- ===========================================================
-- PART 2: Add page navigation columns to user_books
-- ===========================================================

-- Add columns for page-based navigation if they don't exist:
ALTER TABLE user_books
ADD COLUMN IF NOT EXISTS current_page INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0;

-- ===========================================================
-- VERIFICATION QUERIES
-- ===========================================================

-- Verify profiles table has all required columns:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Expected columns:
-- id, full_name, username, avatar_url, bio, role, created_at, updated_at

-- Verify user_books table has page navigation columns:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_books'
ORDER BY ordinal_position;

-- Expected columns:
-- id, user_id, book_id, status, last_page, current_page, total_pages, is_favorite, created_at, updated_at
