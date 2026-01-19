import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { supabase } from '../supabase';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

const scaleSize = (size) => {
  const scale = screenWidth / 375;
  return Math.round(size * Math.min(scale, isTablet ? 1.4 : 1.1));
};

const COLORS = {
  primary: '#E8DCC4',
  primaryDark: '#D4C5A9',
  primaryLight: '#F5F5DC',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#737373',
  border: '#e5e5e5',
  error: '#ef4444',
  success: '#10b981',
};

export default function AdminScreen({ session, onLogout }) {
  // ACCESS CONTROL: Only admin@gmail.com can access
  useEffect(() => {
    if (!session?.user?.email || session.user.email !== 'admin@gmail.com') {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      if (onLogout) onLogout();
    }
  }, [session]);

  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeSection, setActiveSection] = useState('books');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    cover_url: '',
  });

  useEffect(() => {
    fetchBooks();
    fetchUsers();
    fetchReviews();
  }, []);

  const fetchUsers = async () => {
    try {
      // Import supabaseAdmin for server-side operations
      const { supabaseAdmin } = require('../supabase');
      
      // Fetch users from Supabase Auth using admin client
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('❌ Users fetch error:', error);
        Alert.alert('Error', 'Failed to load users');
        setUsers([]);
      } else {
        console.log('✅ Loaded users from Auth:', users?.length || 0);
        setUsers(users || []);
      }
    } catch (err) {
      console.error('❌ Exception fetching users:', err);
      Alert.alert('Error', 'Failed to load users: ' + err.message);
      setUsers([]);
    }
  };

  const fetchReviews = async () => {
    try {
      // Fetch reviews from reviews table
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          book_id,
          rating,
          comment,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('❌ Reviews fetch error:', reviewsError);
        Alert.alert('Error', 'Failed to load reviews: ' + reviewsError.message);
        setReviews([]);
        return;
      }

      if (!reviewsData || reviewsData.length === 0) {
        console.log('✅ No reviews found');
        setReviews([]);
        return;
      }

      console.log('✅ Loaded reviews:', reviewsData.length);

      // Fetch book titles
      const bookIds = [...new Set(reviewsData.map(r => r.book_id))];
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title, author')
        .in('id', bookIds);

      // Fetch user profiles for emails
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Combine data
      const enrichedReviews = reviewsData.map(review => {
        const book = booksData?.find(b => b.id === review.book_id) || { title: 'Unknown Book' };
        const profile = profilesData?.find(p => p.id === review.user_id) || { email: 'Anonymous' };
        return {
          ...review,
          books: book,
          profiles: profile,
        };
      });

      console.log('✅ Enriched reviews:', enrichedReviews.length);
      setReviews(enrichedReviews);
    } catch (err) {
      console.error('❌ Exception fetching reviews:', err);
      Alert.alert('Error', 'Failed to load reviews: ' + err.message);
      setReviews([]);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title', { ascending: true });

      if (error) {
        console.error('❌ Books fetch error:', error);
        Alert.alert('Error', 'Failed to load books');
      } else {
        console.log('✅ Loaded books:', data?.length || 0);
        setBooks(data || []);
      }
    } catch (err) {
      console.error('❌ Exception fetching books:', err);
      Alert.alert('Error', 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    setLoading(true);
    try {
      // AI-generated book data
      const genres = ['Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Thriller', 'Historical', 'Biography'];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      
      const titles = [
        'The Silent Echo', 'Whispers in the Dark', 'Beyond the Horizon', 
        'The Last Symphony', 'Shadows of Tomorrow', 'The Forgotten Path',
        'Echoes of Eternity', 'The Hidden Truth', 'A Journey Within',
        'The Midnight Garden', 'Secrets Unveiled', 'The Golden Promise'
      ];
      
      const authors = [
        'Emma Richardson', 'James Morrison', 'Sarah Chen', 'Michael Torres',
        'Isabella Martinez', 'David Anderson', 'Sophia Williams', 'Alexander Brown'
      ];
      
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
      
      const descriptions = [
        'A captivating tale that explores the depths of human emotion and resilience.',
        'An unforgettable journey through time and space that will leave you breathless.',
        'A masterfully crafted story of love, loss, and redemption.',
        'A thrilling adventure that keeps you on the edge of your seat until the very end.',
        'A profound exploration of life\'s greatest mysteries and the human condition.'
      ];
      
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      const aiGeneratedBook = {
        title: randomTitle,
        author: randomAuthor,
        genre: randomGenre,
        description: randomDescription,
        cover_url: `https://picsum.photos/seed/${Date.now()}/300/450`,
      };

      const { error } = await supabase
        .from('books')
        .insert([aiGeneratedBook]);

      if (error) throw error;
      
      Alert.alert('Success', `AI generated book: "${randomTitle}" by ${randomAuthor}`);
      fetchBooks();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      Alert.alert('Validation Error', 'Title and Author are required');
      return;
    }

    try {
      if (editingBook) {
        // Update
        const { error } = await supabase
          .from('books')
          .update(formData)
          .eq('id', editingBook.id);

        if (error) throw error;
        Alert.alert('Success', 'Book updated');
      } else {
        // Create
        const { error } = await supabase
          .from('books')
          .insert([formData]);

        if (error) throw error;
        Alert.alert('Success', 'Book added');
      }

      // Reset form and reload
      setFormData({
        title: '',
        author: '',
        genre: '',
        description: '',
        cover_url: '',
      });
      setEditingBook(null);
      setShowAddModal(false);
      fetchBooks();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteBook = (book) => {
    Alert.alert('Delete Book', `Are you sure you want to delete "${book.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('books')
              .delete()
              .eq('id', book.id);

            if (error) throw error;
            Alert.alert('Success', 'Book deleted');
            fetchBooks();
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      genre: book.genre || '',
      description: book.description || '',
      cover_url: book.cover_url || '',
    });
    setShowAddModal(true);
  };

  const handleLogout = () => {
    // Use native Alert on mobile; fall back to window.confirm on web
    if (Platform.OS === 'web') {
      const proceed = typeof window !== 'undefined'
        ? window.confirm('Are you sure you want to log out?')
        : true;
      if (!proceed) return;
      (async () => {
        try {
          await supabase.auth.signOut();
          if (onLogout) onLogout();
        } catch (err) {
          // Alert may not be available on web; log error
          console.error('Failed to logout:', err);
        }
      })();
      return;
    }

    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            if (onLogout) onLogout();
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const renderBookCard = ({ item }) => (
    <View style={styles.bookCardWrapper}>
      <View style={styles.bookCard}>
        {/* Cover Image - Fixed Height - Clickable to edit */}
        <TouchableOpacity 
          onPress={() => handleEditBook(item)}
          activeOpacity={0.8}
        >
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={styles.bookCover}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.bookCoverPlaceholder}>
              <Ionicons name="book" size={scaleSize(50)} color={COLORS.textSecondary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Book Info - Fixed height with proper text truncation - Clickable to edit */}
        <TouchableOpacity 
          style={styles.bookInfo}
          onPress={() => handleEditBook(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookTitle} numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={styles.bookAuthor} numberOfLines={1}>
            {item.author || 'Unknown Author'}
          </Text>
          <Text style={styles.bookGenre} numberOfLines={1}>
            {item.genre || 'Unspecified'}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons - Fixed height */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditBook(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={scaleSize(18)} color="#1a1a1a" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteBook(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash" size={scaleSize(18)} color="#1a1a1a" />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBooksSection = () => (
    <View style={styles.sectionContainer}>
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingBook(null);
            setFormData({
              title: '',
              author: '',
              genre: '',
              description: '',
              cover_url: '',
            });
            setShowAddModal(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={scaleSize(20)} color="#1a1a1a" />
          <Text style={styles.addButtonText}>Add New Book</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleGenerateWithAI}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles" size={scaleSize(20)} color="#1a1a1a" />
          <Text style={styles.aiButtonText}>Generate with AI</Text>
        </TouchableOpacity>
      </View>

      {/* Book List */}
      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={scaleSize(60)} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No books yet</Text>
          <Text style={styles.emptySubtext}>Add a new book to get started</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? styles.columnWrapper : null}
          scrollEnabled
          scrollEventThrottle={16}
        />
      )}
    </View>
  );

  const renderUsersSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Manage Users</Text>
      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={scaleSize(60)} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No users yet</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Ionicons name="person-circle" size={scaleSize(40)} color={COLORS.primary} />
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{item.email || 'No email'}</Text>
                <Text style={styles.userId}>ID: {item.id}</Text>
                <Text style={styles.userDate}>
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  const renderReviewsSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Manage Reviews</Text>
      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={scaleSize(60)} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              {/* Book Title */}
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewBook}>
                  {item.books?.title || 'Unknown Book'}
                  {item.books?.author ? ` by ${item.books.author}` : ''}
                </Text>
              </View>

              {/* Rating */}
              {item.rating && (
                <View style={styles.reviewRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= item.rating ? 'star' : 'star-outline'}
                      size={scaleSize(16)}
                      color="#fbbf24"
                    />
                  ))}
                  <Text style={styles.ratingText}>{item.rating}/5</Text>
                </View>
              )}

              {/* Review Comment */}
              {item.comment && (
                <Text style={styles.reviewText}>{item.comment}</Text>
              )}

              {/* Author & Date */}
              <Text style={styles.reviewAuthor}>
                By: {item.profiles?.email || item.profiles?.full_name || 'Anonymous'} • {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          scrollEnabled
        />
      )}
    </View>
  );

  const renderAnalyticsSection = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Ionicons name="book" size={scaleSize(32)} color={COLORS.primary} />
          <Text style={styles.analyticsNumber}>{books.length}</Text>
          <Text style={styles.analyticsLabel}>Total Books</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Ionicons name="people" size={scaleSize(32)} color={COLORS.success} />
          <Text style={styles.analyticsNumber}>{users.length}</Text>
          <Text style={styles.analyticsLabel}>Total Users</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Ionicons name="star" size={scaleSize(32)} color="#fbbf24" />
          <Text style={styles.analyticsNumber}>{reviews.length}</Text>
          <Text style={styles.analyticsLabel}>Total Reviews</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Ionicons name="trending-up" size={scaleSize(32)} color={COLORS.primary} />
          <Text style={styles.analyticsNumber}>
            {reviews.length > 0 
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : '0.0'}
          </Text>
          <Text style={styles.analyticsLabel}>Avg Rating</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading books...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>📚 Admin Panel</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={scaleSize(20)} color="#1a1a1a" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content with Sidebar */}
      <View style={styles.mainContent}>
        {/* Sidebar - ICON ONLY */}
        <View style={styles.sidebar}>
          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'books' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('books')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="book" 
              size={scaleSize(24)} 
              color={activeSection === 'books' ? '#1a1a1a' : COLORS.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'users' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('users')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="people" 
              size={scaleSize(24)} 
              color={activeSection === 'users' ? '#1a1a1a' : COLORS.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'reviews' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('reviews')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="star" 
              size={scaleSize(24)} 
              color={activeSection === 'reviews' ? '#1a1a1a' : COLORS.textSecondary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeSection === 'analytics' && styles.sidebarItemActive]}
            onPress={() => setActiveSection('analytics')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="analytics" 
              size={scaleSize(24)} 
              color={activeSection === 'analytics' ? '#1a1a1a' : COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {activeSection === 'books' && renderBooksSection()}
          {activeSection === 'users' && renderUsersSection()}
          {activeSection === 'reviews' && renderReviewsSection()}
          {activeSection === 'analytics' && renderAnalyticsSection()}
        </View>
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={scaleSize(28)} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </Text>
            <View style={{ width: scaleSize(28) }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Book title"
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Author *</Text>
              <TextInput
                style={styles.input}
                placeholder="Author name"
                value={formData.author}
                onChangeText={(text) =>
                  setFormData({ ...formData, author: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Genre</Text>
              <TextInput
                style={styles.input}
                placeholder="Genre"
                value={formData.genre}
                onChangeText={(text) =>
                  setFormData({ ...formData, genre: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { minHeight: scaleSize(100) }]}
                placeholder="Book description"
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cover URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                value={formData.cover_url}
                onChangeText={(text) =>
                  setFormData({ ...formData, cover_url: text })
                }
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddBook}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>
                {editingBook ? 'Update Book' : 'Add Book'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: scaleSize(16),
    fontSize: scaleSize(16),
    color: COLORS.textSecondary,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(16),
    paddingBottom: scaleSize(16),
    gap: scaleSize(12),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scaleSize(28),
    fontWeight: '700',
    color: '#1a1a1a',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(8),
    alignItems: 'center',
    gap: scaleSize(6),
  },
  logoutText: {
    color: '#1a1a1a',
    fontSize: scaleSize(14),
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    minHeight: scaleSize(44),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonText: {
    color: '#1a1a1a',
    fontSize: scaleSize(15),
    fontWeight: '700',
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
    borderRadius: scaleSize(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scaleSize(44),
    width: '100%',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: scaleSize(8),
    elevation: 5,
    borderWidth: 1,
    borderColor: '#a78bfa',
  },
  aiButtonText: {
    color: '#1a1a1a',
    fontSize: scaleSize(15),
    fontWeight: '700',
    marginLeft: scaleSize(8),
  },

  // List
  listContent: {
    padding: scaleSize(12),
    gap: scaleSize(16),
    paddingBottom: scaleSize(24),
  },

  // Book Card Wrapper - Ensures consistent spacing in FlatList
  bookCardWrapper: {
    width: isTablet ? '48%' : '100%',
    marginBottom: scaleSize(16),
  },

  // Column Wrapper for tablet layout
  columnWrapper: {
    justifyContent: 'space-between',
    gap: scaleSize(16),
  },

  // Book Card - Fixed dimensions and professional styling
  bookCard: {
    backgroundColor: COLORS.card,
    borderRadius: scaleSize(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  bookCover: {
    width: '100%',
    height: scaleSize(200),
    backgroundColor: COLORS.background,
  },
  bookCoverPlaceholder: {
    width: '100%',
    height: scaleSize(180),
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    padding: scaleSize(14),
    minHeight: scaleSize(90),
    justifyContent: 'flex-start',
    gap: scaleSize(6),
  },
  bookTitle: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: scaleSize(20),
  },
  bookAuthor: {
    fontSize: scaleSize(13),
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  bookGenre: {
    fontSize: scaleSize(12),
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scaleSize(8),
    paddingHorizontal: scaleSize(14),
    paddingBottom: scaleSize(14),
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: scaleSize(11),
    borderRadius: scaleSize(8),
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(6),
    minHeight: scaleSize(44),
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(4),
    elevation: 3,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.error,
    paddingVertical: scaleSize(11),
    borderRadius: scaleSize(8),
    justifyContent: 'center',
    alignItems: 'center',
    gap: scaleSize(6),
    minHeight: scaleSize(44),
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: scaleSize(4),
    elevation: 3,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: scaleSize(13),
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSize(32),
  },
  emptyText: {
    fontSize: scaleSize(18),
    fontWeight: '700',
    color: COLORS.text,
    marginTop: scaleSize(16),
  },
  emptySubtext: {
    fontSize: scaleSize(14),
    color: COLORS.textSecondary,
    marginTop: scaleSize(8),
    textAlign: 'center',
    lineHeight: scaleSize(20),
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: scaleSize(20),
    fontWeight: '700',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: scaleSize(16),
  },
  formGroup: {
    marginBottom: scaleSize(20),
  },
  label: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: scaleSize(8),
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(12),
    fontSize: scaleSize(14),
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: scaleSize(16),
    borderRadius: scaleSize(8),
    alignItems: 'center',
    marginTop: scaleSize(24),
    marginBottom: scaleSize(32),
  },
  submitButtonText: {
    color: '#1a1a1a',
    fontSize: scaleSize(16),
    fontWeight: '700',
  },

  // Main Content & Sidebar
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: scaleSize(60),
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingVertical: scaleSize(16),
    gap: scaleSize(8),
  },
  sidebarItem: {
    paddingVertical: scaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarItemActive: {
    backgroundColor: COLORS.primary,
    borderRadius: scaleSize(8),
    marginHorizontal: scaleSize(8),
  },
  contentArea: {
    flex: 1,
  },
  sectionContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: scaleSize(22),
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(14),
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // User Cards
  userCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 5,
    alignItems: 'center',
    gap: scaleSize(14),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
    gap: scaleSize(4),
  },
  userEmail: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: COLORS.text,
  },
  userId: {
    fontSize: scaleSize(11),
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    letterSpacing: scaleSize(0.5),
  },
  userDate: {
    fontSize: scaleSize(12),
    color: COLORS.textSecondary,
    marginTop: scaleSize(2),
  },

  // Review Cards
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: scaleSize(12),
    padding: scaleSize(16),
    marginBottom: scaleSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleSize(12),
    gap: scaleSize(8),
  },
  reviewBook: {
    fontSize: scaleSize(15),
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    lineHeight: scaleSize(20),
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(4),
    marginBottom: scaleSize(10),
  },
  ratingText: {
    fontSize: scaleSize(12),
    color: COLORS.text,
    fontWeight: '700',
    marginLeft: scaleSize(4),
  },
  reviewText: {
    fontSize: scaleSize(13),
    color: COLORS.text,
    marginBottom: scaleSize(10),
    lineHeight: scaleSize(20),
  },
  reviewAuthor: {
    fontSize: scaleSize(11),
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Analytics
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: scaleSize(12),
    gap: scaleSize(12),
    paddingBottom: scaleSize(24),
  },
  analyticsCard: {
    backgroundColor: COLORS.card,
    borderRadius: scaleSize(12),
    padding: scaleSize(20),
    alignItems: 'center',
    justifyContent: 'center',
    width: isTablet ? '48%' : '48%',
    minHeight: scaleSize(140),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: scaleSize(12),
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  analyticsNumber: {
    fontSize: scaleSize(36),
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: scaleSize(10),
    letterSpacing: scaleSize(-1),
  },
  analyticsLabel: {
    fontSize: scaleSize(12),
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: scaleSize(8),
    textAlign: 'center',
  },

  // Action Buttons Section
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(14),
    gap: scaleSize(12),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
