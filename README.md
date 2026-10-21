# Book Club

A book club app for browsing a shared library, tracking what you are reading, writing reviews, and managing the catalog. Built with Expo and Supabase.

## What you can do

- Browse and search books without an account
- Register, sign in, and reset a password
- Save a book as reading, finished, or to-read, and keep a page
- Review and rate a book, and mark favorites
- As an admin, add and edit books, see members, and remove reviews

Admin is a role on `profiles`, not an email address. After the first signup, promote that account in the Supabase SQL editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'you@example.com'
);
```

## Stack

- Expo SDK 54, React Native, React 19
- Supabase Auth and Postgres, with row-level security
- The app uses only the anon key. Database rules decide what each person can change.

## Setup

1. Create a Supabase project and turn off email confirmation while you are developing.
2. Run `supabase/schema.sql` once in the SQL editor.
3. Copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app reads those values from `.env`. Until they point at a live project, the home screen shows a small sample library so the app can still be opened and read.

4. Install and start:

```bash
npm install
npx expo start
```

Press `w` for the browser, or scan the QR code with Expo Go.

If this database already exists, do not run the full schema again. Promote an admin with the SQL above, and add any missing profile columns from the Supabase dashboard.

## Security

Rotate the Supabase service-role key in the project settings. An older version of this repository contained that key in the client. The service role must never ship in the app. The anon key is safe to publish because row-level security limits it.
