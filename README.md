# 📚 Book Club App

A comprehensive React Native Expo application for book enthusiasts to discover, discuss, and manage their reading experiences. Built with Supabase backend for real-time data management and secure authentication.

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration**: Secure signup with email confirmation
- **User Login**: Email/password authentication with Supabase
- **Admin Access**: Hardcoded admin login (`admin@gmail.com` / `123456`)
- **Session Management**: Persistent login sessions across app restarts

### 👥 Admin Panel
- **User Management**: View all registered users, delete users
- **Book Management**: Add, edit, and manage book catalog
- **Profile Management**: Admin profile settings and avatar upload
- **Dashboard**: Comprehensive admin controls and statistics

### 📖 Book Features
- **Book Catalog**: Browse curated collection of classic books
- **Book Details**: Full book content, descriptions, and cover images
- **Reading Experience**: Full-text book content with proper formatting
- **Search & Filter**: Find books by title, author, or genre

### 🎨 User Interface
- **Modern Design**: Beautiful gradient backgrounds and card-based layouts
- **Responsive**: Optimized for mobile and web platforms
- **Dark Theme**: Consistent dark theme with cyan accents
- **Intuitive Navigation**: Easy-to-use sidebar and modal interfaces

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: React Native StyleSheet with Linear Gradients
- **Image Handling**: Expo Image Picker
- **Navigation**: React Navigation (built-in Expo Router)
- **Database**: Supabase PostgreSQL with Row Level Security

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/bleonitadeskaj1-droid/Book-Club.git
   cd Book-Club
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `supabase.js`
   - Run the SQL setup scripts in your Supabase SQL editor:
     - `create-profiles-table.sql` - Creates users table with proper RLS
     - `create-reviews-table.sql` - Creates reviews table
     - `fix-books-table-rls.sql` - Sets up books table permissions

4. **Start the development server**
   ```bash
   npx expo start --web
   ```

5. **Access the app**
   - Web: Open `http://localhost:8085` in your browser
   - Mobile: Scan QR code with Expo Go app

## 📱 Usage

### For Regular Users
1. **Register**: Create account with email (confirmation required)
2. **Login**: Use email/password to access the app
3. **Browse Books**: Explore the book catalog
4. **Read Books**: Access full book content

### For Admins
1. **Login**
2. **User Management**: View and delete users from admin panel
3. **Book Management**: Add new books to the catalog
4. **Profile Settings**: Manage admin profile and avatar

## 🗄️ Database Schema

### Tables
- **profiles**: User profiles with roles (user/admin)
- **books**: Book catalog with full content
- **reviews**: User book reviews and ratings

### Row Level Security
- Profiles table: Allows authenticated operations
- Books table: Public read access, admin write access
- Reviews table: User-specific access

## 🔧 Configuration

### Environment Variables
Update `supabase.js` with your Supabase credentials:
```javascript
const supabaseUrl = 'your-supabase-url';
const supabaseAnonKey = 'your-anon-key';
```

## 🐛 Troubleshooting

### Common Issues

**User deletion not working**
- Ensure RLS policies are properly configured in Supabase
- Run the SQL scripts in the correct order

**Email confirmation not received**
- Check your Supabase email settings
- Verify the email address is correct

**Admin login not working**
- Ensure the hardcoded credentials are used exactly
- Check browser console for authentication errors

**Books not loading**
- Verify the books table exists and has data
- Check Supabase connection and permissions

## 📝 Development

### Project Structure
```
Book-Club/
├── screens/           # Main app screens
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── AdminScreen.js
│   └── BookListScreen.js
├── components/        # Reusable components
│   └── AdminSidebar.js
├── services/          # API and utility functions
├── supabase.js        # Supabase configuration
└── *.sql             # Database setup scripts
```

### Key Components
- **App.js**: Main navigation and authentication state
- **AdminScreen.js**: Complete admin dashboard
- **AdminSidebar.js**: Admin controls and user management
- **LoginScreen.js**: Authentication interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- Backend powered by [Supabase](https://supabase.com/)
- Book content sourced from Project Gutenberg
- UI inspired by modern mobile design patterns

---

**Happy Reading! 📖✨**
