# AdminScreen UI - Quick Reference

## Card Dimensions

### Book Card (Mobile & Tablet)
```
┌─────────────────────┐
│   Cover Image       │  180px (fixed)
│  (placeholder if     │
│   no image)         │
├─────────────────────┤
│ Title (2 lines)     │  90px min
│ Author (1 line)     │  (info section)
│ Genre (1 line)      │
├─────────────────────┤
│ [Edit] [Delete]     │  44px (buttons)
└─────────────────────┘

Total: ~314px height
Width: 100% (mobile), 50% (tablet)
```

---

## Button Heights & Spacing

```
Add New Book    ─┬─ 44px height (touch-friendly)
                 │  12px padding vertical
                 └─ Text + Icon

Edit Button     ─┬─ 44px height
                 │  11px padding vertical
                 │  Icon + Text
                 │  flex: 1 (equal width)
                 └─ Color: #6366f1 (indigo)

Delete Button   ─┬─ 44px height
                 │  11px padding vertical
                 │  Icon + Text
                 │  flex: 1 (equal width)
                 └─ Color: #ef4444 (red)

Generate with AI ─┬─ 44px height
                  │  12px padding vertical
                  │  100% width
                  │  Icon + Text
                  └─ Color: #8b5cf6 (purple)
```

---

## Responsive Layout

### Mobile (< 768px)
```
┌──────────────────────────────────────┐
│        AdminScreen Header            │
├──────────────────────────────────────┤
│ [Add] [Generate with AI]             │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │      Book Card 1               │  │
│  │      [Edit] [Delete]           │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │      Book Card 2               │  │
│  │      [Edit] [Delete]           │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │      Book Card 3               │  │
│  │      [Edit] [Delete]           │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
1 Column layout, Full width cards
```

### Tablet (≥ 768px)
```
┌──────────────────────────────────────────────────────┐
│        AdminScreen Header with Sidebar               │
├──────────────────────────────────────────────────────┤
│ [Add] [Generate with AI]                             │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │                  │  │                  │          │
│  │  Book Card 1     │  │  Book Card 2     │          │
│  │  [Edit] [Delete] │  │  [Edit] [Delete] │          │
│  └──────────────────┘  └──────────────────┘          │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │                  │  │                  │          │
│  │  Book Card 3     │  │  Book Card 4     │          │
│  │  [Edit] [Delete] │  │  [Edit] [Delete] │          │
│  └──────────────────┘  └──────────────────┘          │
└──────────────────────────────────────────────────────┘
2 Column layout, Equal width cards, Gap spacing
```

---

## Color System

```
Primary Colors:
  Indigo:     #6366f1  (buttons, accents)
  Red:        #ef4444  (delete, errors)
  Purple:     #8b5cf6  (Generate AI)
  Green:      #10b981  (success)

Text Colors:
  Dark:       #1a1a1a  (primary text)
  Gray:       #737373  (secondary text)
  Light:      #9ca3af  (tertiary text)

Background Colors:
  White:      #ffffff  (cards)
  Light:      #f8fafc  (page background)
  Border:     #e5e5e5  (card borders)
  Subtle:     #f0f0f0  (placeholders)
```

---

## Shadow Effect

### Card Shadows
```javascript
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 12,
elevation: 5,
```
Result: Professional depth, 4px drop, 15% opacity

### Button Shadows
```javascript
// Edit Button
shadowColor: '#6366f1',
shadowOpacity: 0.2,
shadowRadius: 4,
elevation: 3,

// Delete Button
shadowColor: '#ef4444',
shadowOpacity: 0.2,
shadowRadius: 4,
elevation: 3,
```
Result: Color-matched shadows for visual consistency

---

## Spacing Grid (8px base)

```
8px   = gap between elements
12px  = small padding
14px  = card padding
16px  = section padding
20px  = large spacing
```

---

## Typography Sizes

```
Book Title:     15px, weight 700, lineHeight 20px
Author:         13px, weight 500
Genre:          12px, italic
User Email:     15px, weight 700
User ID:        11px, monospace
User Date:      12px, secondary text
Review Title:   15px, weight 700
Review Rating:  12px, weight 700
Review Text:    13px, lineHeight 20px
```

---

## Touch Targets

All buttons: **44px minimum height**
- Meets accessibility guidelines (Apple: 44pt, Android: 48dp)
- Easy to tap on mobile devices
- Consistent across all button types

---

## Text Truncation

```
Book Title:     numberOfLines={2}  (max 2 lines)
Author:         numberOfLines={1}  (max 1 line)
Genre:          numberOfLines={1}  (max 1 line)
Review Book:    numberOfLines={1}  (max 1 line)
```

---

## Key Features

✅ **Uniform Cards**
  - All book cards same width and height
  - Fixed dimensions prevent layout shift
  - Professional alignment

✅ **Responsive Layout**
  - Mobile: 1 column, 100% width
  - Tablet: 2 columns, 50% each
  - Maintains spacing and alignment

✅ **Professional Shadows**
  - 4px drop shadows
  - 15% opacity (subtle)
  - Color-matched for buttons
  - Adds depth without heaviness

✅ **Modern Styling**
  - Light borders (#f0f0f0)
  - Consistent padding (14px)
  - Gap spacing (16px)
  - Professional colors

✅ **Readable Text**
  - Proper truncation (no overflow)
  - Consistent font sizes
  - Clear hierarchy
  - Good contrast

✅ **Functional Buttons**
  - 44px minimum height
  - Icon + text
  - Color-coded (blue for edit, red for delete)
  - Shadows for depth
  - Flex: 1 for equal width

---

## File Location
[screens/AdminScreen.js](screens/AdminScreen.js)

---

**Last Updated**: January 19, 2026  
**Status**: ✅ Production Ready
