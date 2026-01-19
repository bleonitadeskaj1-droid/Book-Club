# Book Club App

A comprehensive book club application built with React Native (Expo) and Supabase.

## Features

### Public Features
- Browse book collection
- Search books by title or author
- View book details and content

### Authenticated User Features
- User registration and login
- Password reset functionality
- Read books with progress tracking
- Write and view book reviews
- Rate books (1-5 stars)
- Add/remove books from favorites
- Personal reading progress
- Profile dashboard with reading lists (Currently Reading, Finished, To Read)
- Organized reviews and favorites management

### Admin Features
- Full book management (CRUD operations)
- User management and role assignment
- Review moderation
- Analytics dashboard
- Content management

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **UI**: Custom responsive design with gradients
- **Icons**: Expo Vector Icons
- **State Management**: React hooks

## Database Schema

The app uses the existing Supabase database with these tables:
- `books` - Book catalog
- `profiles` - User profiles and roles
- `reviews` - Book reviews and ratings
- `user_favorites` - User's favorite books
- `user_reading_status` - Reading progress tracking

## Getting Started

1. **Prerequisites**
   - Node.js and npm
   - Expo CLI
   - Supabase account

2. **Installation**
   ```bash
   npm install
   ```

3. **Configuration**
   - Supabase configuration is already set up in `supabase.js`
   - Database schema and RLS policies are pre-configured

4. **Running the App**
   ```bash
   npm start
   ```

5. **Testing**
   - Web: Press `w` in Expo CLI
   - Mobile: Scan QR code with Expo Go app

## User Roles & Navigation

- **User**: Can browse books, read, review, and track progress
  - **Default Landing Tab**: Profile (after login)
  - **Available Tabs**: Books (browse), Profile (personal dashboard)
  
- **Admin**: Full access to manage books, users, and reviews
  - **Email-Based Access**: admin@gmail.com only
  - **Default Landing Tab**: Admin (after login)
  - **Available Tabs**: Books, Profile, Admin (management), Users, Reviews, Analytics

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for user-specific actions
- Admin-only operations protected by email-based role checks (admin@gmail.com)
- Platform-aware logout (web: window.confirm, mobile: native Alert)
- Session management via Supabase auth with global state tracking

## Design & Styling

- **Color Palette**: Professional cream theme
  - Primary: #E8DCC4 (warm cream)
  - Primary Dark: #D4C5A9 (muted cream)
  - Primary Light: #F5F5DC (light cream)
  - Status: Reading (orange #f59e0b), Finished (green #10b981)
  
- **Typography & Spacing**: Professional, readable design with consistent sizing
- **Shadows & Borders**: Subtle depth and visual hierarchy
- **Responsive Layout**: Fixed card width (320px) for consistency across all devices

## Development Notes

- All buttons are fully functional and responsive
- Database operations use proper error handling with try/catch
- Authentication state is managed globally via React hooks
- Components are modular and reusable
- Code follows React Native best practices
- Responsive design ensures identical layout on web and mobile
- Platform detection handles OS-specific behaviors (web vs native)
- Unified UI across platforms with cream color palette