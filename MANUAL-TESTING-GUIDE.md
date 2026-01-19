# Book Club App - Complete Manual Testing Guide

## Overview
This guide covers end-to-end testing of the Book Club application to verify all fixes are working correctly.

## Pre-Testing Checklist
- [ ] Supabase project is live and accessible
- [ ] Database trigger `on_auth_user_created` exists (run VERIFY-DATABASE.sql in Supabase Console)
- [ ] Profiles table has RLS enabled with proper policies
- [ ] Have a mobile device (Android/iOS) or emulator ready
- [ ] Expo Go or EAS Go app installed on device/emulator
- [ ] Have access to Supabase dashboard for real-time verification
- [ ] Have at least one test email address for signup

---

## Test 1: New User Signup & Profile Auto-Creation
**Objective:** Verify that new users can sign up and profiles are auto-created

### Steps:
1. Open the app on your device/emulator
2. On HomeScreen, tap "Go to Login"
3. On LoginScreen, tap "Don't have an account? Register"
4. Fill in RegisterScreen:
   - Email: `testuser123@example.com`
   - Password: `SecurePass123!`
   - Confirm Password: `SecurePass123!`
   - Tap "Register"
5. Should see success message "Registration successful!"
6. Should auto-navigate to LoginScreen after 2 seconds

### Verification:
**In Supabase Dashboard:**
1. Go to `Authentication` → `Users`
   - [ ] Should see `testuser123@example.com` in the list
2. Go to `SQL Editor`, run this query:
   ```sql
   SELECT * FROM profiles WHERE email LIKE 'testuser123%';
   ```
   - [ ] Should see ONE profile row with:
     - id: (UUID matching auth user)
     - full_name: NULL (or empty)
     - username: NULL (or empty)
     - role: 'user' (NOT 'admin')
     - created_at: (just now timestamp)

**Expected Result:** ✅ Profile auto-created with role='user'

---

## Test 2: Login as New User
**Objective:** Verify new user can login and lands on Books screen (not Admin)

### Steps:
1. On LoginScreen, enter:
   - Email: `testuser123@example.com`
   - Password: `SecurePass123!`
   - Tap "Login"
2. Should see success message "Logged in successfully!"
3. App should navigate to main view

### Verification:
**Visual checks:**
- [ ] App shows HomeScreen (Books tab visible)
- [ ] NO Admin tab visible in tab navigation at bottom
- [ ] ProfileScreen accessible (tap Profile at bottom)
- [ ] Can see user's profile data
- [ ] BookListScreen shows books to browse

**Console logs (if dev tools available):**
- Should see: `User role: user` or similar
- Should see: `Navigating to activeTab: books`

**Expected Result:** ✅ Regular user lands on Books screen, Admin tab not visible

---

## Test 3: Existing Admin User Login
**Objective:** Verify admin users can access admin features

