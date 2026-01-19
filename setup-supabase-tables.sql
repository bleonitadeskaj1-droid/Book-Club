-- ============================================
-- BOOK CLUB DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 2. BOOKS TABLE (public, read-only for users)
-- ============================================
DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publication_year INTEGER,
  genre TEXT,
  description TEXT,
  cover_url TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. USER_BOOKS TABLE (reading status per user)
-- ============================================
DROP TABLE IF EXISTS user_books CASCADE;
CREATE TABLE user_books (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'reading', 'completed')),
  last_page INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, book_id)
);

-- ============================================
-- 4. REVIEWS TABLE (ratings and comments)
-- ============================================
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, book_id)
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_book_id ON user_books(book_id);
CREATE INDEX idx_user_books_status ON user_books(status);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================
-- SECURITY FUNCTIONS (Create BEFORE RLS policies)
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES - BOOKS (Public Read)
-- ============================================

CREATE POLICY "Everyone can view books" ON books
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert books" ON books
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update books" ON books
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete books" ON books
  FOR DELETE USING (is_admin());

-- ============================================
-- RLS POLICIES - USER_BOOKS (User-specific)
-- ============================================

CREATE POLICY "Users can view own reading status" ON user_books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading status" ON user_books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading status" ON user_books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading status" ON user_books
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES - REVIEWS (User-specific)
-- ============================================

CREATE POLICY "Everyone can view all reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS update_user_books_updated_at ON user_books;
CREATE TRIGGER update_user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- VERIFICATION (optional, just to check)
-- ============================================

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'books', 'user_books', 'reviews')
ORDER BY tablename;

-- Verify check constraints exist
SELECT table_name, constraint_name
FROM information_schema.table_constraints
WHERE constraint_type = 'CHECK'
  AND table_name IN ('user_books', 'reviews')
ORDER BY table_name;

-- ============================================
-- SAMPLE BOOKS (Populate database)
-- ============================================

