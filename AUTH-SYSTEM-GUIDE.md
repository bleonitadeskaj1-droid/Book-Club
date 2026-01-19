# Authentication System - Unified Design Guide

## Overview

The authentication system now features a **unified, consistent design** across all three flows:
- **Login** - Sign in to existing account
- **Sign Up** - Create new account
- **Forgot Password** - Reset password via email

All screens share the same:
- 🎨 Visual design and color system
- 📐 Layout structure and spacing
- ⌨️ Input component styles
- 🔘 Button styles and states
- 💬 Error and success messaging
- ⌛ Loading states

---

## Design System

### Color Palette (Purple Theme)

```javascript
// Primary Colors
primary: '#6366f1'           // Main interactive purple
primaryDark: '#4f46e5'       // Darker variant
primaryLight: '#818cf8'      // Lighter variant

// Backgrounds
background: '#fafafa'        // Light gray page background
backgroundSecondary: '#ffffff' // White for cards/inputs

// Text
text: '#1a1a1a'              // Dark text (primary)
textSecondary: '#737373'     // Medium gray (secondary)
textMuted: '#a3a3a3'         // Light gray (muted)
textInverse: '#ffffff'       // White (on dark backgrounds)

// Semantic
error: '#ef4444'             // Red for errors
success: '#22c55e'           // Green for success
border: '#e5e5e5'            // Light borders
disabled: '#d4d4d8'          // Disabled state
```

### Typography

- **Title**: 32px, 800 weight, primary purple
- **Subtitle**: 16px, 500 weight, secondary text
- **Body**: 14-16px, 400 weight, primary text
- **Labels**: 12px, 600 weight, uppercase
- **Button**: 16px, 700 weight, white text

### Spacing System

All spacing uses responsive scaling:
- Inputs: 16px padding (horizontal/vertical)
- Margins: 8-24px between sections
- Form fields: 16px gap
- Container: 40px vertical padding

---

## Screen Layouts

### 1. Login Screen

**Header Section:**
- 📚 Emoji (56px)
- "Book Club" title
- "Welcome back!" subtitle

**Form Section:**
- Email input
- Password input
- Sign In button
- "Forgot Password?" link
- "Create Account" link

**Features:**
- Real-time validation feedback
- Clear error messages
- Loading state during authentication
- Focus state visual feedback

### 2. Sign Up Screen

**Header Section:**
- 📚 Emoji (56px)
- "Book Club" title
- "Join our community!" subtitle

**Form Section:**
- Email input
- Password input (with strength indicator)
- Confirm Password input (with match validation)
- Create Account button
- "Already have an account?" link

**Features:**
- Password strength indicator (weak/medium/strong)
- Real-time password match validation
- Visual confirmation when passwords match
- Error messages for all fields
- Success message with auto-redirect to login

### 3. Forgot Password Screen

**Header Section (Form State):**
- 🔐 Emoji (56px)
- "Reset Password" title
- "We'll help you regain access" subtitle

**Header Section (Success State):**
- Shows success message
- "Return to Sign In" button

**Form Section:**
- Email input
- Send Reset Link button
- "Remember your password?" link

**Features:**
- Switches to success state after email sent
- Auto-redirects to login after 3 seconds
- Clear instructions
- Professional error handling

---

## Input Components

### Standard Input

**Structure:**
```
[Label: "Email Address" - uppercase, 12px]
[Input field - 16px padding, purple border on focus]
[Optional helper text below]
```

**States:**
1. **Idle**: Light border, light background
2. **Focus**: Purple border (2px), subtle shadow
3. **Error**: Red border, error message below
4. **Disabled**: Reduced opacity, no interaction

**Features:**
- Focus ring with shadow
- Placeholder text in muted color
- Accessible labels
- Error states with messages
- Helper text for guidance

### Password Input

**Special Features:**
- Masked text entry
- Password strength indicator (on Sign Up)
- Match validation (on Sign Up)
- Visual feedback for strength

---

## Buttons

