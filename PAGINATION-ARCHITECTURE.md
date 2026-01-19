# Pagination Architecture Diagram

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     READER SCREEN FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. USER OPENS BOOK
   │
   ├─→ Book data loaded with full .content
   │
   ├─→ useMemo calculates pages
   │   ├─ Input: book.content (string)
   │   ├─ Split: 2000 chars at a time
   │   ├─ Smart breaks: paragraph or sentence
   │   └─ Output: pages[] array + totalPages count
   │
   ├─→ Load saved progress from Supabase
   │   ├─ Query: SELECT current_page FROM user_books
   │   ├─ If found: currentPage = saved_page
   │   └─ Else: currentPage = 1
   │
   └─→ RENDER
       └─ Display: pages[currentPage - 1]
          with "Page {currentPage} of {totalPages}"


2. USER CLICKS NEXT/PREVIOUS
   │
   ├─→ Button handler triggered
   │   ├─ Check boundary: currentPage < totalPages (next)
   │   ├─ Check boundary: currentPage > 1 (previous)
   │   └─ Update state: setCurrentPage(newPage)
   │
   ├─→ SAVE to Supabase
   │   ├─ Call: readingProgressService.saveProgress()
   │   ├─ Update: user_books.current_page = newPage
   │   └─ Update: user_books.total_pages = totalPages
   │
   ├─→ UI RE-RENDERS
   │   └─ Display: pages[newPage - 1] ← NEW CONTENT
   │
   └─→ User sees different page content


3. USER CLOSES BOOK
   │
   └─→ useEffect cleanup
       └─ Automatic save: current_page to Supabase


4. USER REOPENS BOOK (next session)
   │
   ├─→ Load saved progress
   │   ├─ Query: SELECT current_page FROM user_books
   │   ├─ Get: currentPage = 5 (for example)
   │   └─ Validate: 1 ≤ currentPage ≤ totalPages
   │
   └─→ RENDER
       └─ Display: pages[5 - 1] ← RESUMED AT PAGE 5!
```

---

## State Management

```
ReaderScreen Component State:

const [currentPage, setCurrentPage] = useState(1);  ← Only this state!

// Derived from content (NOT state):
const { pages, totalPages } = React.useMemo(() => {
  // Calculate pages from book.content
  return { pages: [], totalPages: 0 };
}, [book?.content]);  ← Recalculates only when content changes

// Other state:
const [fontSize, setFontSize] = useState('medium');
const [brightness, setBrightness] = useState(1);
const [isRestoringPosition, setIsRestoringPosition] = useState(true);
const [savedProgress, setSavedProgress] = useState(null);
```

**Key Insight:** Pages are NOT state, they're derived values.
This prevents bugs and improves performance.

---

## Page Splitting Algorithm

```
Input: "Paragraph 1.\n\nParagraph 2.\n\nParagraph 3..."
       (thousands of characters)

Step 1: Determine chunk size
        → CHARS_PER_PAGE = 2000 chars

Step 2: Find break point
        ┌─ Try paragraph break (\n\n)
        ├─ Try sentence break (. )
        └─ Use hard limit if no natural break

Step 3: Extract page
        → content.substring(currentIndex, breakPoint)

Step 4: Move to next chunk
        → currentIndex = breakPoint

Step 5: Repeat until all content consumed

Output: pages[0] = "Paragraph 1...", 
        pages[1] = "Paragraph 2...",
        pages[2] = "Paragraph 3...",
        totalPages = 3
