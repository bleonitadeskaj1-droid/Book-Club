-- Run this in your Supabase SQL Editor to recreate the profiles table with correct structure

-- Drop ALL existing policies first to avoid recursion issues
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON profiles;

-- Drop the existing table if it has wrong structure
DROP TABLE IF EXISTS profiles CASCADE;

-- Create the table with correct columns for email-based login
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX profiles_email_idx ON profiles(email);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for anon users (for admin functionality)
CREATE POLICY "Allow all operations for anon users" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the table was created
SELECT * FROM profiles LIMIT 5;
