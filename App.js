import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';

// Import screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import BookListScreen from './screens/BookListScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import ReaderScreen from './screens/ReaderScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';

const COLORS = {
  primary: '#E8DCC4',
  primaryDark: '#D4C5A9',
  primaryLight: '#F5F5DC',
  background: '#fafafa',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#737373',
  border: '#e5e5e5',
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('main'); // Start with main/home screen (public)
  const [activeTab, setActiveTab] = useState('books');
  const [role, setRole] = useState('user');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // For protected actions
  const [pendingAction, setPendingAction] = useState(null); // Store action to execute after login

  // Helper: determine admin status based ONLY on email
  const resolveUserRole = async (sessionObj) => {
    try {
      if (!sessionObj?.user) {
        console.log('✅ resolveUserRole: no session, defaulting to user/books');
        setRole('user');
        setActiveTab('books');
        return 'user';
      }

      const userEmail = sessionObj.user.email || '';
      const isAdmin = userEmail === 'admin@gmail.com';
      
      console.log('🔐 resolveUserRole: checking email', {
        email: userEmail,
        isAdmin,
      });

      // Admin check: ONLY by email, no other logic
      if (isAdmin) {
        console.log('✅ Admin detected:', userEmail);
        setRole('admin');
        setActiveTab('admin');
        return 'admin';
      } else {
        console.log('✅ User (non-admin):', userEmail);
        setRole('user');
        setActiveTab('profile');
        return 'user';
      }
    } catch (e) {
      console.error('❌ resolveUserRole error:', e);
      setRole('user');
      setActiveTab('books');
      return 'user';
    }
  };


  useEffect(() => {
    console.log('🚀 App starting...');
    
    // Immediately show home screen (public)
    setLoading(false);
    setScreen('main');
    
    // Initialize auth in background (non-blocking)
    const initApp = async () => {
      try {
        // Check for hardcoded admin session first
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const fakeAdminData = await AsyncStorage.getItem('fake-admin-session');
        
        if (fakeAdminData) {
          console.log('🔑 HARDCODED ADMIN SESSION FOUND');
          const fakeSession = JSON.parse(fakeAdminData);
          setSession(fakeSession);
          setRole('admin');
          setActiveTab('admin');
          console.log('✅ Admin session restored (hardcoded)');
          return; // Skip Supabase check
        }
        
        // Normal Supabase session check
        console.log('📡 Checking auth session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ User found during init:', session.user.email);
          setSession(session);
          const resolvedRole = await resolveUserRole(session);
          setScreen('main');
          setShowLoginModal(false);
          setShowProfileModal(false);
          console.log('✅ Init navigation set', { resolvedRole, activeTab: resolvedRole === 'admin' ? 'admin' : 'books' });
        } else {
          console.log('No user session found - showing public home screen');
          setRole('user');
          setActiveTab('books');
        }
      } catch (err) {
        console.error('❌ Auth init error:', err);
      }
    };

    initApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        setSession(session);
        if (session?.user) {
          console.log('✅ Auth change: user authenticated', session.user.email);
          const resolvedRole = await resolveUserRole(session);
          // Keep user on main screen (don't redirect away)
          setScreen('main');
          setShowLoginModal(false);
          setShowProfileModal(false);
          setActiveTab(resolvedRole === 'admin' ? 'admin' : 'profile');
          console.log('✅ User logged in - navigation ready', { resolvedRole, tab: resolvedRole === 'admin' ? 'admin' : 'profile' });
          
          // Execute any pending action
          if (pendingAction) {
            console.log('⏳ Executing pending action after login...');
            pendingAction();
            setPendingAction(null);
          }
        } else {
          console.log('User signed out - public features still available');
          setRole('user');
          setActiveTab('books');
          setShowLoginModal(false);
          setShowProfileModal(false);
          // Keep showing main screen (public browsing)
          setScreen('main');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check for fake admin session when login modal closes
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const fakeAdminData = await AsyncStorage.getItem('fake-admin-session');
        
        if (fakeAdminData && !session) {
          console.log('🔑 Fake admin session detected after modal close');
          const fakeSession = JSON.parse(fakeAdminData);
          setSession(fakeSession);
          setRole('admin');
          setActiveTab('admin');
          setScreen('main');
          console.log('✅ Admin session restored');
        }
      } catch (err) {
        console.error('Error checking admin session:', err);
      }
    };
    
    // Check when login modal is closed
    if (!showLoginModal) {
      checkAdminSession();
    }
  }, [showLoginModal]);
  
  // Handle logout (including fake admin)
  const handleLogout = async () => {
    console.log('🚪 Logging out...');
    
    // Clear fake admin session if exists
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('fake-admin-session');
    } catch (err) {
      console.error('Error clearing admin session:', err);
    }
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Reset state
    setSession(null);
    setRole('user');
    setActiveTab('books');
    setShowLoginModal(false);
    setShowProfileModal(false);
    setScreen('main');
    console.log('✅ Logged out successfully');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return <LoginScreen onNavigate={setScreen} />;
      case 'register':
        return <RegisterScreen onNavigate={setScreen} />;
      case 'forgot':
        return <ForgotPasswordScreen onNavigate={setScreen} />;
      case 'main':
        return (
          <View style={styles.mainContainer}>
            {/* SAFETY GUARD: Reject non-admins immediately */}
            {activeTab === 'admin' && role !== 'admin' ? (
              // Safety fallback: non-admin tried to access admin
              <BookListScreen
                session={session}
                onSelectBook={(book) => {
                  setSelectedBook(book);
                  setShowBookDetail(true);
                }}
                onMenuPress={() => {
                  if (session?.user) {
                    setShowProfileModal(true);
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                onRequireAuth={(callback) => {
                  setPendingAction(() => callback);
                  setShowLoginModal(true);
                }}
                showProfileModal={showProfileModal}
                showLoginModal={showLoginModal}
              />
            ) : activeTab === 'admin' && role === 'admin' ? (
              // Admin screen - ADMIN ONLY
              <AdminScreen session={session} onLogout={handleLogout} />
            ) : activeTab === 'profile' && !showProfileModal && session?.user ? (
              // Profile screen - PROTECTED (requires authentication)
              <ProfileScreen
                session={session}
                onLogout={handleLogout}
                onRead={(book) => {
                  setSelectedBook(book);
                  setShowReader(true);
                }}
              />
            ) : activeTab === 'profile' && !session?.user ? (
              // User not authenticated - show login prompt for profile
              <View style={styles.authPromptContainer}>
                <Text style={styles.authPromptTitle}>📚 Profile</Text>
                <Text style={styles.authPromptText}>Sign in to view your reading profile and track your books.</Text>
                <TouchableOpacity
                  style={styles.authPromptButton}
                  onPress={() => setShowLoginModal(true)}
                >
                  <Text style={styles.authPromptButtonText}>Sign In Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Home screen - PUBLIC (no login required)
              <BookListScreen
                session={session}
                onSelectBook={(book) => {
                  setSelectedBook(book);
                  setShowBookDetail(true);
                }}
                onMenuPress={() => {
                  if (session?.user) {
                    setShowProfileModal(true);
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                onRequireAuth={(callback) => {
                  // Store pending action and show login modal
                  setPendingAction(() => callback);
                  setShowLoginModal(true);
                }}
                showProfileModal={showProfileModal}
                showLoginModal={showLoginModal}
              />
            )}

            {/* Profile Modal Overlay */}
            {showProfileModal && session?.user && (
              <View style={styles.modalOverlay}>
                <ProfileScreen
                  session={session}
                  onLogout={handleLogout}
                  onClose={() => setShowProfileModal(false)}
                  onRead={(book) => {
                    setSelectedBook(book);
                    setShowReader(true);
                  }}
                />
              </View>
            )}

            {/* Book Detail Screen (Modal overlay) */}
            {showBookDetail && selectedBook && !showProfileModal && (
              <BookDetailScreen
                book={selectedBook}
                session={session}
                onClose={() => setShowBookDetail(false)}
                onRead={(book) => {
                  setSelectedBook(book);
                  setShowReader(true);
                }}
                onRequireAuth={(callback) => {
                  setPendingAction(() => callback);
                  setShowLoginModal(true);
                }}
              />
            )}

            {/* Reader Screen (Modal overlay) */}
            {showReader && selectedBook && !showProfileModal && (
              <ReaderScreen
                book={selectedBook}
                onClose={() => setShowReader(false)}
                session={session}
                onRequireAuth={(callback) => {
                  setPendingAction(() => callback);
                  setShowLoginModal(true);
                }}
              />
            )}

            {/* Login Modal for Protected Actions */}
            {showLoginModal && !session?.user && (
              <View style={styles.modalOverlay}>
                <LoginScreen 
                  onNavigate={(screen) => {
                    if (screen === 'main') {
                      setShowLoginModal(false);
                      // Reset to profile tab unless auth state sets admin
                      setActiveTab(role === 'admin' ? 'admin' : 'profile');
                      // Will auto-execute pending action via auth state change listener
                    } else {
                      setScreen(screen);
                    }
                  }}
                  onClose={() => {
                    setShowLoginModal(false);
                    setActiveTab(role === 'admin' ? 'admin' : 'profile');
                  }}
                />
              </View>
            )}

            {/* Bottom Tab Navigation (only show if not in modal) */}
            {!showProfileModal && !showLoginModal && (
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'profile' && styles.activeTab]}
                  onPress={() => {
                    if (session?.user) {
                      setActiveTab('profile');
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={activeTab === 'profile' ? '#ffffff' : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.tabLabel,
                    activeTab === 'profile' && { color: '#ffffff' }
                  ]}>
                    Profile
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'books' && styles.activeTab]}
                  onPress={() => setActiveTab('books')}
                >
                  <Ionicons
                    name="library"
                    size={24}
                    color={activeTab === 'books' ? '#ffffff' : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.tabLabel,
                    activeTab === 'books' && { color: '#ffffff' }
                  ]}>
                    Books
                  </Text>
                </TouchableOpacity>

                {/* Admin Tab - Only show for admins */}
                {role === 'admin' && (
                  <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'admin' && styles.activeTab]}
                    onPress={() => setActiveTab('admin')}
                  >
                    <Ionicons
                      name="settings"
                      size={24}
                      color={activeTab === 'admin' ? '#ffffff' : COLORS.textSecondary}
                    />
                    <Text style={[
                      styles.tabLabel,
                      activeTab === 'admin' && { color: '#ffffff' }
                    ]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      default:
        return <LoginScreen onNavigate={setScreen} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEmoji}>📚</Text>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading Book Club...</Text>
          <Text style={styles.loadingSubtext}>Getting your books ready</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 32,
  },
  authPromptTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  authPromptText: {
    fontSize: 16,
    color: '#737373',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  authPromptButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  authPromptButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  loadingText: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#6b7280',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
