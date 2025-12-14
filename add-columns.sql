-- Run this in your Supabase SQL Editor to add the missing columns

-- Add rating column (0-5 stars)
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;

-- Add last_page column (for reading progress)
ALTER TABLE books ADD COLUMN IF NOT EXISTS last_page INTEGER DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'books' 
ORDER BY ordinal_position;
