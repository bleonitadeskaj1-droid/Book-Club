-- Run this in your Supabase SQL Editor to fix RLS issues on the books table

-- First, check if books table exists and what its structure is
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- Drop ALL existing policies on books table to avoid RLS violations
DROP POLICY IF EXISTS "Users can view books" ON books;
DROP POLICY IF EXISTS "Users can insert books" ON books;
DROP POLICY IF EXISTS "Users can update books" ON books;
DROP POLICY IF EXISTS "Users can delete books" ON books;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON books;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON books;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON books;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON books;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON books;
DROP POLICY IF EXISTS "Public read access" ON books;
DROP POLICY IF EXISTS "Admin insert access" ON books;

-- Disable Row Level Security on books table to allow all operations
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'books';

-- Check if we have any books in the table
SELECT COUNT(*) as book_count FROM books;