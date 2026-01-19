# Public Authentication Implementation Guide

## Overview

The application now supports **public browsing with action-based authentication**:
- **Home screen (BookListScreen)** is publicly accessible without login
- **Protected actions** require login when user initiates them
- **Profile screen** requires authentication to access
- After login, pending actions execute automatically

---

## User Experience Flow

### 1. **Browsing (No Login Required)**
```
App Opens
    ↓
User sees HOME SCREEN
    ├─ Browse books
    ├─ Search books
    ├─ View book details (titles, covers, descriptions)
    ├─ Read book content (when clicking "Read")
    └─ Can scroll freely
```

### 2. **Protected Action (Login Required)**
```
User clicks "Set Status" / "Add Review" / etc.
    ↓
Check: Is user logged in?
    ├─ YES → Execute action immediately
    └─ NO → Show LOGIN MODAL
            ↓
            User logs in
            ↓
            Action executes automatically (pending action)
```

### 3. **Protected Screens (Login Required)**
```
User taps "Profile" tab
    ├─ If logged in → Show Profile screen
    └─ If NOT logged in → Show "Sign in required" prompt
```

---

## Protected Actions

### In BookListScreen:
- ✅ **Set book status** (To Read / Reading / Finished)
- ✅ **Write/edit reviews**
- ✅ **Add to favorites** (via Categorize)
- ✅ **Access reading progress** (via modal)

### In BookDetailScreen:
- ✅ **Change reading status**
- ✅ **Save/edit review**
- ✅ **Delete review**

### In ReaderScreen:
- ✅ **Navigate pages** (next/previous)
- ✅ **Save reading progress**

### In ProfileScreen:
- ✅ **View reading history**
- ✅ **View favorites**
- ✅ **Manage reviews**
- ✅ **Edit profile**

---

## Implementation Details

### 1. **Updated App.js**

#### Key Changes:
```javascript
// STATE ADDITIONS
const [session, setSession] = useState(null);           // Auth session
const [showLoginModal, setShowLoginModal] = useState(false);  // Login overlay
const [pendingAction, setPendingAction] = useState(null);     // Action to execute after login

// INITIAL SCREEN
const [screen, setScreen] = useState('main'); // START WITH HOME (not 'login')

// AUTH STATE LISTENER
useEffect(() => {
  // Show home immediately (public)
  setScreen('main');
  
  // Check auth in background (non-blocking)
  checkAuth();
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
    if (session?.user) {
      // User logged in - execute pending action if any
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
  });
});
```

#### UI Updates:
```javascript
// HOME SCREEN (BookListScreen)
<BookListScreen
  session={session}
  onRequireAuth={(callback) => {
    // Store pending action
    setPendingAction(() => callback);
    // Show login modal
    setShowLoginModal(true);
  }}
/>

// LOGIN MODAL (shown on top of home screen)
{showLoginModal && !session?.user && (
  <View style={styles.modalOverlay}>
    <LoginScreen 
      onNavigate={(screen) => {
        if (screen === 'main') {
          setShowLoginModal(false);
          // Pending action auto-executes via auth listener
        }
      }} 
    />
  </View>
)}

// PROFILE TAB (requires auth)
{activeTab === 'profile' && !showProfileModal && session?.user ? (
  <ProfileScreen />  // Only show if authenticated
) : activeTab === 'profile' && !session?.user ? (
  <AuthPrompt />  // Show login prompt
) : (
  <BookListScreen />  // Show home screen
)}
```

---

### 2. **Helper Utility (utils/authHelper.js)**

```javascript
// Check if user is authenticated
isUserAuthenticated(session) → boolean

// Require auth for an action
requireAuth({
  isAuthenticated: boolean,
  onLoginRequired: Function,
  onSuccess: Function
})

// Store/retrieve pending action
setPendingAction(action)
getPendingAction() → action
clearPendingAction()
```

**Usage Example:**
```javascript
const handleAction = (action, book) => {
  const executeAction = () => {
    // Perform the protected action
    updateBookStatus(book.id, status);
  };

  if (!session?.user) {
    // Trigger login modal
    onRequireAuth(executeAction);
  } else {
    // Execute immediately
    executeAction();
  }
};
```

