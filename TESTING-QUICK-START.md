# Quick Start Testing Checklist

## ⚡ 5-Minute Setup

### Step 1: Verify Database (2 mins)
1. Open Supabase Dashboard → SQL Editor
2. Copy ALL queries from below
3. Paste into SQL Editor and run
4. ✅ Check all results

```sql
-- Copy and run this entire block in Supabase SQL Editor --

-- Check 1: Trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check 2: Function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- Check 3: Profiles table exists
SELECT COUNT(*) as profile_count FROM profiles;

-- Check 4: RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check 5: Admin user exists (if none, you'll see 0 rows - that's OK)
SELECT id, full_name, role FROM profiles WHERE role = 'admin' LIMIT 1;

-- Check 6: Recent profiles
SELECT id, full_name, role, created_at FROM profiles 
ORDER BY created_at DESC LIMIT 5;
```

**Expected Results:**
- Check 1: Should see `on_auth_user_created` ✅
- Check 2: Should see `handle_new_user` ✅
- Check 3: Should see number > 0 ✅
- Check 4: Should see `rowsecurity = true` ✅
- Check 5: May be empty (that's OK) ✅
- Check 6: Shows recent users ✅

---

## 🧪 15-Minute Testing Sequence

### Test A: New User Signup
```
1. Open app on phone/emulator
2. Tap "Go to Login"
3. Tap "Don't have an account? Register"
4. Enter:
   - Email: testuser_YYYYMMDD@example.com (use today's date)
   - Password: SecurePass123!
   - Confirm: SecurePass123!
5. Tap "Register"

✅ Expected: Success message, auto-navigate to login
❌ If fails: Check console for errors
```

### Test B: Verify Profile Created
```
1. Go to Supabase Dashboard
2. Go to Table Editor → profiles
3. Look for your test email (or click Sort by created_at DESC)

✅ Expected: New profile exists with role='user'
❌ If missing: Trigger didn't run (see troubleshooting)
```

### Test C: Login as New User
```
1. In app LoginScreen, enter:
   - Email: testuser_YYYYMMDD@example.com
   - Password: SecurePass123!
2. Tap "Login"

✅ Expected: Login success, see Books tab
❌ Expected NOT to see: Admin tab
❌ If fails: Check Supabase auth logs
```

### Test D: Admin Access (if you have admin user)
```
1. Set yourself as admin in Supabase:
   UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
2. Logout from app
3. Login again

✅ Expected: Admin tab now visible
❌ If not visible: Logout/login again or hard-refresh
4. Tap Admin tab
5. Verify you see: Books, Users, Reviews, Analytics sections
```

### Test E: Logout
```
1. In AdminScreen or any screen, look for red logout icon
2. Tap it
3. Confirm alert

✅ Expected: Return to login, fully logged out
❌ If fails: Check console, may need app restart
```

---

## 🔍 Debugging Quick Reference

### Problem: New user created but no profile
**SQL to check:**
```sql
-- Find the user
SELECT id, email, created_at FROM auth.users 
ORDER BY created_at DESC LIMIT 1;

-- See if profile exists for that ID
SELECT * FROM profiles WHERE id = 'PASTE_USER_ID_HERE';

-- If no profile, the trigger didn't run
-- Manual fix:
INSERT INTO profiles (id, role) 
VALUES ('PASTE_USER_ID_HERE', 'user');
```

### Problem: User logs in but no Admin tab
**Check:**
```sql
-- Verify role is 'admin'
SELECT id, full_name, role FROM profiles WHERE id = 'USER_ID_HERE';

-- If role is 'user', change it:
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';

-- Then logout/login in app to refresh
```

### Problem: AdminScreen shows error
**Check console:**
- Android: `adb logcat | grep -i book`
- iOS: Use Xcode console
- Or use Expo CLI console directly

**Common errors:**
- "column profiles.email does not exist" → fetchUsers() bug (should be fixed)
- "could not find relationship" → fetchReviews() bug (should be fixed)
- "invalid uuid" → UUID validation error (should be caught silently)

### Problem: Can't create/edit/delete
**Check:**
```sql
-- Verify admin role
SELECT role FROM profiles WHERE id = 'YOUR_ID';

-- Verify books table exists
SELECT COUNT(*) FROM books;

-- Try manual insert
INSERT INTO books (title, author, genre, cover_url) 
VALUES ('Test', 'Author', 'Test', 'https://example.com/book.jpg');
```

---

## 📊 Full Test Matrix (Detailed)

| Test | Steps | Pass Condition | Notes |
|------|-------|---|---|
| **Signup** | Register → New email → Confirm password | Profile created in DB, success message | Check profiles table for new row |
| **Profile Auto-Create** | Check Supabase profiles table | New row exists with role='user' | Should happen in < 1 second |
| **New User Login** | Login as test user | Land on Books screen | Admin tab should NOT appear |
| **Admin Login** | Set role='admin' → Login | Land on Books or Admin | Admin tab should appear |
| **Admin Access** | Click Admin tab | See Books/Users/Reviews sections | Should load without errors |
| **Book CRUD** | Add/Edit/Delete book | Immediate state update | Check database to verify |
| **User Edit** | Edit user → Change role | Role updates immediately | Verify in profiles table |
| **Review Delete** | Delete review | Disappears immediately | Check reviews table to verify |
| **Logout** | Tap logout → Confirm | Return to login screen | Session should be cleared |
| **Role Persistence** | Make user admin → Logout → Login | User still admin | Verify role='admin' in profiles |
| **Permission Check** | Regular user tries to see Admin | Admin tab NOT visible | Should block access |
| **UI Quality** | View on mobile | No horizontal scroll, readable text | Test on actual phone if possible |
| **Performance** | Load admin screen | < 2 second load time | Check console for slow queries |

---

## ✅ Sign-Off Template

Copy and save after testing:

```
TEST DATE: ____________
TESTER: ____________

DATABASE VERIFICATION:
☐ Trigger on_auth_user_created exists
☐ Function handle_new_user exists
☐ Profiles table has rows
☐ RLS enabled on profiles
☐ No RLS errors in logs

FUNCTIONALITY TESTS:
☐ New signup creates profile
☐ New user can login
☐ New user sees Books (not Admin)
☐ Admin can login
☐ Admin sees Admin tab
☐ Admin can create book
☐ Admin can edit book
☐ Admin can delete book
☐ Admin can edit user role
☐ Admin can delete review
☐ Logout works
☐ User stays logged in after restart
☐ Regular user can't access admin

QUALITY CHECKS:
☐ No UI overflow on mobile
☐ All buttons tappable (44px+)
☐ Load times < 2 seconds
☐ No crashes or errors
☐ Smooth scrolling and transitions
☐ Professional appearance

ISSUES FOUND:
(List any bugs, incomplete features, or concerns)
1. 
2. 
3. 

OVERALL STATUS: ☐ PASS  ☐ FAIL  ☐ PARTIAL

NOTES:
________________________________________________________________________
________________________________________________________________________

APPROVED FOR PRODUCTION: ☐ YES  ☐ NO
```

---

## 🚀 Ready to Deploy Checklist

Before going to app store, verify:

- [ ] All signup users get profiles auto-created
- [ ] All users land on correct screen based on role
- [ ] All admin functions work (CRUD)
- [ ] Logout is complete (can't access protected screens after)
- [ ] Mobile UI is responsive (tested on actual device)
- [ ] App doesn't crash during normal use
- [ ] Loading times are acceptable
- [ ] Error messages are clear and helpful
- [ ] No sensitive data in console logs
- [ ] Database backups are configured
- [ ] Supabase project has monitoring/alerts

---

## 📞 If Something Breaks

### Step 1: Check the Logs
```
Console: Look for red errors
Supabase Dashboard: Check real-time logs
React Native: Check console output
```

### Step 2: Identify the Issue
```
User signup failing? → Check auth logs + profiles table
Admin can't see users? → Check fetchUsers() query + RLS policies
Logout not working? → Check localStorage/AsyncStorage clear
```

### Step 3: Use These Queries to Debug
```sql
-- See all auth users
SELECT email, created_at FROM auth.users ORDER BY created_at DESC;

-- See all profiles
SELECT id, full_name, role, created_at FROM profiles ORDER BY created_at DESC;

-- Find a specific user
SELECT * FROM profiles WHERE email LIKE 'test%';

-- Check RLS policy
SELECT policyname, qual FROM pg_policies WHERE tablename = 'profiles';

-- Count mismatches (users without profiles)
SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM profiles);
```

### Step 4: Manual Fixes
```sql
-- Create missing profile
INSERT INTO profiles (id, role) VALUES ('USER_ID', 'user');

-- Fix user role
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID';

-- Delete test data
DELETE FROM profiles WHERE created_at > NOW() - INTERVAL '1 day';
```

---

## 🎯 Success!

If you've completed all tests above with ✅ checks, you're ready to:
1. Build APK/IPA (expo build or eas build)
2. Upload to app stores
3. Go live!

Congratulations! 🎉
