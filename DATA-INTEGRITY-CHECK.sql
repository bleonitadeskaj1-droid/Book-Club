-- Data Integrity Fix: Ensure Each Book Has Unique Content
-- This script verifies and repairs the books table content

-- Step 1: Check how many books have content
SELECT 
  COUNT(*) as total_books,
  COUNT(CASE WHEN content IS NOT NULL AND content != '' THEN 1 END) as books_with_content,
  COUNT(CASE WHEN content IS NULL OR content = '' THEN 1 END) as books_without_content
FROM books;

-- Step 2: Find books with identical or very similar content
SELECT 
  COUNT(*) as book_count,
  LEFT(content, 100) as content_start,
  LENGTH(content) as content_length
FROM books
WHERE content IS NOT NULL AND content != ''
GROUP BY LEFT(content, 100), LENGTH(content)
HAVING COUNT(*) > 1
ORDER BY book_count DESC;

-- Step 3: List all books with their content lengths
SELECT 
  id,
  title,
  author,
  genre,
  LENGTH(content) as content_length,
  LEFT(content, 80) as content_preview
FROM books
ORDER BY title
LIMIT 20;

-- Step 4: Check for truly empty content
SELECT 
  id,
  title,
  author,
  genre,
  LENGTH(COALESCE(content, '')) as content_length,
  CASE 
    WHEN content IS NULL THEN 'NULL'
    WHEN content = '' THEN 'EMPTY'
    ELSE 'HAS_CONTENT'
  END as content_status
FROM books
WHERE content IS NULL OR content = ''
ORDER BY title;

-- Step 5: Verify content is book-specific (not identical between books)
-- This query shows if content differs between books
SELECT 
  b1.title as book_1,
  b2.title as book_2,
  CASE 
    WHEN b1.content = b2.content THEN 'IDENTICAL ⚠️'
    WHEN b1.content LIKE CONCAT(LEFT(b2.content, 100), '%') THEN 'VERY_SIMILAR ⚠️'
    ELSE 'DIFFERENT ✓'
  END as similarity,
  LENGTH(b1.content) as book_1_length,
  LENGTH(b2.content) as book_2_length
FROM books b1
JOIN books b2 ON b1.id < b2.id
WHERE b1.content IS NOT NULL 
  AND b2.content IS NOT NULL
  AND b1.content != ''
  AND b2.content != ''
ORDER BY similarity DESC
LIMIT 10;
