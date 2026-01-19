  # 🚀 SETUP INSTRUCTIONS - Book Club App

## STEP 1: Update Your Supabase Database

You need to add new profile columns to support the modern dashboard. Choose ONE option:

### OPTION A: Add Missing Columns (If you already have data)

Run this in **Supabase → SQL Editor**:

```sql
-- Add missing columns to profiles table (safe - only adds if they don't exist)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### OPTION B: Fresh Install (Delete everything and start over)

Run this in **Supabase → SQL Editor**:

1. Delete all tables first (if any):
```sql
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS user_books CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

2. Then run the complete **setup-supabase-tables.sql** file from the project root

This will create:
- ✅ Profiles table with all new columns (full_name, username, avatar_url, bio)
- ✅ Books table with 40+ carefully curated books
- ✅ User_books table for tracking reading status
- ✅ Reviews table for user ratings
- ✅ All RLS policies for security
- ✅ Auto-create profile triggers

---

## STEP 2: Create Storage Bucket for Avatars

1. **Go to Supabase Dashboard**
2. **Storage** → **New Bucket**
3. **Name:** `avatars` (exactly this)
4. **Make it Public:** Toggle ON (so avatar images can be accessed)
5. **Create**

---

## STEP 3: Test the App

1. **Stop Expo** (Ctrl+C in terminal)
2. **Start Expo again:**
   ```bash
   cd Book-Club
   npm install  # If you haven't already
   expo start -c
   ```
3. **Press 'w'** to open web version or use your mobile app

---

## STEP 4: Login and Try the App

### First Time:
1. Click **Register**
2. Enter email and password
3. After login, you'll see the **Books tab** first (home screen)
4. Click the **Profile tab** at the bottom to go to your profile

### Profile Tab Features:
- **Edit Profile** button to add:
  - Full Name *
  - Username (optional)
  - Bio (optional)
  - Upload Avatar (click camera button)
- **5 organized sections:**
  - Currently Reading
  - To Read
  - Finished
  - My Reviews
  - Favorites

### Books Tab Features:
- Browse 40+ books across multiple genres
- Search by title, author, or genre
- Filter by genre with chips
- Status badges (To Read, Reading, Finished)
- Mark books as reading, write reviews, categorize

---

## What Changed in This Update

### ✨ New Features:
- Modern gradient header with profile button
- Professional profile dashboard
- Avatar upload capability
- Editable profile information
- 5 organized book sections
- Bottom tab navigation (Profile | Books)
- 40+ curated books from different genres

### 🎨 Design Improvements:
- Clean, modern color palette
- Better spacing and typography
- Gradient header with blue theme
- Professional card layouts
- Smooth transitions and animations
- Production-quality UI

### 🔧 Technical Improvements:
- Better error handling for missing columns
- Graceful fallback for optional fields
- Improved database queries
- RLS security policies
- Auto-create profile on signup

---

## 📚 Books Added

The database now includes 40+ books across:
- **Classic Literature** (To Kill a Mockingbird, Pride and Prejudice, Jane Eyre, etc.)
- **Modern Classics** (One Hundred Years of Solitude, The Catcher in the Rye)
- **Dystopian** (1984, Brave New World, Fahrenheit 451)
- **Science Fiction** (Dune, Neuromancer, The Foundation Series, Ender's Game)
- **Fantasy** (Lord of the Rings, A Game of Thrones, Harry Potter, etc.)
- **Mystery & Thriller** (The Girl with the Dragon Tattoo, Sherlock Holmes)
- **Literary Fiction** (The Kite Runner, Life of Pi, The Book Thief)
- **Contemporary Fiction** (The Midnight Library, Verity, It Ends with Us)
- **Drama & Poetry** (Shakespeare, Montaigne)

---

## 🐛 Troubleshooting

### Error: "column profiles.full_name does not exist"
- Run the SQL from **STEP 1 OPTION A**
- Or run the full setup from **STEP 1 OPTION B**
- Then reload the app

### Error: "No books showing"
- Make sure you ran the SQL that includes the book inserts
- Check the Books page - if it's loading, wait a moment
- Refresh the app with 'r' in Expo

### Avatar not uploading
- Make sure the "avatars" storage bucket is created and PUBLIC
- Check that expo-image-picker is installed (`npm list expo-image-picker`)
- Try a smaller image file

### Profile data not saving
- Make sure your user ID matches in the profiles table
- Check that RLS policies allow your user to update
- Try logging out and back in

---

## ✅ Verification Checklist

- [ ] SQL migration applied to Supabase
- [ ] "avatars" storage bucket created and PUBLIC
- [ ] App reloaded and running
- [ ] Can register and login
- [ ] Can see Books tab with 40+ books
- [ ] Can click on Profile tab
- [ ] Can edit profile information
- [ ] Can upload an avatar
- [ ] Can search and filter books
- [ ] Can mark books as reading/finished
- [ ] Can write reviews with ratings

---

## 🎉 Congratulations!

Your Book Club app is now production-ready with:
- Modern, professional UI
- User profiles with avatar uploads
- 40+ curated books
- Organized reading tracking
- Professional design patterns

Enjoy your Book Club experience! 📚✨
