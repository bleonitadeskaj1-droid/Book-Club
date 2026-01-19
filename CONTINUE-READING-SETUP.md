# Continue Reading Implementation Guide

## Overview
This document describes the "Continue Reading" functionality that allows users to track their reading progress and resume where they left off.

## Features Implemented

### 1. **Reading Progress Tracking**
- Automatically tracks scroll position while reading
- Converts scroll position to percentage (0-100%)
- Saves progress to `user_books.last_page` field
- Throttled saves (every 500ms) to avoid excessive database calls
- Auto-saves on screen exit for reliability

### 2. **Resume from Saved Position**
- When opening a book, the reader fetches saved progress
- Calculates pixel position from percentage
- Auto-scrolls to last read position
- Shows loading indicator while restoring position
- Displays progress bar in header

### 3. **Progress Display in Profile**
- Profile screen shows "Reading Progress" section
- Displays progress percentage (0-100%)
- Shows visual progress bar
- "Continue Reading" button to quickly resume
- Quick navigation from profile to reader

## Database Schema

The implementation uses the existing `user_books` table:

```sql
user_books table:
- id: uuid (primary key)
- user_id: uuid (foreign key to auth.users)
- book_id: integer (foreign key to books)
- status: text ('not_started', 'reading', 'completed')
- last_page: integer (0-100, representing percentage)
- is_favorite: boolean
- updated_at: timestamp (auto-updated by trigger)
```

**Key Field**: `last_page` stores reading percentage (0-100%) instead of byte offsets for simplicity.

## Architecture

### Service Layer: `readingProgressService.js`

Located in `/services/readingProgressService.js`, provides these methods:

#### `saveProgress(userId, bookId, { scrollPosition, contentLength, status })`
- Calculates percentage: `(scrollPosition / contentLength) * 100`
- Upserts user_books record with `last_page = percentage`
- Handles unique constraint on (user_id, book_id)
- Returns: `{ success: true, percentage: number }`

#### `getProgress(userId, bookId)`
- Fetches status and last_page for a single book
- Returns: `{ status, percentage, updatedAt }`
- Defaults to `{ status: 'not_started', percentage: 0 }` if no record

#### `getCurrentlyReading(userId)`
- Fetches all books with status='reading'
- Joins books table for full book data
- Returns array with content for reader
- Ordered by most recent

#### `getFinishedReading(userId)`
- Fetches all completed books
- Similar structure to getCurrentlyReading

#### `calculatePosition(percentage, contentLength)`
- Utility to convert percentage back to pixels
- Used for scroll restoration: `position = (percentage/100) * contentLength`

### Screen Updates

#### ReaderScreen.js
**Changes:**
- Added scroll tracking via `onScroll` handler
- Measures content height via `onContentSizeChange`
- Throttled auto-save on scroll (500ms)
- Restores position on mount
- Auto-save on component unmount
- Progress bar in header showing percentage
- Loading overlay while restoring position

**Props:**
- `book`: Book object with content
- `onClose`: Callback to close reader
- `session`: Auth session object (NEW)

**State:**
- `contentHeight`: Total content size in pixels
- `savedProgress`: Fetched progress data
- `isRestoringPosition`: Loading state

**Refs:**
- `scrollViewRef`: Reference to ScrollView for manual scrolling
- `scrollTimeoutRef`: Throttle timer for saves
- `lastScrollPositionRef`: Track current scroll position

#### ProfileScreen.js
**Changes:**
- Enhanced BookCard component to show progress
- Added `readingProgress` state to store percentages
- Updated `loadBookData()` to fetch `last_page` values
- Added progress section to cards:
  - Progress bar visualization
  - Percentage display
  - "Continue Reading" button
- Connected `onRead` callback for navigation

**New Props:**
- `onRead`: Callback to open reader (NEW)

**New State:**
- `readingProgress`: Object mapping bookId -> percentage

**Enhanced BookCard Props:**
- `showProgress`: Boolean to show progress UI
- `onContinueReading`: Callback when button pressed

#### App.js
**Changes:**
- Pass `onRead` callback to ProfileScreen
- Pass `session` to ReaderScreen
- Handle "Continue Reading" navigation

**Flow:**
```
ProfileScreen (onRead) → Sets selectedBook
                      → Sets showReader = true
                      → ReaderScreen renders with session
```

## User Flow

### Reading a Book
1. User opens book from BookListScreen or ProfileScreen
2. ReaderScreen opens with saved progress
3. Progress bar in header shows percentage
4. User scrolls to read
5. Position auto-saves every 500ms (throttled)
6. Progress bar updates in header
7. On exit, final position auto-saves
8. Position restored when book reopened

