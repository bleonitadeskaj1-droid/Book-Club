# 🚨 CRITICAL: Apply Fixed Schema Now!

## The Problem
Your database has an **infinite recursion bug** in the RLS policies. This prevents ANY access to the books table.

## The Solution
I've fixed the schema, but you MUST apply it to Supabase.

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/vfikxuftsgozbqiemmut
- Login to your account

### 2. Open SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"** (or open an existing one)

### 3. Clear Existing Schema (IMPORTANT!)
Before applying the new schema, you need to clean up the old broken policies:

```sql
-- DROP EXISTING POLICIES (run this first)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;
DROP POLICY IF EXISTS "Admins can view all user_books" ON user_books;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;

-- DROP EXISTING FUNCTIONS
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.is_admin();
```

### 4. Apply the Fixed Schema
- Copy the **ENTIRE** contents of `book-club-schema.sql`
- Paste it into the SQL Editor
- Click **"Run"** (or press Ctrl+Enter)

### 5. Verify the Fix
After applying the schema, run:
```bash
node verify-database.js
```

You should see:
```
✅ Books table accessible, found 3 books:
✅ Profiles table properly protected
✅ User_books table properly protected
✅ Reviews accessible for reading (public access)
```

## What Was Fixed
- **Before**: Admin policies caused infinite recursion by querying `profiles` table
- **After**: Created `is_admin()` security definer function to break the recursion

## If You Still Get Errors
1. Make sure you ran the DROP statements first
2. Re-run the entire `book-club-schema.sql`
3. Check Supabase logs for any errors
4. Try refreshing your browser and running the verification again

---
**DO NOT PROCEED** until you see the verification script pass! The infinite recursion will break everything. 📚🔧