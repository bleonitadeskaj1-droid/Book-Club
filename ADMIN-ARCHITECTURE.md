# Admin System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    BOOK CLUB APP                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ App.js (Main Container)                          │  │
│  │ - Sessions Management                            │  │
│  │ - Role Detection (admin@gmail.com check)         │  │
│  │ - Route Navigation                               │  │
│  │ - State Management (role, screen, activeTab)     │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│         ┌────────────────┼────────────────┐             │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌────────────┐   ┌───────────┐  ┌──────────────┐     │
│  │ Home       │   │ Profile   │  │ Admin        │     │
│  │ (Public)   │   │ (Protected)   │ (Admin Only) │    │
│  └────────────┘   └───────────┘  └──────────────┘     │
│                                                         │
│  Role Detection:                                       │
│  session.user.email === 'admin@gmail.com' ?            │
│    role = 'admin'  ✅ Show Admin Tab                   │
│    : role = 'user' ❌ Hide Admin Tab                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## State Flow

```
USER LOGIN
    ↓
Supabase Auth → session created
    ↓
Check email in App.js initApp()
    ↓
┌─────────────────────────┬──────────────────────┐
│                         │                      │
Email = admin@gmail.com   │   Email ≠ admin@gmail.com
│                         │                      │
▼                         ▼                      ▼
setRole('admin')          setRole('user')   Regular User
│                         │                 - No admin tab
▼                         ▼                 - No admin access
Admin User                Normal User
- Admin tab visible       - No admin tab
- Can access admin        - Cannot access
  panel                     admin panel
- Can manage books        - Can only browse
- Can view users          - Can use profile
```

## Component Hierarchy

```
App.js
│
├─ <View style={styles.mainContainer}>
│  │
│  ├─ {activeTab === 'admin' && role === 'admin'}
│  │  └─ <AdminScreen session={session} />
│  │     ├─ Tab Navigation (Books | Users)
│  │     ├─ Books Panel
│  │     │  ├─ List Books
│  │     │  ├─ Add Book Modal
│  │     │  ├─ Edit Book Modal
│  │     │  └─ Delete Book
│  │     └─ Users Panel
│  │        └─ List Users (Read-only)
│  │
│  ├─ {activeTab === 'admin' && role !== 'admin'}
│  │  └─ <BookListScreen /> (Redirect)
│  │
│  ├─ {activeTab === 'profile' && session?.user}
│  │  └─ <ProfileScreen />
│  │
│  └─ (default)
│     └─ <BookListScreen /> (Home)
│
└─ <View style={styles.tabBar}>
   ├─ Profile Tab
   ├─ Books Tab
   └─ {role === 'admin' && <Admin Tab>}
      └─ Shows when user is admin only
```

## Role Detection Flow

```
SESSION STARTS
    ↓
useEffect(() => {
  initApp() → getSession()
    ↓
  session?.user exists?
    ├─ YES: email === 'admin@gmail.com'?
    │   ├─ YES: setRole('admin') ✅
    │   └─ NO:  setRole('user')
    └─ NO:  setRole('user') (default)
})

LISTENER
    ↓
onAuthStateChange((event, session) => {
  if (session?.user) {
    email === 'admin@gmail.com' ? 'admin' : 'user'
  } else {
    setRole('user')
  }
})
```

## Data Flow - Book Management

```
┌──────────────────────────────────────────┐
│ User clicks "Add Book"                   │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ Modal opens with form:                   │
│ - Title (required)                       │
│ - Author (required)                      │
│ - Genre, Year, Description, Content, URL │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ User fills form & clicks "Add Book"      │
└──────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────┐
│ handleAddBook()                          │
│ - Validate (title & author required)     │
│ - Call Supabase .insert(formData)        │
└──────────────────────────────────────────┘
           ↓
    ┌─────────────────┬─────────────────┐
    │                 │                 │
   YES              ERROR             TIMEOUT
    │                 │                 │
    ▼                 ▼                 ▼
┌────────┐      ┌──────────┐      ┌─────────┐
│ Success│      │Alert Error       │Loading  │
│ Reset  │      │Message   │      │Spinner  │
│ Refresh│      └──────────┘      └─────────┘
│ Close  │
└────────┘
    ↓
┌──────────────────────────────────────────┐
│ fetchBooks() - Refresh list              │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ setBooks(data) - Update state            │
└──────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────┐
│ Component re-renders with new book       │
└──────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────┐
│ User Authentication                 │
│ (Supabase Auth)                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Role Detection Layer                │
│ (App.js - initApp & listener)       │
│                                     │
│ if (email === 'admin@gmail.com')    │
│   role = 'admin'                    │
│ else                                │
│   role = 'user'                     │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ UI-Level Access Control             │
│                                     │
│ Admin Tab: Only if role === 'admin' │
│ Admin Screen: Only if role === 'admin'  │
│ Non-admins: Redirected to Home      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Database Operations                 │
│ (Supabase RLS on backend)           │
│                                     │
│ Only admin can manage books         │
│ Only admin can view users           │
└─────────────────────────────────────┘
```