### Continue Reading from Profile
1. Profile tab shows "Currently Reading" section
2. Books display with progress bar and percentage
3. "Continue Reading" button appears
4. User taps button
5. Reader opens with position already restored
6. User continues from last read location

## Security

### Row-Level Security (RLS)
The database enforces RLS policies:
- Users can only read/update their own `user_books` rows
- User ID is always filtered in queries: `.eq('user_id', session.user.id)`
- The `on_conflict` update only affects user's own records

### Service Layer Security
- `readingProgressService` receives `userId` explicitly
- All queries filter by `user_id` before updating/reading
- No cross-user data leakage possible

## Performance Optimizations

### Throttled Saves
- Scroll events trigger save every 500ms max
- Prevents excessive database writes
- Improves UI responsiveness
- Still saves on screen exit for final position

### Percentage-Based Storage
- Simpler calculation than byte offsets
- Consistent across devices (independent of rendering)
- Human-readable in database (0-100)
- Survives content updates with minor inaccuracies

### Lazy Loading
- Progress loaded on-demand in ReaderScreen
- Not fetched on ProfileScreen list display
- Percentage stored with each book in loadBookData()

## Error Handling

### ReaderScreen
- Gracefully handles missing progress (defaults to 0)
- Console logs errors without breaking UX
- Shows loading state during restoration
- Continues reading if restoration fails

### ProfileScreen
- Stores progress map during loadBookData()
- Silently ignores missing percentages
- Continues operation if service fails

### Service Layer
- Try/catch blocks with console logging
- Returns sensible defaults on error
- Doesn't break if Supabase connection fails

## Testing Checklist

- [ ] Read a book and close - progress saves
- [ ] Reopen book - scrolls to saved position
- [ ] Read more and exit - new position saves
- [ ] Progress bar shows accurate percentage
- [ ] Profile "Continue Reading" appears for active reads
- [ ] Button opens reader with position restored
- [ ] Multiple books track separately
- [ ] Completed/to-read books don't show progress
- [ ] Works offline/slow connection (graceful degradation)
- [ ] Progress persists across app restarts

## Troubleshooting

### Progress Not Saving
1. Check Supabase connection
2. Verify session.user.id is passed correctly
3. Check browser console for service errors
4. Ensure `last_page` field exists in user_books

### Position Not Restoring
1. Confirm progress was saved (check DB)
2. Verify content height is measured correctly
3. Check if contentHeight > 0 before calculating position
4. Look for scroll-related errors in console

### Progress Bar Not Showing
1. Ensure readingProgress state is populated
2. Verify book.status === 'reading'
3. Check if readingProgress[book.id] is defined
4. Verify BookCard showProgress prop is true

## Future Enhancements

- [ ] Sync progress across devices
- [ ] Reading speed analytics
- [ ] Time estimates to finish
- [ ] Pause/bookmark functionality
- [ ] Notes and highlights
- [ ] Reading statistics dashboard
- [ ] Cloud backup for progress

## Database Queries

### Save Progress
```sql
INSERT INTO user_books (user_id, book_id, status, last_page, updated_at)
VALUES (?, ?, 'reading', ?, NOW())
ON CONFLICT (user_id, book_id) 
DO UPDATE SET last_page = ?, updated_at = NOW();
```

### Get Progress
```sql
SELECT status, last_page, updated_at 
FROM user_books 
WHERE user_id = ? AND book_id = ?;
```

### Get Currently Reading
```sql
SELECT ub.id, ub.book_id, ub.status, ub.last_page, ub.updated_at, 
       b.id, b.title, b.author, b.cover_url, b.content
FROM user_books ub
JOIN books b ON ub.book_id = b.id
WHERE ub.user_id = ? AND ub.status = 'reading'
ORDER BY ub.updated_at DESC;
```

## Files Modified

- `screens/ReaderScreen.js` - Added scroll tracking and progress restoration
- `screens/ProfileScreen.js` - Added progress display and Continue Reading
- `App.js` - Connected navigation between screens
- `services/readingProgressService.js` - Reading progress management service

## Summary

The "Continue Reading" feature is fully integrated and secure:
- ✅ Automatic progress tracking
- ✅ Seamless resume from last position
- ✅ Progress visibility in profile
- ✅ RLS-enforced security
- ✅ Throttled saves for performance
- ✅ Graceful error handling
- ✅ No manual saves required
