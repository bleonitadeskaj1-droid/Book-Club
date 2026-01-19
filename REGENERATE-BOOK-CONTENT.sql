-- Regenerate Book Content Script
-- Purpose: Ensure each book has unique, genre-specific content
-- WARNING: This will overwrite existing content. Back up first!

-- Before running this:
-- 1. Back up the books table: SELECT * INTO books_backup FROM books;
-- 2. Test on a single book first
-- 3. Run the verification queries from DATA-INTEGRITY-CHECK.sql

-- Example: Update a single book with new content
UPDATE books
SET 
  content = CONCAT(
    'This is ', title, ' by ', author, '. Genre: ', COALESCE(genre, 'Fiction'), '. ',
    COALESCE(description, ''),
    '\n\n',
    'Chapter 1: The Beginning\n\n',
    'In this captivating ', COALESCE(genre, 'fiction'), ' work, the reader is drawn into a world of intrigue and wonder. ',
    'The protagonist faces challenges that will test their resolve and transform their life forever. ',
    'As the story unfolds, secrets are revealed and relationships are tested.\n\n',
    'Chapter 2: The Journey\n\n',
    'Throughout this remarkable tale, themes of ', 
    CASE 
      WHEN genre = 'Romance' THEN 'love, passion, and commitment'
      WHEN genre = 'Mystery' THEN 'suspense, secrets, and justice'
      WHEN genre = 'Science Fiction' THEN 'technology, discovery, and humanity'
      WHEN genre = 'Fantasy' THEN 'magic, courage, and destiny'
      WHEN genre = 'Thriller' THEN 'danger, survival, and truth'
      WHEN genre = 'Horror' THEN 'fear, darkness, and redemption'
      WHEN genre = 'Biography' THEN 'achievement, struggle, and legacy'
      WHEN genre = 'History' THEN 'change, power, and consequence'
      WHEN genre = 'Self-Help' THEN 'growth, success, and transformation'
      ELSE 'emotion, discovery, and growth'
    END,
    ' weave throughout the narrative.\n\n',
    'Chapter 3: Resolution\n\n',
    'The climax of this ', COALESCE(genre, 'story'), ' brings characters to their defining moment. ',
    'Readers will discover that nothing is as it seemed. The conclusion leaves lasting impressions ',
    'and raises questions that will linger long after the final page is turned.\n\n',
    'Written by ', author, ' and first published in ', COALESCE(publication_year::TEXT, '2024'), 
    ', this book represents an important work in its genre.'
  )
WHERE id = 'BOOK_ID_HERE';

-- Verify the change
SELECT 
  id,
  title,
  author,
  genre,
  LENGTH(content) as content_length,
  LEFT(content, 100) as content_preview
FROM books
WHERE id = 'BOOK_ID_HERE';

-- After manual update, verify all books now have different content:
SELECT 
  COUNT(*) as unique_content_count
FROM (
  SELECT DISTINCT content
  FROM books
  WHERE content IS NOT NULL AND content != ''
) subquery;

-- This should equal the number of books with content (no duplicates)
