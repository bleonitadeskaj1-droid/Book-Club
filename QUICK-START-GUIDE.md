# Quick Start: Page Navigation & Profile Fixes

## Step 1: Update Database Schema

### Option A: New Database
The schema is already correct in `book-club-schema.sql` with:
- profiles table has full_name, username, avatar_url, bio columns
- user_books table has current_page, total_pages columns

### Option B: Existing Database
Run the migration in Supabase SQL Editor:

```sql
-- Copy contents of DATABASE-MIGRATION.sql
-- Paste into Supabase SQL Editor
-- Execute
```

**Verify it worked:**
```sql
-- Check profiles has new columns
SELECT * FROM profiles LIMIT 1;

-- Check user_books has page columns
SELECT * FROM user_books LIMIT 1;
```

---

## Step 2: Test Reading with Pages

1. **Start the app:**
   ```bash
   cd "Book Club"
   npm start
   # or
   expo start -c
   ```

2. **Read a book:**
   - Go to Books tab
   - Select any book
   - Click "Read"
   - You should see: "Page 1 of X"
   - Click "Next Page" button

3. **Verify it saves:**
   - Go to page 5
   - Close the app
   - Reopen the book
   - Should resume at page 5

4. **Check database:**
   - Open Supabase dashboard
   - Go to user_books table
   - Find your book record
   - Should see: current_page = 5, total_pages = X

---

## Step 3: Test Profile Persistence

1. **Open Profile:**
   - Go to Profile tab
   - Click "Edit Profile"

2. **Edit fields:**
   - Change Full Name
   - Change Username
   - Add Bio
   - Upload Avatar (optional)

3. **Save:**
   - Click "Save Changes"
   - Wait for "Profile updated successfully" alert

4. **Verify persistence:**
   - Close edit mode
   - Navigate away (go to Books tab)
   - Come back to Profile
   - Data should still be there

5. **Check database:**
   - Supabase → profiles table
   - Find your user record
   - Verify full_name, username, bio saved

---

## Step 4: Test Error Handling

### Scenario 1: Missing Full Name
1. Delete Full Name field
2. Click Save
3. Should see: "Full name is required"

### Scenario 2: Network Error
1. Turn off internet
2. Try to save profile
3. Should see error alert
4. Turn internet back on, retry

---

## Configuration Options

### Adjust Page Size
In `ReaderScreen.js`, line ~52:
```javascript
const WORDS_PER_PAGE = 250; // Change this number

// Smaller = more pages
// Larger = fewer pages
```

### Adjust Avatar Size
In `ProfileScreen.js`, line ~172:
```javascript
quality: 0.7, // Change 0.0-1.0
// Higher = better quality but larger file
```

---

## Troubleshooting

### Pages show but don't save
```
❌ Problem: currentPage not persisting
✓ Solution: 
  1. Check Supabase connection
  2. Verify user_books has current_page column
  3. Check RLS policies allow UPDATE
```

### Profile changes reset
```
❌ Problem: Edit profile, save, data disappears
✓ Solution:
  1. Check profiles table has full_name column
  2. Verify UPSERT executed (check Supabase logs)
  3. Check auth.users.id matches profiles.id
```

### Page indicator wrong
```
❌ Problem: Shows "Page 0 of 0"
✓ Solution:
  1. Check book.content exists and has text
  2. Verify totalPages calculated correctly
  3. Check console for errors
```

### Avatar not uploading
```
❌ Problem: Avatar upload fails
✓ Solution:
  1. Check avatars bucket exists in Storage
  2. Check bucket has public access
  3. Check file size < 5MB
  4. Check CORS settings
```

---

## Feature Checklist

After implementation, verify:

### Reading
- [x] Pages calculated from content
- [x] Next/Previous buttons work
- [x] Page indicator shows correctly
- [x] Progress bar fills as reading
- [x] Current page saved on close
- [x] Page restored on reopen
- [x] Book title on first page
- [x] End marker on last page

### Profile
- [x] Full name saves
- [x] Username saves
- [x] Bio saves
- [x] Avatar uploads
- [x] Data persists after navigation
- [x] Data persists after app restart
- [x] Validation works (full name required)
- [x] Loading indicator shows
- [x] Success alert shows
- [x] Error handling works

---

## Performance Tips

1. **Large Books**: If a book has 50k+ words
   - Increase WORDS_PER_PAGE to 400
   - This reduces page count and render time

2. **Avatar Optimization**: 
   - Consider using lower quality (0.5-0.6)
   - Saves storage space

3. **Database Queries**:
   - Already indexed for performance
   - No N+1 issues

---

## Next Steps

1. ✅ Test both features thoroughly
2. ✅ Check Supabase logs for errors
3. ✅ Get user feedback on page size
4. ✅ Monitor performance

---

## Need Help?

Check these files for details:
- `PAGE-NAVIGATION-PROFILE-FIXES.md` - Complete documentation
- `DATABASE-MIGRATION.sql` - Schema changes
- `ReaderScreen.js` - Page navigation code
- `ProfileScreen.js` - Profile save code
- `readingProgressService.js` - Database service

---

**Status: Ready to Use** ✅
