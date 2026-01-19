# Code Reference - Critical Implementations

## resolveUserRole() Helper in App.js

This is the most critical function that was added to fix authentication:

```javascript
// Call this function whenever a user authenticates
// It fetches the user's profile and sets up role-based access

async function resolveUserRole(sessionObj) {
  if (!sessionObj || !sessionObj.user) {
    setRole('user');
    setActiveTab('books');
    return;
  }

  try {
    const userId = sessionObj.user.id;
    
    // Fetch profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      // Profile doesn't exist - try to create it
      console.log('Profile not found, attempting to create...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, role: 'user' });
      
      if (insertError && insertError.code !== '23505') {
        // 23505 = unique violation (profile already exists)
        console.log('Error creating profile:', insertError);
      }
      
      // Default to user role
      setRole('user');
      setActiveTab('books');
      return;
    }

    // Profile exists - use its role
    const userRole = profile.role || 'user';
    setRole(userRole);
    
    // Set initial tab based on role
    if (userRole === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('books');
    }
    
  } catch (err) {
    console.error('Error resolving user role:', err);
    setRole('user');
    setActiveTab('books');
  }
}
```

### When to Call
1. On app startup (initial auth state)
2. After successful login
3. After successful signup (on next login)
4. When auth state changes

### What It Does
1. Checks if user is authenticated
2. Fetches their profile from profiles table
3. If profile missing: tries to create it (in case signup trigger failed)
4. Sets global `role` state ('user' or 'admin')
5. Sets `activeTab` state appropriately ('admin' for admins, 'books' for users)

---

## Auth State Handler in App.js

This is how the app detects login/logout:

```javascript
// In useEffect for auth state changes
useEffect(() => {
  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // User just logged in or token refreshed
        // Resolve their role and set navigation
        await resolveUserRole(session);
        setSession(session);
        setScreen('main'); // Show main app (not login)
        
      } else if (event === 'SIGNED_OUT') {
        // User logged out
        setSession(null);
        setRole('user');
        setActiveTab('books');
        setScreen('home'); // Show home screen
      }
    }
  );

  return () => {
    authListener?.subscription.unsubscribe();
  };
}, []);
```

### Key Points
- `SIGNED_IN`: Triggered on successful login
- `SIGNED_OUT`: Triggered on logout or session expiration
- `TOKEN_REFRESHED`: Triggered when session refreshes
- Always call `resolveUserRole()` on sign in
- Always reset to home screen on sign out

---

## Login Modal Close Handling

Fixed to properly reset activeTab:

```javascript
// In App.js renderScreen function
// When showing login modal

<LoginScreen
  session={session}
  onNavigate={(newRole) => {
    // User successfully logged in
    if (newRole === 'admin') {
      setActiveTab('admin'); // Go to admin screen
    } else {
      setActiveTab('books'); // Go to books screen
    }
    setShowLoginModal(false); // Close modal
  }}
  onClose={() => {
    // User closed modal without logging in
    // Reset to appropriate screen
    if (role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('books');
    }
    setShowLoginModal(false);
  }}
/>
```

### Why This Matters
- If user logs in: navigate to correct screen based on role
- If user cancels: return to previous screen
- Prevents accidental AdminScreen access for regular users

---

## UUID Validation Pattern

Used in all services to prevent crashes:

```javascript
// Helper function (add to top of service file)
export const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// In any function that uses an ID:
export async function getUserReviews(userId) {
  // Validate UUID first
  if (!isValidUUID(userId)) {
    console.warn('Invalid user ID:', userId);
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
    
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return []; // Safe default
  }
}
```

### Pattern
1. Always validate UUID at function start
2. Return safe default ([] or {}) if invalid
3. Wrap database calls in try/catch
4. Return safe default on error
5. Never crash the app

---

## fetchUsers() in AdminScreen

Fixed to use profiles table:

```javascript
// In AdminScreen.js
async function fetchUsers() {
  try {
    setLoading(true);
    
    // Use supabaseAdmin to bypass RLS
    // Query profiles directly (email NOT in this table)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, role, created_at');

    if (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
      setUsers([]);
      return;
    }

    // Map profiles to display format
    // Use full_name or username (never email from here)
    const formattedUsers = (data || []).map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.username || profile.id.substring(0, 8),
      role: profile.role || 'user',
      createdAt: new Date(profile.created_at).toLocaleDateString()
    }));

    setUsers(formattedUsers);
    
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Error loading users');
    setUsers([]);
  }
}
```

