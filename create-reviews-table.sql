-- Run this in your Supabase SQL Editor to create the reviews table

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS reviews_book_id_idx ON reviews(book_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);

-- Disable Row Level Security to allow all operations
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Verify the table was created
SELECT * FROM reviews LIMIT 5;
