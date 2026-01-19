# Book Club Database Access Rules & RLS Policies

## Overview
This database implements a comprehensive Row Level Security (RLS) system that ensures proper data isolation while allowing necessary access for users and administrators.

## Tables & Access Rules

### 1. Profiles Table
**Purpose**: Extends Supabase auth.users with role information

**Access Rules**:
- **Users**: Can view, insert, and update ONLY their own profile
- **Admins**: Can view and update ALL profiles (for role management)
- **Public**: No access (requires authentication)

**RLS Policies**:
- `Users can view own profile` - SELECT using auth.uid() = id
- `Users can update own profile` - UPDATE using auth.uid() = id
- `Users can insert own profile` - INSERT with auth.uid() = id check
- `Admins can view all profiles` - SELECT for admin role users
- `Admins can update all profiles` - UPDATE for admin role users

### 2. Books Table
**Purpose**: Stores book information and content

**Access Rules**:
- **Everyone**: Can READ all books (public access)
- **Users**: Cannot modify books
- **Admins**: Can INSERT, UPDATE, DELETE books

**RLS Policies**:
- `Everyone can view books` - SELECT using true (public read)
- `Admins can insert books` - INSERT with admin role check
- `Admins can update books` - UPDATE with admin role check
- `Admins can delete books` - DELETE with admin role check

### 3. User Books Table
**Purpose**: Tracks user reading progress, favorites, and personal book status

**Access Rules**:
- **Users**: Can view, insert, update, delete ONLY their own user_books records
- **Admins**: Can view ALL user_books records
- **Other Users**: Cannot see anyone's user_books (complete privacy)

**RLS Policies**:
- `Users can view own user_books` - SELECT using auth.uid() = user_id
- `Users can insert own user_books` - INSERT with auth.uid() = user_id check
- `Users can update own user_books` - UPDATE using auth.uid() = user_id
- `Users can delete own user_books` - DELETE using auth.uid() = user_id
- `Admins can view all user_books` - SELECT for admin role users

### 4. Reviews Table
**Purpose**: Stores user reviews and ratings for books

**Access Rules**:
- **Everyone**: Can READ all reviews (public)
- **Users**: Can insert reviews, update/delete ONLY their own reviews
- **Admins**: Can delete ANY review (moderation)

**RLS Policies**:
- `Everyone can view reviews` - SELECT using true (public read)
- `Users can insert reviews` - INSERT with auth.uid() = user_id check
- `Users can update own reviews` - UPDATE using auth.uid() = user_id
- `Users can delete own reviews` - DELETE using auth.uid() = user_id
- `Admins can delete reviews` - DELETE for admin role users

## Security Implementation Details

### Authentication Integration
- Uses Supabase Auth for user management
- Automatic profile creation via trigger on user signup
- Default role is 'user', admins must be manually assigned

### Data Isolation
- User-specific data (user_books) is completely private
- Users cannot see other users' reading progress or favorites
- Reviews are public but users can only modify their own

### Admin Privileges
- Admins have full access to manage books and users
- Admins can moderate reviews by deleting inappropriate content
- Admin role is checked via subquery to profiles table

### Automatic Features
- Timestamps are automatically updated via triggers
- Profile creation is handled automatically on signup
- Unique constraints prevent duplicate entries

## Usage Examples

### For Regular Users:
```sql
-- Can read all books
SELECT * FROM books;

-- Can read all reviews
SELECT * FROM reviews;

-- Can only see their own user_books
SELECT * FROM user_books WHERE user_id = auth.uid();

-- Can insert/update their own data
INSERT INTO user_books (book_id, status) VALUES (book_id, 'reading');
```

### For Admins:
```sql
-- Can manage all books
INSERT INTO books (title, author) VALUES ('New Book', 'Author');
UPDATE books SET title = 'Updated' WHERE id = book_id;
DELETE FROM books WHERE id = book_id;

-- Can see all user data
SELECT * FROM user_books;
SELECT * FROM profiles;

-- Can moderate reviews
DELETE FROM reviews WHERE id = review_id;
```

## Important Notes

1. **No Silent Failures**: All policies explicitly check permissions
2. **Complete Isolation**: User data is fully private between users
3. **Public Reading**: Books and reviews are accessible to everyone
4. **Admin Control**: Admins have full content management capabilities
5. **Automatic Setup**: Triggers handle profile creation and timestamp updates

This RLS implementation provides a secure, scalable foundation for the Book Club application while maintaining proper data privacy and access controls.