## Database Schema Interaction

```
PROFILES TABLE
┌─────────────────────────────────┐
│ id         | email | created_at │  (for User Management)
├─────────────────────────────────┤
│ uuid-123   | user@email.com | 2024-01 │
│ uuid-456   | admin@gmail.com | 2024-01 │
└─────────────────────────────────┘
       │
       └─ Admin reads this table
          Shows user list in admin panel

BOOKS TABLE
┌─────────────────────────────────────────────────┐
│ id | title | author | genre | year | content ... │
├─────────────────────────────────────────────────┤
│ 1  | The Great Gatsby | Fitzgerald | Fiction | 1925 │
│ 2  | 1984 | Orwell | Sci-Fi | 1949 │
└─────────────────────────────────────────────────┘
       │
       └─ Admin creates/edits/deletes
          Regular users only read
```

## Navigation State Machine

```
START
  ↓
┌─────────────┐
│ Main Screen │ (activeTab = 'books' by default)
│ Public Home │
└─────────────┘
  ↓ ┌─────────────┬─────────────┬─────────────┐
  │ │             │             │             │
  ▼ ▼             ▼             ▼             ▼
Books  Profile   Admin       (if admin)
Home   Screen    Screen
(Public)(Protected)(Admin Only)

NAVIGATION:
- click Books tab → activeTab = 'books'
- click Profile tab → activeTab = 'profile'
- click Admin tab → activeTab = 'admin' (if role === 'admin')
  └─ if role !== 'admin' → redirect to home (activeTab = 'books')

VISIBILITY:
- Books tab: Always visible
- Profile tab: Always visible
- Admin tab: Only if role === 'admin'
```

## Request/Response Cycle

### Adding a Book (Example)

```
CLIENT                          SERVER (Supabase)
  │
  ├─ User fills form
  │  {title, author, genre...}
  │
  ├─ Click "Add Book"
  │
  ├─ handleAddBook()
  │  Validate inputs
  │
  ├─ POST /books with formData ─────────→ ┌──────────────┐
  │                                       │ books table  │
  │                                       │              │
  │←────────────── Success response ──────┤ insert row   │
  │ {id, created_at, ...}                 │              │
  │                                       └──────────────┘
  ├─ Alert("Success...")
  │
  ├─ resetForm()
  │
  ├─ fetchBooks() ──────────────→ ┌──────────────────┐
  │                                │ SELECT * FROM    │
  │←────── All books ─────────────┤ books ORDER BY   │
  │ [{id, title, author...}]      │ title            │
  │                                └──────────────────┘
  ├─ setBooks(data)
  │
  └─ Re-render with new book in list
```

## Error Handling Flow

```
Operation Attempted
    ↓
Try {
  Perform operation (API call)
    ↓
  Response?
    ├─ Error ──→ throw error
    │
    └─ Success ──→ continue
}
Catch {
  Alert.alert("Error", message)
}
Finally {
  setLoading(false)
}

Examples:
- Add book: form validation + DB validation
- Delete book: confirmation dialog + DB operation
- Fetch users: error handling + empty state
```

## Performance Optimization

```
useEffect(() => {
  if (activeTab === 'books') {
    fetchBooks()  ← Only fetch when tab changes
  } else if (activeTab === 'users') {
    fetchUsers()  ← Only fetch when tab changes
  }
}, [activeTab])  ← Dependency array ensures selective fetching

Benefits:
- Avoid unnecessary API calls
- Data only loaded when needed
- Efficient state management
- Better app performance
```

## Testing Paths

```
PATH 1: Admin User
Login (admin@gmail.com) 
  → role = 'admin'
  → Admin tab visible ✅
  → Click admin tab → AdminScreen
  → Add book → Refresh list ✅
  → Edit book → Update ✅
  → Delete book → Confirm & Delete ✅
  → Users tab → View users ✅

PATH 2: Regular User
Login (user@example.com)
  → role = 'user'
  → Admin tab NOT visible ❌
  → Only Books & Profile tabs
  → Browse home ✅
  → View profile ✅
  → Cannot access admin ✓

PATH 3: Non-Authenticated
No login
  → role = 'user' (default)
  → Public home visible ✅
  → Books browsable ✅
  → Profile requires login ✅
```

---

This architecture ensures:
- ✅ Secure role-based access
- ✅ Clean separation of concerns
- ✅ Efficient data loading
- ✅ Graceful error handling
- ✅ Professional user experience
- ✅ No breaking changes to existing features
