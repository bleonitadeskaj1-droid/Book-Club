# Create Admin User - Step by Step

## Current Issue
Login with `admin@gmail.com` / `123456` returns "Invalid login credentials"

## Solution Steps

### Step 1: Delete Existing Admin User (if exists)
1. Go to Supabase Dashboard → Authentication → Users
2. Search for `admin@gmail.com`
3. If found, click the three dots (•••) → Delete User
4. Confirm deletion

### Step 2: Create Fresh Admin User
1. In Authentication → Users, click **"Add User"**
2. Fill in:
   - **Email:** `admin@gmail.com` (exactly as shown)
   - **Password:** `123456` (exactly as shown)
   - **✅ CRITICAL:** Check **"Auto Confirm User"** checkbox
3. Click **"Create User"**
4. **Copy the User ID (UUID)** that appears

### Step 3: Set Admin Role in Database
Run this SQL in Supabase SQL Editor:

```sql
-- Set admin role for admin@gmail.com
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
)
INSERT INTO profiles (id, full_name, role)
SELECT id, 'Admin User', 'admin' FROM admin_user
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    full_name = 'Admin User',
    updated_at = timezone('utc', now());
```

### Step 4: Verify User Created Correctly
Run this SQL to verify:

```sql
-- Check if admin user exists and is confirmed
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'admin@gmail.com';
```

**Expected result:**
- `email_confirmed_at` should have a timestamp (NOT NULL)
- If NULL, the email is not confirmed → login will fail

### Step 5: Verify Profile Role
```sql
-- Check admin role in profiles
SELECT id, full_name, role, created_at
FROM profiles
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
```

**Expected result:**
- `role` should be `'admin'`

### Step 6: Test Login
1. Restart the Expo app: `expo start -c`
2. Try logging in:
   - Email: `admin@gmail.com`
   - Password: `123456`
3. Check console for logs:
   ```
   🔐 Login attempt { email: 'admin@gmail.com', passwordLength: 6 }
   ✅ Login successful { email: 'admin@gmail.com', passwordLength: 6 }
   🔑 ADMIN CHECK (Auth Change): { email: 'admin@gmail.com', isAdmin: true, assignedRole: 'admin' }
   🎯 Admin user detected - switching to admin tab
   ```

## Common Issues

### Issue: "Invalid login credentials"
**Causes:**
1. Email not confirmed (`email_confirmed_at` is NULL)
2. Password incorrect
3. User doesn't exist

**Fix:**
- Make sure **"Auto Confirm User"** was checked when creating user
- Or manually confirm: Click user → "Confirm Email" button

### Issue: Email confirmed but still fails
**Cause:** Password mismatch

**Fix:**
1. In Supabase Dashboard → Authentication → Users
2. Click on admin@gmail.com
3. Click "Reset Password" 
4. Or delete and recreate with correct password

### Issue: Login works but no admin tab
**Cause:** Role not set in profiles table

**Fix:** Run the SQL from Step 3 again

## Alternative: Manual Email Confirmation
If you forgot to check "Auto Confirm User":

```sql
-- Manually confirm admin email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@gmail.com'
  AND email_confirmed_at IS NULL;
```

## Verification Checklist
- [ ] User exists in `auth.users` with email `admin@gmail.com`
- [ ] `email_confirmed_at` is NOT NULL (email is confirmed)
- [ ] Password is exactly `123456`
- [ ] Profile exists in `profiles` table
- [ ] Profile `role` is `'admin'`
- [ ] App logs show admin detection after login

## Test Credentials
```
Email: admin@gmail.com
Password: 123456
```

**CRITICAL:** The email MUST be confirmed for login to work!
