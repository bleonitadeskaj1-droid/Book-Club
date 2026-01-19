# Continue Reading - Architecture Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ ProfileScreen│              │ ReaderScreen │             │
│  │              │              │              │             │
│  │ • Book List  │◄────────────►│ • Content    │             │
│  │ • Progress % │  onRead()    │ • Progress   │             │
│  │ • Continue   │              │ • Controls   │             │
│  │   Button     │              │              │             │
│  └──────────────┘              └──────────────┘             │
│         │                             │                      │
└─────────┼─────────────────────────────┼──────────────────────┘
          │                             │
          ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│              readingProgressService                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  • saveProgress(userId, bookId, {scrollPosition, ...})       │
│  • getProgress(userId, bookId)                               │
│  • getCurrentlyReading(userId)                               │
│  • calculatePosition(percentage, contentLength)              │
│                                                               │
└─────────┬───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  user_books table:                                           │
│  ┌──────────────────────────────────────────────┐            │
│  │ id          │ user_id │ book_id │ last_page │            │
│  │ uuid        │ uuid    │ int     │ int(0-100)│            │
│  │─────────────┼─────────┼─────────┼───────────│            │
│  │ 123...      │ u123... │ 42      │ 45        │            │
│  │ 124...      │ u123... │ 88      │ 78        │            │
│  └──────────────────────────────────────────────┘            │
│                                                               │
│  RLS Policy: Users see only their own rows                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Reading Flow Sequence

```
┌──────┐                ┌──────────┐               ┌─────────┐
│ User │                │ Reader   │               │ Service │
└──┬───┘                └────┬─────┘               └────┬────┘
   │                         │                          │
   │ 1. Opens Book           │                          │
   ├────────────────────────►│                          │
   │                         │                          │
   │                         │ 2. Fetch Progress        │
   │                         ├─────────────────────────►│
   │                         │                          │
   │                         │◄─────────────────────────┤
   │                         │  { percentage: 45 }      │
   │                         │                          │
   │                         │ 3. Calculate Position    │
   │                         │    position = (45/100)   │
   │                         │              * height    │
   │                         │                          │
   │  ◄──────────────────────┤ 4. Auto-scroll           │
   │    Position restored    │                          │
   │                         │                          │
   │ 5. User scrolls         │                          │
   ├────────────────────────►│                          │
   │                         │                          │
   │                         │ 6. Calculate %           │
   │                         │    % = (scroll/height)   │
   │                         │        * 100             │
   │                         │                          │
   │                         │ 7. Save Progress         │
   │                         │    (throttled 500ms)     │
   │                         ├─────────────────────────►│
   │                         │                          │
   │                         │◄─────────────────────────┤
   │                         │  { success: true }       │
   │                         │                          │
   │ 8. Closes Reader        │                          │
   ├────────────────────────►│                          │
   │                         │                          │
   │                         │ 9. Final Save            │
   │                         ├─────────────────────────►│
   │                         │                          │
   └─────────────────────────┴──────────────────────────┘
```

## Continue Reading Flow