### Prerequisites:
- Have an existing admin user in your profiles table with role='admin'
- If you don't have one, update an existing user in Supabase:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';
  ```

### Steps:
1. On LoginScreen, enter admin user credentials
2. Tap "Login"
3. Should see success message
4. Navigate to main view

### Verification:
**Visual checks:**
- [ ] App shows BookListScreen
- [ ] Admin tab IS visible in tab navigation (4th tab, or after Books/Profile)
- [ ] Tap Admin tab
- [ ] AdminScreen loads with 4 sections: Books, Users, Reviews, Analytics
- [ ] Top navigation bar shows logout button (red icon with pink background)
- [ ] Book list shows with vertical cards (cover image at top)
- [ ] User list shows user names and roles

**Console logs:**
- Should see: `User role: admin`
- Should see: `Navigating to activeTab: admin`

**Expected Result:** ✅ Admin user sees Admin tab and can access admin features

---

## Test 4: AdminScreen - Book Management
**Objective:** Verify CRUD operations for books work correctly

### Prerequisites:
- Logged in as admin user
- On AdminScreen, Books tab active
- Have several books in the database

### Steps:

#### 4.1 - Load Books List
- [ ] App loads books without errors
- [ ] Each book shows as vertical card:
  - Cover image (180px height)
  - Title (white text, 19px)
  - Author (gray text, 14px)
  - Genre badge (light colored background)
  - Edit and Delete buttons (each 44px tall)
- [ ] List scrollable if many books

#### 4.2 - Generate AI Book
- [ ] Tap "Generate AI" button
- [ ] Button shows loading spinner
- [ ] After ~2-3 seconds, new book appears at top of list
- [ ] New book has:
  - Generated cover image or placeholder
  - Title like "The Quantum Paradox"
  - Author like "Dr. Sarah Chen"
  - Genre badge
  - Edit and Delete buttons

**Verification in Supabase:**
```sql
SELECT * FROM books ORDER BY created_at DESC LIMIT 1;
```
- [ ] New book row exists in database

#### 4.3 - Add Book Manually
- [ ] Tap "Add Book" button
- [ ] Modal or form appears (or inline edit)
- [ ] Fill in:
  - Title: `Test Book ${Date.now()}`
  - Author: `Test Author`
  - Genre: `Test`
  - Cover: (image picker or URL)
- [ ] Tap "Save"
- [ ] Book appears in list immediately
- [ ] No page reload

**Verification in Supabase:**
```sql
SELECT * FROM books WHERE title LIKE 'Test Book%' ORDER BY created_at DESC LIMIT 1;
```
- [ ] Book exists with correct data

#### 4.4 - Edit Book
- [ ] Tap Edit button on any book
- [ ] Modal appears with current data
- [ ] Change title to `Edited Book ${Date.now()}`
- [ ] Tap "Save"
- [ ] Book in list updates immediately
- [ ] Alert shows: "Book updated successfully"

**Verification in Supabase:**
```sql
SELECT title FROM books WHERE id = 'BOOK_ID_HERE';
```
- [ ] Title updated in database

#### 4.5 - Delete Book
- [ ] Tap Delete button on any book
- [ ] Alert appears: "Are you sure you want to delete [Book Title]?"
- [ ] Tap "Delete" (or "Confirm")
- [ ] Book immediately disappears from list
- [ ] Alert shows: "Book deleted successfully"
- [ ] No page reload

**Verification in Supabase:**
```sql
SELECT COUNT(*) FROM books WHERE id = 'DELETED_BOOK_ID';
```
- [ ] Should return 0 (book gone)

**Expected Result:** ✅ All book CRUD operations work

---

## Test 5: AdminScreen - User Management
**Objective:** Verify user list displays and edit features work

### Prerequisites:
- Logged in as admin
- Have at least 2-3 non-admin users in profiles table

### Steps:

#### 5.1 - Load Users List
- [ ] Tap "Users" in AdminScreen tab navigation
- [ ] List loads and shows each user as a card:
  - Person icon
  - User name (full_name or username)
  - Role badge (green for 'user', purple for 'admin')
  - Join date (created_at formatted)
  - Edit button
- [ ] No errors in console

#### 5.2 - Edit User Role
- [ ] Tap Edit button on a regular user
- [ ] Modal appears with user details:
  - Name displayed
  - Role selector (dropdown or radio: 'user' or 'admin')
- [ ] Change role to 'admin'
- [ ] Tap "Save"
- [ ] Card immediately updates to show admin role badge
- [ ] Alert shows: "User [Name] updated successfully"

**Verification in Supabase:**
```sql
SELECT username, role FROM profiles WHERE id = 'USER_ID_HERE';
```
- [ ] Role changed to 'admin'

#### 5.3 - Check Role Persistence
- [ ] Logout (tap logout button)
- [ ] Login as the user you just made admin
- [ ] Verify they now see Admin tab
- [ ] Verify they can access admin functions

**Expected Result:** ✅ User list displays, role editing works, role persists

---

## Test 6: AdminScreen - Review Management
**Objective:** Verify reviews display and deletion works

### Prerequisites:
- Logged in as admin
- Have at least 2-3 reviews in the database
- Reviews should be linked to books and users

### Steps:

#### 6.1 - Load Reviews List
- [ ] Tap "Reviews" in AdminScreen tab navigation
- [ ] List loads and shows each review as a card:
  - Book icon
  - Book title
  - Book author
  - Star rating row (1-5 stars)
  - Review text (truncated to ~4 lines)
  - Date (created_at formatted)
  - Delete button
- [ ] No errors in console

#### 6.2 - Delete Review
- [ ] Tap Delete button on any review
- [ ] Alert appears: "Are you sure you want to delete this review for [Book Name]?"
- [ ] Tap "Delete"
- [ ] Review immediately disappears from list
- [ ] Alert shows: "Review deleted successfully"

**Verification in Supabase:**
```sql
SELECT COUNT(*) FROM reviews WHERE id = 'DELETED_REVIEW_ID';
```
- [ ] Should return 0

**Expected Result:** ✅ Reviews display and deletion works

---

## Test 7: Logout Functionality
**Objective:** Verify logout properly clears session and redirects

### Prerequisites:
- Logged in as any user
- In AdminScreen or any main screen

### Steps:
1. Look for logout button:
   - In AdminScreen: Red icon with pink background in top right
   - Should show confirmation alert
2. Tap logout button
3. Alert appears: "Logged out successfully"
4. Tap "OK" on alert
5. Should navigate back to HomeScreen
6. LoginScreen should be visible

### Verification:
**Visual checks:**
- [ ] No longer logged in (can see login form)
- [ ] No user data visible anywhere
- [ ] Admin tab not visible

**In Console (if accessible):**
- Should see: `Clearing session`
- Should see: `Logged out`

**Try accessing protected screens:**
- [ ] Tap "Profile" in HomeScreen → Should show login prompt
- [ ] Cannot access admin functions

**Verification in Supabase:**
- [ ] Session/token cleared (this happens automatically)

**Expected Result:** ✅ Logout clears session properly and prevents re-access

---

## Test 8: Permission Verification
**Objective:** Verify role-based access control works

### Prerequisites:
- Have both regular user and admin user
- Access to Supabase dashboard

### Steps:

#### 8.1 - Regular User Permissions
1. Login as regular user
2. Verify CANNOT:
   - [ ] See Admin tab in navigation
   - [ ] Access any admin functions
   - [ ] Delete other users
   - [ ] Delete other reviews
   - [ ] Modify books

#### 8.2 - Admin User Permissions
1. Login as admin user
2. Verify CAN:
   - [ ] See Admin tab
   - [ ] Access Books management
   - [ ] Access Users management
   - [ ] Access Reviews management
   - [ ] See Analytics section
   - [ ] Delete other users
   - [ ] Edit user roles

**Expected Result:** ✅ Role-based access control works correctly

---

## Test 9: Navigation Flow
**Objective:** Verify navigation between screens works smoothly

### Prerequisites:
- App installed and working

### Steps:

#### 9.1 - Home → Login → Register → Back to Login
- [ ] Start on HomeScreen
- [ ] Tap "Go to Login"
- [ ] On LoginScreen, tap "Don't have an account? Register"
- [ ] On RegisterScreen (or modal), can tap "Back" or close
- [ ] Returns to LoginScreen with fields cleared (or returns properly)

#### 9.2 - Tab Navigation
- [ ] Logged in as admin
- [ ] Tap different tabs (Books, Profile, Admin, Analytics if exists)
- [ ] Each tab loads instantly
- [ ] No errors or flashing

#### 9.3 - Admin Tab Navigation
- [ ] In AdminScreen, tap Books → Load books
- [ ] Tap Users → Load users
- [ ] Tap Reviews → Load reviews
- [ ] Tap Analytics → Load analytics (if section exists)
- [ ] No errors, smooth transitions

**Expected Result:** ✅ Navigation is smooth and consistent

---

## Test 10: Error Handling
**Objective:** Verify app handles errors gracefully

### Prerequisites:
- App running
- Ability to trigger errors

### Steps:

#### 10.1 - Invalid Login
- [ ] Enter invalid email/password
- [ ] Try to login
- [ ] Should show clear error message (not crash)
- [ ] Error message explains what went wrong
- [ ] Can try again without restarting app

#### 10.2 - Network Error Simulation
- [ ] Turn off internet/WiFi
- [ ] Try to load screens that fetch data
- [ ] Should show error message (not crash)
- [ ] Can turn internet back on and retry
- [ ] Should load data successfully when back online

#### 10.3 - Invalid UUID Handling
- [ ] This is tested internally, but if you see any "invalid-uuid" errors in console, that's a bug
- [ ] All UUID validation should be silent (safe defaults returned)

**Expected Result:** ✅ App handles errors gracefully without crashing

---

## Test 11: UI/UX Quality
**Objective:** Verify interface is professional and mobile-friendly

### Prerequisites:
- App running on actual mobile device (not just emulator)
- Various screen sizes to test (if possible)

### Steps:

#### 11.1 - Mobile Layout
- [ ] No horizontal scrolling on any screen
- [ ] All buttons are tappable (44px minimum height)
- [ ] Text is readable without zooming
- [ ] Images are proportional to screen
- [ ] Cards have proper spacing and padding

#### 11.2 - Visual Consistency
- [ ] Color scheme is consistent (amber primary, semantic reds/greens)
- [ ] Fonts are readable and consistent sizes
- [ ] Icons are clear and appropriate
- [ ] Loading spinners appear and disappear smoothly

#### 11.3 - Response to User Actions
- [ ] Buttons have visual feedback when tapped
- [ ] Loading states show during data fetches
- [ ] Error states show clearly
- [ ] Success states confirmed with alerts or feedback

**Expected Result:** ✅ UI/UX is professional and mobile-friendly

---

## Test 12: Performance
**Objective:** Verify app performs well

### Prerequisites:
- App running
- React Native console accessible (if needed)

### Steps:

#### 12.1 - Loading Times
- [ ] Initial app load: < 3 seconds
- [ ] Login: < 2 seconds
- [ ] Loading books list: < 2 seconds
- [ ] Loading admin screen: < 2 seconds

#### 12.2 - Smooth Scrolling
- [ ] Book/user/review lists scroll smoothly
- [ ] No lag or stuttering
- [ ] No jumped items

#### 12.3 - Memory Usage
- [ ] App doesn't crash after long use
- [ ] No memory leaks visible (check React Native console if available)

**Expected Result:** ✅ App performs well and is responsive

---

## Troubleshooting Guide

### Issue: "Failed to load users" error
**Solution:**
1. Check Supabase RLS policies on profiles table
2. Verify profiles table exists and has data
3. Check supabaseAdmin is configured correctly
4. Run this SQL: `SELECT * FROM profiles LIMIT 1;`

### Issue: Signup works but new user can't login
**Solution:**
1. Check if profile was created in profiles table
2. Run: `SELECT * FROM profiles WHERE id = 'USER_ID';`
3. If no profile exists:
   - Database trigger might not be running
   - Run VERIFY-DATABASE.sql to check trigger
   - Manually create profile: 
   ```sql
   INSERT INTO profiles (id, role) VALUES ('USER_ID', 'user');
   ```

### Issue: Admin sees users but no email addresses
**Solution:**
- This is expected! Email is in auth.users, not in profiles
- Display name comes from full_name or username
- This is correct behavior

### Issue: Regular user sees Admin tab
**Solution:**
1. Check user's role in profiles table
2. Role should be 'user' not 'admin'
3. In Supabase SQL: `UPDATE profiles SET role = 'user' WHERE id = 'USER_ID';`
4. Logout and login again
5. Admin tab should disappear

### Issue: Logout button not working
**Solution:**
1. Verify logout button is visible in AdminScreen header
2. Check console for errors
3. Clear app cache: `Settings → Apps → Book Club → Clear Cache`
4. Restart app and try again

---

## Success Criteria

✅ **All tests pass when:**

1. New users can signup and profiles auto-create
2. Users login and see correct screens (users see Books, admins see Admin option)
3. Admin functions all work (CRUD on books, users, reviews)
4. Logout properly clears session
5. Role-based access control prevents unauthorized access
6. No error crashes during normal use
7. UI is clean, mobile-friendly, and responsive
8. Navigation is smooth between screens

---

## Sign-Off

**Tested by:** _________________  
**Date:** _________________  
**Overall Status:** ☐ PASS   ☐ FAIL   ☐ PARTIAL  

**Issues Found:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

**Ready for Production:** ☐ YES   ☐ NO