---

### 3. **Updated Screens**

#### BookListScreen:
```javascript
export default function BookListScreen({ 
  session, 
  onSelectBook, 
  onMenuPress, 
  onRequireAuth  // NEW: callback for protected actions
}) {
  const handleAction = (action, book) => {
    const executeAction = () => {
      // Set status / fetch reviews / etc.
    };

    if (!session?.user) {
      onRequireAuth(executeAction);  // Show login
    } else {
      executeAction();  // Execute now
    }
  };
}
```

#### BookDetailScreen:
```javascript
export default function BookDetailScreen({ 
  book, 
  session, 
  onClose, 
  onRead,
  onRequireAuth  // NEW
}) {
  const handleStatusChange = async (newStatus) => {
    const executeChange = async () => {
      await updateBookStatus(...);
    };

    if (!session?.user) {
      onRequireAuth(executeChange);
    } else {
      executeChange();
    }
  };
}
```

#### ReaderScreen:
```javascript
export default function ReaderScreen({ 
  book, 
  onClose, 
  session,
  onRequireAuth  // NEW
}) {
  const handleNextPage = () => {
    const executeNavigation = () => {
      setCurrentPage(currentPage + 1);
      savePage(currentPage + 1);
    };

    if (!session?.user?.id) {
      onRequireAuth(executeNavigation);
    } else {
      executeNavigation();
    }
  };
}
```

---

## User Stories

### Story 1: Browse Books (No Login)
```
1. App opens
2. User sees home screen with book list (PUBLIC)
3. User scrolls, searches, views book details
4. No login required ✅
```

### Story 2: Set Book Status (Requires Login)
```
1. User browses books (no login)
2. Clicks "Mark as Reading"
3. App checks: Is user logged in?
   - NO → Shows login modal on top
   - User completes login
4. Status is set immediately (pending action executes) ✅
```

### Story 3: Continue Reading (Requires Login)
```
1. User opens ReaderScreen
2. Reads a few pages
3. Clicks "Next Page"
4. App checks: Is user logged in?
   - NO → Shows login modal
   - User logs in
5. Navigates to next page & saves progress ✅
```

### Story 4: Access Profile (Requires Login)
```
1. User taps "Profile" tab
2. App checks: Is user logged in?
   - NO → Shows "Sign in required" prompt with button
   - User taps "Sign In Now"
   - Login modal opens
   - After login → Shows profile screen ✅
   - YES → Shows profile immediately ✅
```

---

## Technical Benefits

✅ **Non-Breaking**: No changes to Supabase auth setup
✅ **Reusable**: `onRequireAuth` callback works for any protected action
✅ **Seamless**: Pending action executes after login without user intervention
✅ **Clean**: Clear separation between public and protected features
✅ **Flexible**: Each screen decides which actions require auth
✅ **User-Friendly**: No forced redirects, browsing always available

---

## Testing Checklist

- [ ] App opens showing home screen (no login required)
- [ ] Can browse books without logging in
- [ ] Can view book details without logging in
- [ ] Click "Set Status" without login → Login modal appears
- [ ] Complete login → Status is set (pending action executes)
- [ ] Click "Profile" without login → Auth prompt shown
- [ ] Complete login → Profile screen loads
- [ ] Click "Write Review" without login → Login modal appears
- [ ] Complete login → Review modal appears
- [ ] Reading pages save only when authenticated
- [ ] Logout → Home screen still visible, protected actions blocked

---

## Code Files Modified

| File | Changes |
|------|---------|
| App.js | Added login modal, pending action state, home-first navigation |
| BookListScreen.js | Added `onRequireAuth` prop, wrapped actions |
| BookDetailScreen.js | Added `onRequireAuth` prop, wrapped status/review/delete |
| ReaderScreen.js | Added `onRequireAuth` prop, wrapped page navigation |
| utils/authHelper.js | NEW: Helper utilities for auth checks |

---

## Future Enhancements

- [ ] Show "locked" badge on protected actions
- [ ] Analytics: Track where users need to login most
- [ ] Deep linking: Redirect to action after login
- [ ] Remember user's preferred books before login
- [ ] Nudge notifications for incomplete actions
