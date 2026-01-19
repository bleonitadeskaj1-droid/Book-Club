-- VERIFICATION SQL FOR AUDIT
-- Run these queries in Supabase SQL Editor to verify the system works

-- 1. Check if auth trigger exists
SELECT trigger_name, action_orientation, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created' AND event_object_table = 'users';

-- Expected output: Should show one row with trigger details

-- 2. Check if handle_new_user function exists
SELECT routine_name, routine_type, routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- Expected output: Should show function

-- 3. Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Expected columns: id (uuid), full_name (text), username (text), 
-- avatar_url (text), bio (text), role (text), created_at (timestamp), updated_at (timestamp)

-- 4. Check RLS is enabled on profiles
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Expected: rowsecurity = true

-- 5. Check profiles RLS policies
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Expected policies:
-- - Users can view own profile
-- - Users can update own profile
-- - Users can insert own profile
-- - Admins can view all profiles
-- - Admins can update all profiles

-- 6. Count existing profiles vs auth users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM profiles)) as missing_profiles;

-- Expected: auth_users_count should equal profiles_count (or be very close)
-- missing_profiles should be 0 or close to 0

-- 7. Check if any profiles have role = 'admin'
SELECT id, full_name, username, role, created_at
FROM profiles
WHERE role = 'admin';

-- Expected: Should show admin user(s) if they exist

-- 8. Check all books in the system
SELECT COUNT(*) as total_books FROM books;

-- 9. Check all reviews in the system
SELECT COUNT(*) as total_reviews FROM reviews;

-- 10. Check a sample of recent profiles
SELECT id, full_name, username, role, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- This will help you see what user data exists