INSERT INTO books (title, author, publication_year, genre, description, cover_url) VALUES
-- Classic Literature
('To Kill a Mockingbird', 'Harper Lee', 1960, 'Classic Fiction', 'A gripping tale of racial injustice and childhood innocence in the American South.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('Pride and Prejudice', 'Jane Austen', 1813, 'Romance', 'A classic love story set in Regency England with wit and social commentary.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('Jane Eyre', 'Charlotte Brontë', 1847, 'Gothic Romance', 'A passionate tale of a young governess who falls in love with her mysterious employer.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),
('Wuthering Heights', 'Emily Brontë', 1848, 'Gothic Romance', 'A dark and brooding story of love and revenge on the Yorkshire moors.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),
('The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'Classic Fiction', 'A tale of wealth, love, and the American Dream in the Jazz Age.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),
('Moby Dick', 'Herman Melville', 1851, 'Adventure', 'An epic tale of obsession and the sea as Captain Ahab hunts the white whale.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('Anna Karenina', 'Leo Tolstoy', 1877, 'Classic Fiction', 'A sweeping epic of Russian society, love, and the search for meaning.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('The Odyssey', 'Homer', -800, 'Epic Poetry', 'Ancient Greek epic following Odysseus on his long journey home after the Trojan War.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),

-- Modern Classics
('The Catcher in the Rye', 'J.D. Salinger', 1951, 'Fiction', 'A coming-of-age story following a teenage boy navigating adulthood in New York City.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),
('One Hundred Years of Solitude', 'Gabriel García Márquez', 1967, 'Magic Realism', 'A multi-generational saga of the Buendía family in the magical town of Macondo.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),
('The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'Fiction', 'A masterpiece about wealth and love in 1920s America.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),

-- Dystopian & Science Fiction
('1984', 'George Orwell', 1949, 'Dystopian', 'A haunting novel about totalitarianism and surveillance in a futuristic world.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('Brave New World', 'Aldous Huxley', 1932, 'Dystopian', 'A futuristic society shaped by conditioning, drugs, and consumerism.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),
('Fahrenheit 451', 'Ray Bradbury', 1953, 'Dystopian', 'A fireman in a future America burns books instead of fighting fires.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),
('Dune', 'Frank Herbert', 1965, 'Science Fiction', 'An epic tale of politics, religion, and ecology on a desert planet.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),
('Neuromancer', 'William Gibson', 1984, 'Cyberpunk', 'A groundbreaking cyberpunk novel that defined the genre.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('The Foundation Series', 'Isaac Asimov', 1951, 'Science Fiction', 'An epic series about the fall and rise of galactic civilizations.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('Ender''s Game', 'Orson Scott Card', 1985, 'Science Fiction', 'A brilliant child is trained in military strategy in a space academy.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),

-- Fantasy
('The Lord of the Rings', 'J.R.R. Tolkien', 1954, 'Fantasy', 'An epic fantasy trilogy about the quest to destroy a powerful ring.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),
('The Hobbit', 'J.R.R. Tolkien', 1937, 'Fantasy', 'An adventure story of a reluctant hobbit on an epic quest to reclaim treasure.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),
('A Game of Thrones', 'George R.R. Martin', 1996, 'Fantasy', 'An intricate tale of political intrigue and war in a medieval fantasy world.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('The Name of the Wind', 'Patrick Rothfuss', 2007, 'Fantasy', 'A narrative about a legendary figure recounting his extraordinary life.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('The Chronicles of Narnia', 'C.S. Lewis', 1950, 'Fantasy', 'A magical wardrobe opens the door to an enchanted world of adventure.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 1997, 'Fantasy', 'A young wizard discovers his magical heritage and attends a magical school.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),
('The Silmarillion', 'J.R.R. Tolkien', 1977, 'Fantasy', 'The mythological history of Middle-earth before The Lord of the Rings.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),

-- Mystery & Thriller
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 2005, 'Mystery Thriller', 'A gripping mystery involving a journalist and a computer hacker.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('And Then There Were None', 'Agatha Christie', 1939, 'Mystery', 'Ten strangers are lured to an island where they''re accused of crimes.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('The Murder of Roger Ackroyd', 'Agatha Christie', 1926, 'Mystery', 'A detective novel with a shocking twist ending.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),
('Sherlock Holmes: A Study in Scarlet', 'Arthur Conan Doyle', 1887, 'Mystery', 'The first appearance of the world''s greatest detective.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),

-- Literary Fiction
('The Kite Runner', 'Khaled Hosseini', 2003, 'Fiction', 'A powerful story of friendship, betrayal, and redemption in Afghanistan.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),
('Life of Pi', 'Yann Martel', 2001, 'Adventure Fiction', 'A young man survives 227 days adrift in the Pacific Ocean with a tiger.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('The Book Thief', 'Markus Zusak', 2005, 'Historical Fiction', 'A girl finds solace in stealing books during Nazi Germany.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('The Boy in the Striped Pajamas', 'John Boyne', 2006, 'Historical Fiction', 'A powerful story of friendship during the Holocaust.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),
('All the Light We Cannot See', 'Anthony Doerr', 2014, 'Historical Fiction', 'A blind French girl and a German boy whose lives collide in WWII France.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),

-- Contemporary Fiction
('The Midnight Library', 'Matt Haig', 2020, 'Fiction', 'A woman explores alternate versions of her life.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop'),
('Educated', 'Tara Westover', 2018, 'Memoir', 'A memoir about a young woman raised by survivalists who educates herself.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=450&fit=crop'),
('Verity', 'Colleen Hoover', 2018, 'Thriller', 'A dark and twisted psychological thriller.', 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=300&h=450&fit=crop'),
('It Ends with Us', 'Colleen Hoover', 2016, 'Contemporary Fiction', 'A powerful story about love, heartbreak, and domestic abuse.', 'https://images.unsplash.com/photo-1543002588-d83cea6bde4d?w=300&h=450&fit=crop'),

-- Poetry & Essay
('The Complete Works of William Shakespeare', 'William Shakespeare', 1623, 'Drama', 'The complete plays and sonnets of the world''s greatest playwright.', 'https://images.unsplash.com/photo-1495446815901-a7297e1c3a0f?w=300&h=450&fit=crop'),
('Essays', 'Michel de Montaigne', 1580, 'Essay', 'Influential personal essays on human nature and philosophy.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop');