```
┌──────┐           ┌─────────┐          ┌────────┐          ┌─────────┐
│ User │           │ Profile │          │  App   │          │ Reader  │
└──┬───┘           └────┬────┘          └───┬────┘          └────┬────┘
   │                    │                   │                    │
   │ 1. View Profile    │                   │                    │
   ├───────────────────►│                   │                    │
   │                    │                   │                    │
   │                    │ 2. Load Books     │                    │
   │                    │   with Progress   │                    │
   │                    │                   │                    │
   │◄───────────────────┤                   │                    │
   │ Shows:             │                   │                    │
   │ • Book A - 45%     │                   │                    │
   │ • Book B - 78%     │                   │                    │
   │ [Continue Reading] │                   │                    │
   │                    │                   │                    │
   │ 3. Click Button    │                   │                    │
   ├───────────────────►│                   │                    │
   │                    │                   │                    │
   │                    │ 4. onRead(book)   │                    │
   │                    ├──────────────────►│                    │
   │                    │                   │                    │
   │                    │                   │ 5. Open Reader     │
   │                    │                   ├───────────────────►│
   │                    │                   │                    │
   │                    │                   │◄───────────────────┤
   │                    │                   │ 6. Fetch & Restore │
   │                    │                   │                    │
   │◄───────────────────┴───────────────────┴────────────────────┤
   │                 Reading at 45%                              │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ReaderScreen                            │
│                                                              │
│  ScrollView.onScroll                                         │
│       │                                                      │
│       ▼                                                      │
│  Get scroll position (y)                                     │
│       │                                                      │
│       ▼                                                      │
│  Get content height                                          │
│       │                                                      │
│       ▼                                                      │
│  Calculate:                                                  │
│    percentage = (y / height) * 100                           │
│       │                                                      │
│       ▼                                                      │
│  Throttle (500ms)                                            │
│       │                                                      │
│       ▼                                                      │
│  saveProgress(userId, bookId, {                              │
│    scrollPosition: y,                                        │
│    contentLength: height,                                    │
│    status: 'reading'                                         │
│  })                                                          │
│       │                                                      │
└───────┼──────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│            readingProgressService.saveProgress()             │
│                                                              │
│  1. Calculate percentage from scroll/height                  │
│  2. Round to integer (0-100)                                 │
│  3. Upsert to database:                                      │
│                                                              │
│     INSERT INTO user_books (user_id, book_id, last_page)     │
│     VALUES (?, ?, ?)                                         │
│     ON CONFLICT (user_id, book_id)                           │
│     DO UPDATE SET last_page = ?, updated_at = NOW()          │
│                                                              │
│  4. Return { success: true, percentage: X }                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Component State Management

```
ProfileScreen State:
┌────────────────────────────────────┐
│ currentlyReading: Book[]           │
│ readingProgress: { [bookId]: % }  │
│                                    │
│ BookCard Component:                │
│  ├─ showProgress: true/false       │
│  ├─ onContinueReading: callback    │
│  └─ Renders:                       │
│      • Progress bar (visual)       │
│      • Percentage text             │
│      • Continue Reading button     │
└────────────────────────────────────┘

ReaderScreen State:
┌────────────────────────────────────┐
│ contentHeight: number              │
│ savedProgress: { %, status }       │
│ isRestoringPosition: boolean       │
│                                    │
│ Refs:                              │
│  ├─ scrollViewRef                  │
│  ├─ scrollTimeoutRef               │
│  └─ lastScrollPositionRef          │
│                                    │
│ Effects:                           │
│  ├─ Load progress on mount         │
│  ├─ Restore position when ready    │
│  └─ Save on unmount                │
└────────────────────────────────────┘
```

## Security Layer

```
┌────────────────────────────────────────────────────────┐
│                   Row-Level Security                    │
├────────────────────────────────────────────────────────┤
│                                                         │
│  SELECT * FROM user_books WHERE user_id = auth.uid()   │
│                                                         │
│  UPDATE user_books                                      │
│  SET last_page = ?                                      │
│  WHERE user_id = auth.uid() AND book_id = ?            │
│                                                         │
│  Policy: Users can only read/update their own rows     │
│                                                         │
└────────────────────────────────────────────────────────┘

Application Layer:
┌────────────────────────────────────────────────────────┐
│  const userId = session.user.id; // From auth session  │
│                                                         │
│  readingProgressService.saveProgress(                  │
│    userId,    // ← Always user's own ID                │
│    bookId,                                              │
│    { ... }                                              │
│  )                                                      │
│                                                         │
│  ✅ No cross-user data access possible                 │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## Performance Optimization

```
Throttling Strategy:
─────────────────────────────────────────────────────
Time:     0ms   500ms  1000ms  1500ms  2000ms  2500ms
─────────────────────────────────────────────────────
Scroll:   ●      ●      ●       ●       ●       ●
          │      │      │       │       │       │
          ▼      ▼      ▼       ▼       ▼       ▼
Save:     ✓             ✓               ✓       
          (saved)    (skipped)       (saved)  (saved)

Result: Saves every 500ms instead of every scroll event
        Reduces DB calls by ~80-90%
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Try Save Progress                      │
└─────────────────────────┬────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
           ┌────▼────┐         ┌────▼────┐
           │ Success │         │  Error  │
           └────┬────┘         └────┬────┘
                │                   │
                ▼                   ▼
         Update UI            Log Error
         Return %             Return null
         Continue reading     Continue reading
                              (No UI disruption)
```

---

**Legend:**
- `►` = Function call
- `◄` = Return value
- `●` = Event
- `✓` = Action performed
- `┌─┐` = Component/System boundary
