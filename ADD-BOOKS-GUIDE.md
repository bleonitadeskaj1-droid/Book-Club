# How to Add More Books to Your Book Club App

## Overview
A SQL script has been created with 27 new books across different genres. Follow the steps below to add them to your Supabase database.

## File Location
- **SQL File:** `add-more-books.sql`
- Located in: `/Book-Club/add-more-books.sql`

## Books Added
The script includes books in the following genres:
- **Romance** (4 books): The Notebook, Pride and Prejudice, Outlander, The Time Traveler's Wife
- **Science Fiction** (4 books): Dune, The Martian, Foundation, Neuromancer
- **Fantasy** (4 books): The Fellowship of the Ring, A Game of Thrones, The Name of the Wind, Mistborn
- **Mystery** (4 books): The Girl with the Dragon Tattoo, The Murder of Roger Ackroyd, Gone Girl, The Da Vinci Code
- **Thriller** (3 books): The Silence of the Lambs, The Girl on the Train, Rebecca
- **Historical Fiction** (3 books): The Book Thief, All the Light We Cannot See, The Nightingale
- **Adventure** (3 books): Sherlock Holmes, Treasure Island, The Count of Monte Cristo
- **Contemporary Fiction** (3 books): The Midnight Library, Where the Crawdads Sing, The Seven Husbands of Evelyn Hugo

**Total: 31 new books**

## Steps to Add Books

### Option 1: Using Supabase SQL Editor (RECOMMENDED)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Open the `add-more-books.sql` file on your computer
5. Copy the entire SQL code
6. Paste it into the Supabase SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for the confirmation message: "Query successful"

### Option 2: Using Supabase CLI

1. Open terminal in your Book-Club directory
2. Run the following command:
   ```bash
   supabase db execute --file add-more-books.sql
   ```

### Option 3: Manual Database Insert

1. Go to Supabase > Table Editor
2. Select the `books` table
3. Click **Insert** and manually add each book entry

## After Adding Books

1. **Restart Expo:** Press `Ctrl+C` in your Expo terminal and run `expo start -c`
2. **Reload App:** Refresh your app in the Expo client
3. **Check Books:** Navigate to the Home screen and scroll through the genre sections
4. **Test Filters:** Click different genre buttons to verify all books appear correctly

## Troubleshooting

**Error: "Duplicate key value violates unique constraint"**
- This means some books already exist in your database
- The SQL script has `ON CONFLICT DO NOTHING` to prevent duplicates
- This is safe to ignore

**Books not appearing:**
1. Clear your app cache: `expo start -c`
2. Reload the app in Expo
3. Check if you're logged in (books only load for authenticated users)

**Missing book covers:**
- The script includes cover URLs from OpenLibrary
- Some URLs might not work if the API is down
- Books will still display with a placeholder icon

## Database Changes

The script does NOT modify your database schema. It only adds new rows to the existing `books` table.

### Columns Used:
- `title` - Book title
- `author` - Author name
- `genre` - Book category (Romance, Science Fiction, etc.)
- `description` - Short book summary
- `publication_year` - Year published
- `cover_url` - Link to book cover image

All other columns will use default values.

## Need Help?

If you encounter any issues:
1. Check that you're logged into Supabase
2. Verify your database connection is working
3. Ensure you have write permissions on the `books` table
4. Check your Expo console for any error messages

---

**Happy Reading! 📚**
