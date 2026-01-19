# UI/UX Visual Guide

## Screen Layouts

### Login Flow
```
┌─────────────────────────┐
│  📚 Book Club           │
│                         │
│  Email: [___________]   │
│  Pass:  [___________]   │
│                         │
│    [Login]  [Register]  │
│                         │
└─────────────────────────┘
```

### Profile Dashboard (Main Screen)

#### View Mode
```
┌─────────────────────────────────────┐
│  Profile                            │
├─────────────────────────────────────┤
│                                     │
│          ⭕  (Avatar)              │
│      Your Full Name                 │
│      you@email.com                  │
│      @yourUsername                  │
│                                     │
│      Your bio or description        │
│      goes here (optional)           │
│                                     │
│      ✏️  [Edit Profile]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📖   📋   ✓   ⭐   ❤️            │
│ Reading To Read Finished Reviews Fav │
│                                     │
│ ┌──────────────────────┐            │
│ │  [Cover]             │            │
│ │  Book Title          │  📖 Tag    │
│ │  Author Name         │            │
│ └──────────────────────┘            │
│                                     │
│ ┌──────────────────────┐            │
│ │  [Cover]             │            │
│ │  Book Title 2        │  📋 Tag    │
│ │  Author Name         │            │
│ └──────────────────────┘            │
│                                     │
├─────────────────────────────────────┤
│    🚪  [Logout]                     │
│                                     │
└─────────────────────────────────────┘
```

#### Edit Mode
```
┌─────────────────────────────────────┐
│  Profile                            │
├─────────────────────────────────────┤
│                                     │
│          ⭕  (Avatar)              │
│          📷 Camera Button           │
│      (to upload photo)              │
│                                     │
│  Full Name *                        │
│  [________________________]          │
│                                     │
│  Username (optional)                │
│  [________________________]          │
│                                     │
│  Bio (optional)                     │
│  [________________________]          │
│  [________________________]          │
│  [________________________]          │
│                                     │
│  [Cancel]        [✓ Save Changes]  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ... (tabs and content below)      │
│                                     │
└─────────────────────────────────────┘
```

## Tab Sections

### Each Tab Layout
```
┌────────────────────────────────┐
│ Book Cards:                     │
│                                 │
│  ┌──────────┐                   │
│  │          │  Title            │
│  │  Cover   │  Author           │
│  │  Image   │  [Status Badge]   │
│  │          │                   │
│  └──────────┘                   │
│                                 │
│  ┌──────────┐                   │
│  │          │  Title            │
│  │  Cover   │  Author           │
│  │  Image   │  [Status Badge]   │
│  │          │                   │
│  └──────────┘                   │
│                                 │
└────────────────────────────────┘
```

### Review Card (Reviews Tab)
```
┌────────────────────────────────┐
│  ┌────────┐                     │
│  │ Cover  │  Title              │
│  │ Image  │  Author             │
│  └────────┘  ⭐⭐⭐⭐⭐ 5/5    │
│                                 │
│  "This book was amazing! I      │
│   couldn't put it down. Really  │
│   recommending it to friends."  │
│                                 │
└────────────────────────────────┘
```

## Color Scheme

### Primary Colors
```
Primary Blue:    #2563eb  (button, active, links)
Text Dark:       #0f172a  (main text)
Text Light:      #64748b  (secondary text)
Background:      #f8fafc  (page background)
Card White:      #ffffff  (cards, sections)
Border Gray:     #e2e8f0  (dividers, borders)
```

### Status Badges
```
To Read:    #94a3b8 (gray)
Reading:    #f59e0b (orange)
Finished:   #10b981 (green)
```

### Action Colors
```
Danger:     #ef4444 (logout)
Success:    #10b981 (finished, positive)
Warning:    #f59e0b (reading, attention)
```

## Typography

### Font Sizes
```
Display:        22px (700 weight) - "Your Name"
Headline:       16px (600 weight) - "Full Name"
Body:           14px (400 weight) - regular text
Label:          13px (600 weight) - form labels
Small:          12px (400 weight) - secondary info
Tiny:           11px (500 weight) - badges, meta
```

### Examples
```
Display
  Your Full Name
  
Headline  
  Profile          Edit Profile       Reviews

Body
  you@email.com
  Your bio or description

Small
  Author Name      @username

Tiny
  Reading (5)  To Read (3)  Finished (12)
  ⭐⭐⭐⭐⭐ 5/5
```

## Spacing Scale

```
4px   - tiny gaps (icon padding)
8px   - small spacing (component spacing)
12px  - standard spacing (tab padding, content padding)
16px  - section spacing (card margins, headers)
24px  - large spacing (card padding)
48px  - empty states
```

## Icon Usage

```
person          - Avatar placeholder
camera          - Upload avatar button
pencil          - Edit button
checkmark       - Save/confirm
close, times    - Cancel/close
book            - Reading tab / placeholder
bookmark        - To Read section
checkmark-circle - Finished section
star            - Reviews/ratings
heart           - Favorites
log-out         - Logout button
arrow-back      - Back navigation (if needed)
```

## Interactive States

### Button States
```
Default: Blue background, white text
Hover:   Slightly darker blue
Pressed: Even darker, slight scale down
Disabled: 60% opacity, can't tap
Loading: Spinner instead of text
```

### Tab States
```
Inactive:  Gray text, transparent background
Active:    Blue text, blue bottom border
Hover:     Light gray background
```

### Input States
```
Default:   Light gray border, white background
Focused:   Blue border, cursor visible
Disabled:  Gray text, can't edit
Error:     Red border, red text hint
```

## Responsive Behavior

```
Phone (375px+):
- Full width cards with 16px margins
- Tab labels hidden (show icons only)
- Single column layout

Tablet (600px+):
- Centered cards with max-width
- Tab labels visible
- Two column layout optional
```

## Animation & Transitions

```
Tab Switch:      100ms fade
Card Appearance: 200ms scale + fade
Button Press:    50ms scale
Loading Spinner: Continuous rotation
```

## Accessibility

```
Colors not only indicator:
- Status shown with color AND text badge
- Ratings shown with stars AND number
- Buttons have text, not icon-only

Touch Targets:
- Minimum 44x44pt for interactive elements
- Generous padding around buttons
- Large tap areas on tabs

Safe Areas:
- Respects notch/home indicator
- Uses SafeAreaView
- Proper padding on all edges
```

---

This creates a **modern, professional, clean UI** that feels production-ready! ✨