```

---

## Database Schema

```sql
CREATE TABLE user_books (
  id BIGINT PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id BIGINT NOT NULL,
  status VARCHAR NOT NULL,        -- 'reading', 'completed', 'not_started'
  is_favorite BOOLEAN NOT NULL,
  last_page INTEGER DEFAULT 0,    -- Percentage (0-100)
  
  -- NEW COLUMNS FOR PAGE NAVIGATION
  current_page INTEGER DEFAULT 1, ← ✨ Current page number
  total_pages INTEGER DEFAULT 0,  ← ✨ Total pages calculated
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
```

**RLS Policy:**
```sql
-- Users can only see/update their own books
SELECT * FROM user_books 
WHERE user_id = auth.uid();
```

---

## Component Hierarchy

```
App.js
  └─ ReaderScreen
      ├─ Header
      │  └─ Back button
      ├─ Page Container
      │  ├─ ScrollView
      │  │  └─ Current Page Content
      │  │     └─ pages[currentPage - 1]
      │  └─ Navigation Bar
      │     ├─ Previous Button (disabled if page === 1)
      │     ├─ Page Indicator (Page X of Y)
      │     └─ Next Button (disabled if page === totalPages)
      └─ Footer Controls
         ├─ Font Size Controls
         ├─ Brightness Controls
         └─ Settings Menu
```

---

## Rendering Flow

```
ReaderScreen Renders When:
├─ currentPage changes (state)
├─ book prop changes
├─ fontSize changes (state)
└─ brightness changes (state)

What Causes Re-render:
├─ handleNextPage() → setCurrentPage()
├─ handlePreviousPage() → setCurrentPage()
├─ setFontSize()
└─ setBrightness()

What Does NOT Cause Re-render:
├─ pages calculation (memoized)
├─ totalPages calculation (memoized)
└─ savedProgress loading (separate state)
```

---

## Message Flow for Page Navigation

```
User clicks "Next"
    ↓
handleNextPage() called
    ↓
Check: currentPage < totalPages? ✓
    ↓
setCurrentPage(currentPage + 1)
    ↓
React schedules re-render
    ↓
savePage(newPage) async
    ├─→ readingProgressService.saveProgress()
    │   ├─→ Supabase.from('user_books').update()
    │   ├─→ WHERE user_id = ? AND book_id = ?
    │   └─→ SET current_page = ?, total_pages = ?
    │
    └─→ On success: console.log('✅ Page saved')
        On error: Alert.alert('Error saving...')

Component Re-renders
    ↓
pages[currentPage - 1] returns NEW CONTENT
    ↓
User sees different page! ✓
```

---

## Memoization Benefit

```
WITHOUT useMemo:

ReaderScreen renders
  ↓
currentPage = 5 changed
  ↓
Component function runs
  ↓
Pages calculation runs AGAIN ❌
  ├─ Split content into pages (expensive!)
  ├─ Create new pages array
  └─ JavaScript comparison: pages !== oldPages
  ↓
Child components re-render (unnecessary)
  ↓
Performance: SLOW


WITH useMemo:

ReaderScreen renders
  ↓
currentPage = 5 changed
  ↓
Component function runs
  ↓
useMemo check: Did [book?.content] change? NO ✓
  ↓
Return cached { pages, totalPages } from previous render
  ↓
Same array reference: pages === oldPages ✓
  ↓
Child components skip re-render (memoization)
  ↓
Performance: FAST
```

---

## Error Handling Flow

```
Error: Database column doesn't exist
├─ app.js loads ReaderScreen
├─ ReaderScreen calls readingProgressService.getProgress()
├─ Supabase query SELECT current_page...
├─ ERROR: column "user_books.current_page" does not exist
├─ catch(error) → console.error()
├─ setIsRestoringPosition(false)
└─ User sees page 1 (default)

Solution: Run migration
├─ ALTER TABLE user_books
│  ADD COLUMN current_page INTEGER DEFAULT 1,
│  ADD COLUMN total_pages INTEGER DEFAULT 0;
├─ Restart app: expo start -c
└─ ✓ Now works!


Error: Progress save fails
├─ handleNextPage() → savePage()
├─ readingProgressService.saveProgress()
├─ Supabase.update() fails (network error)
├─ catch(error) → Alert.alert('Error', 'Failed to save...')
├─ currentPage still updated in UI
├─ console.error('❌ Error saving page...')
└─ User can continue reading (graceful failure)
```

---

## Performance Timeline

```
User Opens Book:
0ms   ─ Component mounts
10ms  ├─ useMemo calculates pages
20ms  ├─ readingProgressService.getProgress() called
300ms ├─ Supabase responds with saved progress
301ms ├─ setCurrentPage(savedPage)
302ms └─ Component renders (page 3 of 7)

User Clicks Next:
0ms   ─ Button press
1ms   ├─ handleNextPage() → setCurrentPage(4)
2ms   ├─ savePage(4) called
3ms   ├─ Component re-renders with page 4 content
250ms ├─ Supabase saves to database
251ms └─ console.log('✅ Page saved')

Total latency: ~2ms (perceived by user)
Database save: ~250ms (background, doesn't block UI)
```

---

## Pagination Example

```
Book content: 15,000 characters total
CHARS_PER_PAGE: 2,000 characters

Split Points (where pages break):
│
├─ Page 1 (0-2000 chars)
│  Break at: sentence end within last 200 chars
│  Content: "In the quiet town... [breaks at period]"
│
├─ Page 2 (2000-4000 chars)  
│  Break at: paragraph break (\n\n) within last 200 chars
│  Content: "The old bookstore... [breaks at \n\n]"
│
├─ Page 3 (4000-6000 chars)
│  Break at: sentence end within last 200 chars
│  Content: "Dr. Elena Vasquez... [breaks at period]"
│
├─ Page 4 (6000-8000 chars)
│  Break at: hard limit (no natural break found)
│  Content: "The detective pondered... [breaks at char 8000]"
│
├─ Page 5 (8000-10000 chars)
│  Break at: paragraph break (\n\n)
│  Content: "Meanwhile, at the agency... [breaks at \n\n]"
│
├─ Page 6 (10000-12000 chars)
│  Break at: sentence end
│  Content: "The truth was stranger... [breaks at period]"
│
├─ Page 7 (12000-14000 chars)
│  Break at: sentence end
│  Content: "As the dawn broke... [breaks at period]"
│
└─ Page 8 (14000-15000 chars) - LAST PAGE
   Include all: "The end of the story... [includes all 1000 chars]"

Total: 8 pages from 15,000 characters
User sees natural paragraph/sentence breaks
No words cut in half
```

---

## Summary

```
┌─────────────────────────────────┐
│   CHARACTER CONTENT             │
│   15,000+ characters            │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   SMART PAGE SPLITTING          │
│   • 2000 chars per page         │
│   • Natural breaks              │
│   • useMemo (cached)            │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   PAGES ARRAY                   │
│   pages[0], pages[1], ...       │
│   totalPages = 8                │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   DISPLAY CURRENT PAGE          │
│   pages[currentPage - 1]        │
│   "Page X of Y"                 │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   USER NAVIGATES                │
│   Next/Previous buttons         │
│   ↓ Save to database            │
│   ↓ Update UI                   │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│   PERSIST PROGRESS              │
│   current_page = saved          │
│   total_pages = calculated      │
└─────────────────────────────────┘
```