### Primary Button (Sign In/Create Account/Send Reset Link)

**Default State:**
- Purple background (#6366f1)
- White text (16px, 700 weight)
- 48px minimum height
- Rounded corners (12px)
- Shadow effect
- Full width

**States:**
1. **Active**: Purple with shadow
2. **Pressed**: Opacity 0.8
3. **Disabled**: 60% opacity, gray background

**Loading State:**
- Activity indicator
- "Signing In..." / "Creating Account..." text
- Button disabled during request

### Link Button (Navigation)

**Style:**
- Text only
- Purple text on default
- No background
- Tap target: 44px minimum

**States:**
1. **Default**: Secondary text with purple links
2. **Pressed**: Opacity change
3. **Disabled**: Reduced opacity

---

## Validation & Error Handling

### Email Validation

```javascript
// Email must be valid format
✓ user@example.com
✓ name.surname@company.co.uk
✗ invalid@
✗ @nodomain.com
```

### Password Validation

```javascript
// Minimum 6 characters
// Strength indicator:
- 0-5 chars: Weak (red)
- 6-9 chars: Medium (amber)
- 10+ chars: Strong (green)
```

### Error Messages

**Clear, user-friendly messaging:**

| Issue | Message |
|-------|---------|
| Empty field | "[Field] is required" |
| Invalid email | "Please enter a valid email address" |
| Weak password | "Password must be at least 6 characters long" |
| Passwords don't match | "Passwords do not match" |
| Email taken | "This email is already registered. Please sign in instead." |
| Invalid credentials | "Invalid email or password. Please try again." |
| Email unconfirmed | "Please confirm your email address before signing in." |

### Success Messages

**Sign Up Success:**
```
"Account created successfully! 
Check your email to confirm your account."
→ Auto-redirect to login after 2 seconds
```

**Password Reset Success:**
```
"✓ Password reset email sent!
Check your email for a link to reset your password.
The link will expire after a few hours."
→ Auto-redirect to login after 3 seconds
```

---

## Navigation Flow

```
┌─────────────────────────────────────┐
│          LOGIN SCREEN               │
│                                     │
│  Email input                        │
│  Password input                     │
│  [Sign In Button]                  │
│                                     │
│  "Forgot Password?" ──────────┐    │
│  "Create Account?" ──────┐    │    │
└─────────────────────────┼────┼────┘
                          │    │
                    ┌─────▼──┐ │
                    │ SIGN UP │ │
                    │ SCREEN  │ │
                    └─────┬──┘ │
                          │    │
                    ┌─────────────────┐
                    │ FORGOT PASSWORD │
                    │ SCREEN          │
                    │                 │
                    │ (Back to Login) │
                    └─────────────────┘
```

All screens have **back navigation** to previous screen.

---

## Keyboard Handling

### Features

- **KeyboardAvoidingView**: Prevents input overlap
- **ScrollView**: Enables scrolling on small screens
- **keyboardShouldPersistTaps="handled"**: Better UX
- **Proper padding**: Adequate space for keyboard

### Behavior

- Focus → Input moves above keyboard
- Blur → Normal layout restored
- Large content → Scrollable
- Small screens → Maintains full content visibility

---

## Accessibility

### Features

- **Semantic labels**: All inputs have labels
- **High contrast**: Text meets WCAG standards
- **Touch targets**: All buttons 44px+ minimum
- **Focus indicators**: Clear visual feedback
- **Error announcements**: Inline error messages
- **Helper text**: Guidance for inputs

### Keyboard Navigation

- Tab order: Email → Password → Button → Links
- Enter triggers button action
- Clear focus rings on all interactive elements

---

## Implementation Details

### Shared Styles File: `styles/authStyles.js`

Exports:
- `COLORS` - Color constants
- `authStyles` - StyleSheet with all common styles
- `scaleFont()` - Responsive font scaling
- `scaleSize()` - Responsive size scaling
- `validateEmail()` - Email validation
- `validatePassword()` - Password validation
- `validatePasswordMatch()` - Confirm password validation
- `getPasswordStrength()` - Password strength calculator
- `getErrorMessage()` - User-friendly error messages

### Screen Files

Each screen imports and uses:
```javascript
import {
  authStyles,
  COLORS,
  scaleFont,
  scaleSize,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getPasswordStrength,
  getErrorMessage,
} from '../styles/authStyles';
```

---

## Loading & Async States

### Loading Behavior

**During submission:**
1. Button disabled
2. Text changes to "Signing In..." / "Creating Account..." / "Sending..."
3. Activity indicator visible
4. Inputs remain visible but disabled
5. Loading state prevents double-submission

**After submission:**
1. If error: Display error message, button re-enabled
2. If success: Show success message, auto-redirect or stay

---

## Password Reset Flow (Email)

### Step 1: Enter Email
```
User enters email → Validation → Send request
```

### Step 2: Email Sent
```
"✓ Password reset email sent!
Check your email for a link to reset your password.
The link will expire after a few hours."

Auto-redirect to Login after 3 seconds
```

### Step 3: User Clicks Email Link
```
Link redirects to: bookclub://reset-password
Supabase handles password update
User can then sign in with new password
```

---

## Testing Checklist

- [ ] **Login**: Valid email/password → Success
- [ ] **Login**: Invalid email → Error message
- [ ] **Login**: Wrong password → Error message
- [ ] **Login**: Empty field → Error message
- [ ] **Login**: "Forgot Password" link works
- [ ] **Login**: "Sign Up" link works
- [ ] **Sign Up**: Valid email/password → Success + redirect
- [ ] **Sign Up**: Email already exists → Error message
- [ ] **Sign Up**: Weak password → Error message
- [ ] **Sign Up**: Passwords don't match → Error visible
- [ ] **Sign Up**: Password strength indicator works
- [ ] **Sign Up**: "Sign In" link works
- [ ] **Forgot Password**: Valid email → Success + redirect
- [ ] **Forgot Password**: Invalid email → Error message
- [ ] **Forgot Password**: "Sign In" link works
- [ ] **All screens**: Keyboard doesn't overlap inputs
- [ ] **All screens**: Loading states work correctly
- [ ] **All screens**: Error messages clear on input change
- [ ] **All screens**: Disabled state prevents interaction
- [ ] **All screens**: Colors match purple theme

---

## Future Enhancements

1. **Social Login**: Google, GitHub OAuth
2. **Biometric Auth**: Touch ID / Face ID on iOS
3. **Two-Factor Auth**: SMS verification
4. **Email Verification**: Resend verification email
5. **Account Recovery**: Security questions
6. **Password History**: Prevent reuse
7. **Session Management**: Auto-logout on timeout
8. **Remember Me**: Device trusted login

---

## Design Philosophy

This unified authentication system follows these principles:

1. **Consistency**: Same design across all flows
2. **Clarity**: Clear labels and error messages
3. **Feedback**: Loading states and validation messages
4. **Accessibility**: WCAG compliant, keyboard navigable
5. **Professional**: Modern purple theme, clean layout
6. **Efficient**: Minimal fields, quick validation
7. **Responsive**: Works on all screen sizes
8. **Secure**: Standard auth best practices

---

## Quick Reference

### File Locations
```
screens/
├── LoginScreen.js
├── RegisterScreen.js
└── ForgotPasswordScreen.js

styles/
└── authStyles.js
```

### Import Pattern
```javascript
import {
  authStyles,
  COLORS,
  scaleFont,
  scaleSize,
  validateEmail,
  getErrorMessage,
} from '../styles/authStyles';
```

### Color Reference
```
Purple (Primary): #6366f1
Error (Red): #ef4444
Success (Green): #22c55e
Text (Dark): #1a1a1a
```

---

**Created**: January 16, 2026  
**Status**: ✅ Production Ready  
**Theme**: Purple (Unified)  
**Screens**: 3 (Login, Sign Up, Forgot Password)