### Key Points
- Query `profiles` table, not `auth.users`
- Display `full_name` or `username`
- Email NOT available here (it's in auth.users, not accessible via RLS)
- Use `supabaseAdmin` to bypass RLS (only for admin functions)
- Always handle errors gracefully

---

## fetchReviews() in AdminScreen

Fixed to work around relationship issue:

```javascript
// In AdminScreen.js
async function fetchReviews() {
  try {
    setLoading(true);

    // Step 1: Fetch reviews with books (this join works)
    const { data: reviewsData, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('*, books(*)');

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      setReviews([]);
      return;
    }

    // Step 2: Fetch all profiles (separately, since direct join doesn't work)
    const { data: profilesData } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username');

    // Step 3: Create lookup map for quick access
    const profileMap = {};
    (profilesData || []).forEach(profile => {
      profileMap[profile.id] = profile;
    });

    // Step 4: Map reviews with profile data
    const formattedReviews = (reviewsData || []).map(review => {
      const profile = profileMap[review.user_id] || {};
      return {
        id: review.id,
        bookTitle: review.books?.title || 'Unknown',
        bookAuthor: review.books?.author || 'Unknown',
        userName: profile.full_name || profile.username || 'Anonymous',
        rating: review.rating || 0,
        reviewText: review.review_text || '',
        createdAt: new Date(review.created_at).toLocaleDateString(),
        userId: review.user_id,
        bookId: review.book_id
      };
    });

    setReviews(formattedReviews);
    
  } catch (err) {
    console.error('Error:', err);
    setReviews([]);
  }
}
```

### Why This Works
1. Reviews → Books join works (direct foreign key)
2. Profiles → Reviews relationship doesn't work (user_id points to auth.users, not profiles)
3. So we fetch them separately and map in JavaScript
4. Result: all data available with no errors

---

## handleDelete() in AdminScreen

Demonstrates correct table usage:

```javascript
// In AdminScreen.js
async function handleDelete(item, type) {
  try {
    setLoading(true);

    // Delete from correct table based on type
    if (type === 'book') {
      const { error } = await supabaseAdmin
        .from('books')
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      // Update local state immediately
      setBooks(books.filter(b => b.id !== item.id));
      alert(`Book "${item.title}" deleted successfully`);
      
    } else if (type === 'user') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      // Update local state immediately
      setUsers(users.filter(u => u.id !== item.id));
      alert(`User "${item.name}" deleted successfully`);
      
    } else if (type === 'review') {
      const { error } = await supabaseAdmin
        .from('reviews')
        .delete()
        .eq('id', item.id);
      
      if (error) throw error;
      
      // Update local state immediately
      setReviews(reviews.filter(r => r.id !== item.id));
      alert(`Review deleted successfully`);
    }

  } catch (err) {
    console.error('Delete error:', err);
    alert(`Failed to delete ${type}`);
  }
}
```

### Key Patterns
- Delete from correct table (books, profiles, reviews)
- Update local state immediately (no page reload)
- Show item name in success message
- Catch and display errors
- Use supabaseAdmin for bypass

---

## Role-Based Tab Navigation

In App.js renderScreen():

```javascript
// Show different tabs based on role
<View style={{ flexDirection: 'row', marginBottom: 10 }}>
  {/* These tabs always show */}
  <Tab 
    active={activeTab === 'books'} 
    onPress={() => setActiveTab('books')}
    label="Books"
  />
  
  <Tab 
    active={activeTab === 'profile'} 
    onPress={() => setActiveTab('profile')}
    label="Profile"
  />

  {/* Admin tab ONLY shows for admins */}
  {role === 'admin' && (
    <Tab 
      active={activeTab === 'admin'} 
      onPress={() => setActiveTab('admin')}
      label="Admin"
    />
  )}
</View>

{/* Render correct screen based on activeTab AND role */}
<View>
  {activeTab === 'books' && <BookListScreen />}
  {activeTab === 'profile' && <ProfileScreen />}
  
  {/* If admin AND on admin tab: show admin screen */}
  {activeTab === 'admin' && role === 'admin' && <AdminScreen />}
  
  {/* If user tries to access admin: show books instead */}
  {activeTab === 'admin' && role !== 'admin' && <BookListScreen />}
</View>
```

### What This Does
1. Admin tab visible only when role === 'admin'
2. If regular user somehow accesses 'admin' tab: shows books instead
3. Double protection (UI + logic)

---

## Logout in AdminScreen

Complete implementation:

```javascript
// In AdminScreen.js
async function handleLogout() {
  try {
    // Clear fake admin session from AsyncStorage
    await AsyncStorage.removeItem('fakeAdminSession');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Alert user
    alert('Logged out successfully');
    
    // Note: App.js auth listener will handle navigation
    // setScreen('home') happens automatically via onAuthStateChange
    
  } catch (err) {
    console.error('Logout error:', err);
    alert('Error logging out');
  }
}
```

### Why This Works
1. Clears AsyncStorage (removes fake session)
2. Calls supabase.auth.signOut() (clears real session)
3. Auth state changes trigger listener in App.js
4. Listener calls resolveUserRole() with null session
5. App navigates back to home screen
6. User fully logged out

---

## Key Database Queries for Testing

### Verify Trigger and Function
```sql
-- Check if trigger exists
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

### Check RLS Policies
```sql
-- See all policies on profiles table
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Find Missing Profiles
```sql
-- Find auth users without profiles
SELECT id, email, created_at 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);

-- Create missing profiles
INSERT INTO profiles (id, role) 
SELECT id, 'user' FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);
```

### Check User Roles
```sql
-- See all users and their roles
SELECT id, full_name, username, role, created_at 
FROM profiles 
ORDER BY created_at DESC;

-- Make someone an admin
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID';
```

---

## Testing Quick Checks

### Test 1: Signup Works
```
Email: testuser@example.com
Password: SecurePass123!

Verify:
1. Auth user created (check auth.users)
2. Profile created (check profiles table, role='user')
3. Can login immediately after
```

### Test 2: Login Works
```
Email: testuser@example.com
Password: SecurePass123!

Verify:
1. Redirects to main screen
2. Books tab showing (not Admin)
3. Profile tab accessible
```

### Test 3: Admin Works
```
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
Login as admin user

Verify:
1. Admin tab visible
2. Can access AdminScreen
3. Can see/create/edit/delete books
4. Can see/edit/delete users
```

### Test 4: Logout Works
```
While logged in:
1. Find logout button (red icon in AdminScreen header)
2. Tap it
3. Confirm alert

Verify:
1. Redirects to home screen
2. Cannot access protected screens
3. Must login again to access app
```

---

## Debugging Commands

### Check App Logs
```javascript
// Add this to App.js to log all state changes
useEffect(() => {
  console.log('=== APP STATE UPDATE ===');
  console.log('Screen:', screen);
  console.log('Role:', role);
  console.log('Active Tab:', activeTab);
  console.log('Session:', session?.user?.id);
}, [screen, role, activeTab, session]);
```

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Click your project
3. Go to "Logs" → "Auth Logs" or "API Logs"
4. Filter by error or timestamp
5. Look for signup/login issues

### Check Database State
```javascript
// Add to App.js to verify database state
async function debugDatabase() {
  const { data: users } = await supabaseAdmin.from('auth.users').select('*');
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
  
  console.log('Auth users:', users?.length);
  console.log('Profiles:', profiles?.length);
  console.log('Match?', users?.length === profiles?.length);
}
```

---

## Summary: Most Important Code Patterns

1. **Always validate UUIDs** before using in queries
2. **Use supabaseAdmin** for bypass RLS in admin functions only
3. **Fetch data in stages** when direct joins don't work
4. **Update local state immediately** (don't wait for reload)
5. **Handle all errors gracefully** (never crash)
6. **Set role from profile table** not email
7. **Call resolveUserRole()** on every successful auth
8. **Check role before showing admin features** (UI + logic)
9. **Clear AsyncStorage on logout** (not just Supabase session)
10. **Log everything** (errors, auth events, role resolution)

These patterns ensure the app is robust, secure, and provides good UX.
