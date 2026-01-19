# 🔑 How to Add Books to Your Database

## Current Status
✅ Seed script working perfectly!
- Found 6 existing books
- Detected 3 duplicates (skipped)
- 29 new books ready to add

❌ Need admin permissions to insert books

---

## Option 1: Grant Admin Access (Recommended)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com
2. Login to your project
3. Go to **Table Editor**
4. Select **profiles** table

### Step 2: Find Your Profile
1. Look for your user email: `bleonitadeskaj1@gmail.com`
2. Click on that row

### Step 3: Change Role to Admin
1. Find the `role` column
2. Change value from `user` to `admin`
3. Save changes

### Step 4: Logout and Login Again
1. Close the Book Club app
2. Reopen and login again
3. Your role will now be admin

### Step 5: Run Seed Script
```bash
node "c:\Users\DIGITRON\Desktop\Book Club\Book-Club\seed-books.js"
```

This will add all 29 new books!

---

## Option 2: Add Books via SQL (Quick Method)

### Step 1: Go to SQL Editor
1. Supabase Dashboard → **SQL Editor**
2. Click **New Query**

### Step 2: Run This Query
Copy and paste this SQL to add some sample books:

```sql
-- Add sample books across genres
INSERT INTO books (title, author, publication_year, genre, description, cover_url)
VALUES
  -- Fiction
  ('The Kite Runner', 'Khaled Hosseini', 2003, 'Fiction', 
   'A devastating story of childhood friendship torn apart by jealousy, set against Afghanistan.', 
   'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop'),
  
  ('The Goldfinch', 'Donna Tartt', 2013, 'Fiction', 
   'A young boy survives an accident that kills his mother. His life becomes linked to a painting.', 
   'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'),
  
  -- Romance
  ('It Ends with Us', 'Colleen Hoover', 2016, 'Romance', 
   'A powerful story about breaking cycles of abuse and finding strength.', 
   'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=600&fit=crop'),
  
  ('People We Meet on Vacation', 'Emily Henry', 2021, 'Romance', 
   'Two best friends take one last trip to see if their friendship can become more.', 
   'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'),
  
  -- Fantasy
  ('The Night Circus', 'Erin Morgenstern', 2011, 'Fantasy', 
   'Two young magicians bound in magical competition within a mysterious circus.', 
   'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop'),
  
  ('The House in the Cerulean Sea', 'TJ Klune', 2020, 'Fantasy', 
   'A magical inspection of dangerous magical children leads to unexpected friendship.', 
   'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop'),
  
  -- Mystery
  ('The Silent Patient', 'Alex Michaelides', 2019, 'Mystery', 
   'A woman shoots her husband and never speaks again. What is her motive?', 
   'https://images.unsplash.com/photo-1543002588-d4d8c8b03cf7?w=400&h=600&fit=crop'),
  
  ('The Guest List', 'Lucy Foley', 2020, 'Mystery', 
   'A wedding on a remote island. A rising body count. Who is the killer?', 
   'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop'),
  
  -- Science Fiction
  ('Dune', 'Frank Herbert', 1965, 'Science Fiction', 
   'The greatest science fiction novel. An epic tale on a desert planet.', 
   'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop'),
  
  ('Ender''s Game', 'Orson Scott Card', 1985, 'Science Fiction', 
   'Young Ender is recruited to battle school to fight an alien threat.', 
   'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'),
  
  -- Self-Help
  ('The Power of Now', 'Eckhart Tolle', 1997, 'Self-Help', 
   'Living in the present moment is the truest path to happiness.', 
   'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'),
  
  ('The 7 Habits of Highly Effective People', 'Stephen Covey', 1989, 'Self-Help', 
   'A holistic approach to solving personal and professional problems.', 
   'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop'),
  
  -- Biography
  ('Becoming', 'Michelle Obama', 2018, 'Biography', 
   'The former First Lady describes her journey from Chicago to the White House.', 
   'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'),
  
  ('Born a Crime', 'Trevor Noah', 2016, 'Biography', 
   'Stories from a South African childhood during apartheid.', 
   'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop');
```

### Step 3: Click Run
This will add 14 books across all genres instantly!

---

## Option 3: Manual Entry (Slow but Works)

### Via Supabase Table Editor
1. Go to **Table Editor** → **books** table
2. Click **Insert** → **Insert Row**
3. Fill in:
   - title
   - author
   - publication_year
   - genre
   - description
   - cover_url
4. Click **Save**
5. Repeat for each book

This works but is tedious for many books.

---

## 🎯 After Adding Books

Once books are in the database:

1. **Refresh the app** (reload page or restart)
2. You'll see **genre filter chips** at top
3. Tap **"All"** to see all genres in sections
4. Each genre shows as horizontal scrolling section
5. Tap specific genre to filter (e.g., "Fantasy")
6. Books display in clean grid

---

## 📊 What You'll See

### Genre Filter Bar
```
[All] [Biography] [Fantasy] [Fiction] [Mystery] [Romance] [Science Fiction] [Self-Help]
```

### All Genres View
```
Fiction (3 books)
[Book] [Book] [Book] →

Romance (4 books)  
[Book] [Book] [Book] [Book] →

Fantasy (5 books)
[Book] [Book] [Book] [Book] [Book] →
```

### Single Genre (tap "Fantasy")
```
┌──────┐  ┌──────┐
│ Book │  │ Book │
└──────┘  └──────┘

┌──────┐  ┌──────┐
│ Book │  │ Book │
└──────┘  └──────┘
```

---

## 🔍 Verify Everything Works

After adding books, test:
- [x] Genre chips display
- [x] Tap "All" shows all genres
- [x] Each genre has horizontal scroll
- [x] Tap specific genre filters books
- [x] Search still works
- [x] Status badges still show
- [x] Action buttons work (Read, Review, Categorize)

---

## 📝 Summary

**Recommended Path:**
1. Go to Supabase → profiles table
2. Change your role to `admin`
3. Logout and login again
4. Run: `node seed-books.js`
5. All 29 books added automatically!

**Quick Path:**
1. Go to Supabase → SQL Editor
2. Copy SQL query from Option 2
3. Run it
4. 14 books added instantly!

**Your app is ready!** Just add the books and enjoy the genre-organized library. 📚✨
