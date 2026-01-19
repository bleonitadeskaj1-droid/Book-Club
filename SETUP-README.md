# Book Club App - Backend Setup Guide

## � IMPORTANT: If you see "infinite recursion" errors...

**STOP!** You have a critical bug in your database schema. Follow `FIX-SCHEMA-NOW.md` **immediately** before continuing.

## �🚀 Quick Start

Your Book Club app backend foundation is ready! Follow these steps to get everything working:

### 1. Apply Database Schema

**You MUST complete this step first** - the database schema needs to be applied to Supabase.

1. Open your Supabase dashboard: https://supabase.com/dashboard/project/vfikxuftsgozbqiemmut
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `book-club-schema.sql`
5. Click **Run** (or press Ctrl+Enter)

This will create all tables, RLS policies, triggers, and sample data.

### 2. Verify Setup

After applying the schema, run the verification script:

```bash
node verify-database.js
```

You should see:
- ✅ Books table accessible with sample data
- ✅ Profiles table properly protected
- ✅ User_books table properly protected
- ✅ Reviews table properly protected

### 3. Test Authentication

The app supports:
- **User registration/login** with email/password
- **Role-based access**: `user` and `admin` roles
- **Automatic profile creation** when users register

### 4. Database Structure

#### Tables Created:
- `profiles` - User profiles with roles
- `books` - Public book catalog
- `user_books` - User's personal book lists (favorites, reading status)
- `reviews` - User book reviews

#### Security Features:
- **Row Level Security (RLS)** enabled on all tables
- **Public read access** to books catalog
- **Authenticated access only** for user data
- **Admin-only access** for user management

#### Automatic Features:
- Profile creation trigger on user signup
- Timestamp updates on data changes
- UUID primary keys for all tables

### 5. Next Steps

Once the database is set up:

1. **Test user registration** - Create a test account
2. **Test admin features** - Create an admin user
3. **Build the frontend** - React Native/Expo app
4. **Add book management** - Admin can add/edit books
5. **Implement user features** - Favorites, reviews, reading lists

### 6. Files Overview

- `book-club-schema.sql` - Complete database schema
- `database-access-rules.md` - Security and access documentation
- `verify-database.js` - Database verification script
- `package.json` - Dependencies (Supabase client included)

### 7. Troubleshooting

**If verification fails:**
- Make sure you ran the SQL schema in Supabase
- Check Supabase logs for any errors
- Verify your connection keys are correct

**If authentication doesn't work:**
- Check that RLS policies are enabled
- Verify profile creation trigger is working
- Test with Supabase Auth dashboard

---

## 📱 Frontend Development

After backend setup is complete, you can start building the React Native app with:

- Authentication screens (Login/Register)
- Book browsing (public access)
- User dashboard (requires login)
- Admin panel (admin role required)
- Book management features

The foundation is solid - let's build an amazing Book Club app! 📚✨