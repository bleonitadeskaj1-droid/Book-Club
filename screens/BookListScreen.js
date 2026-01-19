import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  Modal,
  Alert,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../supabase';
import { interactionService } from '../services/interactionService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;
const isMediumScreen = screenWidth < 480;
const isTablet = screenWidth >= 768;

// Responsive scaling functions
const scaleFont = (size) => {
  const scale = screenWidth / 375;
  const maxScale = isTablet ? 1.4 : 1.2;
  return Math.round(size * Math.min(scale, maxScale));
};

const scaleSize = (size) => {
  const scale = screenWidth / 375;
  const maxScale = isTablet ? 1.5 : 1.3;
  return Math.round(size * Math.min(scale, maxScale));
};

// Unified card width across web and mobile for visual consistency
const CARD_WIDTH = 320;

// Clean, modern, minimal color palette
const COLORS = {
  // Primary colors - Modern cream
  primary: '#E8DCC4',
  primaryLight: '#F5F5DC',
  primaryDark: '#D4C5A9',
  
  // Background colors
  background: '#fafafa',
  backgroundDark: '#f5f5f5',
  card: '#ffffff',
  surface: '#f9fafb',
  
  // Text colors
  text: '#1a1a1a',
  textSecondary: '#737373',
  textMuted: '#a3a3a3',
  
  // Borders
  border: '#e5e5e5',
  borderLight: '#f5f5f5',
  divider: '#f5f5f5',
  
  // Semantic colors
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.04)',
};

export default function BookListScreen({ session, onLogout, onSelectBook, onMenuPress, onRequireAuth, showProfileModal, showLoginModal }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingModalVisible, setReadingModalVisible] = useState(false);
  const [reviewsModalVisible, setReviewsModalVisible] = useState(false);
  const [categorizeModalVisible, setCategorizeModalVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [currentPage, setCurrentPage] = useState(0);
  const [userBookStatus, setUserBookStatus] = useState(null);
  const [userStatuses, setUserStatuses] = useState({}); // Track status for all books
  const [selectedGenre, setSelectedGenre] = useState('All'); // Track selected genre filter

  useEffect(() => {
    fetchBooks();
  }, []);

  // DEBUG: Log SearchBar visibility
  useEffect(() => {
    const searchBarVisible = !showProfileModal && !showLoginModal;
    console.log(`🔍 SearchBar Visibility: ${searchBarVisible ? '✅ VISIBLE' : '❌ HIDDEN'}`);
    console.log(`   - showProfileModal: ${showProfileModal}`);
    console.log(`   - showLoginModal: ${showLoginModal}`);
  }, [showProfileModal, showLoginModal]);

  const isValidUuid = (id) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Fetch ALL books from Supabase without pagination
      const { data, error, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .order('genre', { ascending: true })
        .order('title', { ascending: true });

      if (error) {
        console.error('Error fetching books:', error);
        Alert.alert('Error', 'Failed to load books: ' + error.message);
        setBooks([]);
      } else {
        const bookCount = data?.length || 0;
        console.log(`✅ Loaded ${bookCount} books from Supabase`, { count, hasData: bookCount > 0 });
        setBooks(data || []);
        
        // Fetch reading status for ALL books if user is logged in
        if (session?.user?.id && isValidUuid(session.user.id)) {
          fetchAllUserStatuses(data);
        }
      }
    } catch (err) {
      console.error('Exception fetching books:', err);
      Alert.alert('Error', 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUserStatuses = async (booksData) => {
    if (!session?.user?.id || !isValidUuid(session.user.id)) return;
    
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select('book_id, status')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching user statuses:', error);
      } else {
        // Create a map of book_id -> status
        const statusMap = {};
        data?.forEach((item) => {
          statusMap[item.book_id] = item.status;
        });
        setUserStatuses(statusMap);
        console.log('✅ Loaded user statuses for all books');
      }
    } catch (err) {
      console.error('Exception fetching user statuses:', err);
    }
  };

  const fetchReviews = async (bookId) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        setReviews(data || []);
      }
    } catch (err) {
      console.error('Exception fetching reviews:', err);
    }
  };

  const fetchUserBookStatus = async (bookId) => {
    if (!session || !isValidUuid(session.user?.id)) return;

    try {
      const { data, error } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user book status:', error);
      } else {
        setUserBookStatus(data);
        if (data) {
          setCurrentPage(data.last_page || 0);
        }
      }
    } catch (err) {
      console.error('Exception fetching user book status:', err);
    }
  };

  const handleAction = (action, book) => {
    const executeAction = () => {
      setSelectedBook(book);

      switch (action) {
        case 'Read':
          fetchUserBookStatus(book.id);
          setReadingModalVisible(true);
          break;
        case 'Review':
          fetchReviews(book.id);
          setReviewsModalVisible(true);
          break;
        case 'Categorize':
          fetchUserBookStatus(book.id);
          setCategorizeModalVisible(true);
          break;
      }
    };

    if (!session?.user) {
      // User not authenticated - trigger login modal
      if (onRequireAuth) {
        onRequireAuth(executeAction);
      } else {
        // Fallback if onRequireAuth not provided
        Alert.alert(
          'Login Required',
          'Please log in to ' + action.toLowerCase(),
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => onLogout && onLogout() }
          ]
        );
      }
    } else {
      // User is authenticated, execute action immediately
      executeAction();
    }
  };

  const submitReview = async () => {
    if (!newReview.trim()) {
      Alert.alert('Error', 'Please enter a review');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          book_id: selectedBook.id,
          user_id: session.user.id,
          rating: reviewRating,
          comment: newReview.trim(),
        });

      if (error) {
        Alert.alert('Error', 'Failed to submit review: ' + error.message);
      } else {
        Alert.alert('Success', 'Review submitted successfully!');
        setNewReview('');
        setReviewRating(5);
        fetchReviews(selectedBook.id);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const updateReadingProgress = async (page) => {
    try {
      const updateData = {
        user_id: session.user.id,
        book_id: selectedBook.id,
        last_page: page,
        status: page > 0 ? 'reading' : 'not_started',
        updated_at: new Date().toISOString()
      };

      if (userBookStatus) {
        // Update existing record
        const { error } = await supabase
          .from('user_books')
          .update(updateData)
          .eq('user_id', session.user.id)
          .eq('book_id', selectedBook.id);

        if (error) {
          console.error('Error updating progress:', error);
          Alert.alert('Error', 'Failed to update reading progress: ' + error.message);
          return;
        }
      } else {
        // Create new record
        updateData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('user_books')
          .insert(updateData);

        if (error) {
          console.error('Error creating progress record:', error);
          Alert.alert('Error', 'Failed to save reading progress: ' + error.message);
          return;
        }
      }

      setCurrentPage(page);
      setUserBookStatus({ ...updateData });
      
      // Update userStatuses map for card display
      setUserStatuses(prev => ({
        ...prev,
        [selectedBook.id]: updateData.status
      }));
    } catch (err) {
      console.error('Exception updating progress:', err);
      Alert.alert('Error', 'Failed to update reading progress');
    }
  };

  const updateBookStatus = async (status) => {
    try {
      const updateData = {
        user_id: session.user.id,
        book_id: selectedBook.id,
        status: status,
        updated_at: new Date().toISOString()
      };

      if (userBookStatus) {
        // Update existing record
        const { error } = await supabase
          .from('user_books')
          .update(updateData)
          .eq('user_id', session.user.id)
          .eq('book_id', selectedBook.id);

        if (error) {
          console.error('Error updating status:', error);
          Alert.alert('Error', 'Failed to update book status');
          return;
        }
      } else {
        // Create new record
        updateData.created_at = new Date().toISOString();
        updateData.last_page = currentPage;
        const { error } = await supabase
          .from('user_books')
          .insert(updateData);

        if (error) {
          console.error('Error creating status record:', error);
          Alert.alert('Error', 'Failed to save book status');
          return;
        }
      }

      // Update local state
      setUserBookStatus({ ...updateData });
      
      // Update userStatuses map for card display
      setUserStatuses(prev => ({
        ...prev,
        [selectedBook.id]: status
      }));
      
      Alert.alert('Success', 'Book status updated successfully!');
      setCategorizeModalVisible(false);
    } catch (err) {
      console.error('Exception updating status:', err);
      Alert.alert('Error', 'Failed to update book status');
    }
  };

  // Filter books by search and genre
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.genre && book.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  // Group books by genre for section display
  const booksByGenre = {};
  filteredBooks.forEach(book => {
    const genre = book.genre || 'Other';
    if (!booksByGenre[genre]) {
      booksByGenre[genre] = [];
    }
    booksByGenre[genre].push(book);
  });

  // Get all unique genres from books
  const allGenres = ['All', ...new Set(books.map(book => book.genre).filter(Boolean))].sort();

  const getStatusBadgeStyle = (status) => {
    const baseStyle = { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 };
    
    switch (status) {
      case 'reading':
        return { ...baseStyle, backgroundColor: '#fef3c7', borderLeftWidth: 3, borderLeftColor: '#f59e0b' };
      case 'finished':
        return { ...baseStyle, backgroundColor: '#dcfce7', borderLeftWidth: 3, borderLeftColor: '#10b981' };
      case 'not_started':
        return { ...baseStyle, backgroundColor: COLORS.primaryLight, borderLeftWidth: 3, borderLeftColor: COLORS.primaryDark };
      default:
        return baseStyle;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'reading':
        return 'Reading';
      case 'finished':
        return 'Finished';
      case 'not_started':
        return 'To Read';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reading':
        return '#f59e0b';
      case 'finished':
        return '#10b981';
      case 'not_started':
        return COLORS.primaryDark;
      default:
        return '#64748b';
    }
  };

  const renderBookCard = ({ item: book }) => {
    const bookStatus = userStatuses[book.id];
    
    return (
      <TouchableOpacity
        style={styles.bookCardTouchable}
        onPress={() => onSelectBook && onSelectBook(book)}
        activeOpacity={0.9}
      >
        <View style={styles.bookCard}>
          {/* Status Badge */}
          {bookStatus && (
            <View style={[styles.statusBadge, getStatusBadgeStyle(bookStatus)]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(bookStatus) }]}>
                {getStatusLabel(bookStatus)}
              </Text>
            </View>
          )}

          {/* Book Cover */}
          <View style={styles.bookCoverContainer}>
            {book.cover_url ? (
              <Image 
                source={{ uri: book.cover_url }} 
                style={styles.bookCover}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.bookCoverPlaceholder}>
                <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.placeholderText}>No Cover</Text>
              </View>
            )}
          </View>

          {/* Book Info */}
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {book.author}
            </Text>
            
            {book.description && (
              <Text style={styles.bookDescription} numberOfLines={3}>
                {book.description}
              </Text>
            )}
            
            <View style={styles.bookMeta}>
              {book.publication_year && (
                <View style={styles.metaTag}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{book.publication_year}</Text>
                </View>
              )}
              {book.genre && (
                <View style={styles.metaTag}>
                  <Ionicons name="pricetag-outline" size={12} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{book.genre}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.bookActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('Read', book)}
            >
              <Ionicons name="book-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('Review', book)}
            >
              <Ionicons name="star-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleAction('Categorize', book)}
            >
              <Ionicons name="bookmark-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#E8DCC4', '#D4C5A9', '#C4B59A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>📚 Book Club</Text>
              <Text style={styles.headerSubtitle}>Discover your next great read</Text>
            </View>
            {session && (
              <TouchableOpacity 
                style={styles.profileButton} 
                onPress={() => onMenuPress && onMenuPress()}
              >
                <Ionicons name="person-circle" size={32} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Search - Only show when Profile modal AND Login modal are NOT open */}
        {!showProfileModal && !showLoginModal && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search books..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Genre Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.genreFilterContainer}
            >
              {allGenres.map(genre => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreChip,
                    selectedGenre === genre && styles.genreChipActive
                  ]}
                  onPress={() => setSelectedGenre(genre)}
                >
                  <Text 
                    style={[
                      styles.genreChipText,
                      selectedGenre === genre && styles.genreChipTextActive
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Book List by Genre - Only show when Profile modal AND Login modal are NOT open */}
        {!showProfileModal && !showLoginModal && (
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading books...</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bookList}
              >
                {selectedGenre === 'All' ? (
                  // Display all genres as sections
                  Object.keys(booksByGenre).sort().map(genre => (
                <View key={genre} style={styles.genreSection}>
                  <View style={styles.genreSectionHeader}>
                    <Text style={styles.genreSectionTitle}>{genre}</Text>
                    <Text style={styles.genreSectionCount}>
                      {booksByGenre[genre].length} {booksByGenre[genre].length === 1 ? 'book' : 'books'}
                    </Text>
                  </View>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.genreBooksList}
                  >
                    {booksByGenre[genre].map(book => (
                      <View key={book.id} style={styles.horizontalBookCard}>
                        {renderBookCard({ item: book })}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ))
            ) : (
              // Display single genre in grid
              <View style={styles.gridContainer}>
                {filteredBooks.map(book => (
                  <View key={book.id} style={styles.gridBookCard}>
                    {renderBookCard({ item: book })}
                  </View>
                ))}
              </View>
            )}

            {filteredBooks.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No books found' : 'No books available'}
                </Text>
              </View>
            )}
              </ScrollView>
            )}
          </>
        )}

        {/* Modals remain unchanged */}
      {/* Reading Modal */}
      <Modal
        visible={readingModalVisible}
        animationType="slide"
        onRequestClose={() => setReadingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedBook && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setReadingModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedBook.title}
                </Text>
                <Text style={styles.modalSubtitle}>
                  by {selectedBook.author}
                </Text>
              </View>

              <ScrollView style={styles.modalContent}>
                {selectedBook.content ? (
                  <Text style={styles.bookContent}>
                    {selectedBook.content}
                  </Text>
                ) : (
                  <View style={styles.noContentContainer}>
                    <Ionicons name="document-outline" size={48} color={COLORS.textMuted} />
                    <Text style={styles.noContentText}>
                      Content not available for this book.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {selectedBook.content && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>
                    Current Page: {currentPage}
                  </Text>
                  <View style={styles.progressButtons}>
                    <TouchableOpacity
                      style={styles.progressButton}
                      onPress={() => {
                        const newPage = Math.max(0, currentPage - 1);
                        setCurrentPage(newPage);
                        updateReadingProgress(newPage);
                      }}
                    >
                      <Text style={styles.progressButtonText}>-1 Page</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.progressButton}
                      onPress={() => {
                        const newPage = currentPage + 1;
                        setCurrentPage(newPage);
                        updateReadingProgress(newPage);
                      }}
                    >
                      <Text style={styles.progressButtonText}>+1 Page</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </Modal>

      {/* Reviews Modal */}
      <Modal
        visible={reviewsModalVisible}
        animationType="slide"
        onRequestClose={() => setReviewsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedBook && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setReviewsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  Reviews for {selectedBook.title}
                </Text>
              </View>

              <ScrollView style={styles.modalContent}>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewAuthor}>
                          {review.profiles?.email || 'Anonymous'}
                        </Text>
                        <View style={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <Ionicons
                              key={i}
                              name={i < review.rating ? "star" : "star-outline"}
                              size={16}
                              color={COLORS.primary}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewText}>
                        {review.comment}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.noReviewsContainer}>
                    <Ionicons name="chatbubble-outline" size={48} color={COLORS.textMuted} />
                    <Text style={styles.noReviewsText}>
                      No reviews yet. Be the first to review this book!
                    </Text>
                  </View>
                )}

                <View style={styles.addReviewContainer}>
                  <Text style={styles.addReviewTitle}>Write a Review</Text>
                  <View style={styles.ratingInput}>
                    {[...Array(5)].map((_, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => setReviewRating(i + 1)}
                      >
                        <Ionicons
                          name={i < reviewRating ? "star" : "star-outline"}
                          size={24}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Share your thoughts about this book..."
                    placeholderTextColor={COLORS.textMuted}
                    value={newReview}
                    onChangeText={setNewReview}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={submitReview}
                  >
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>

      {/* Categorize Modal */}
      <Modal
        visible={categorizeModalVisible}
        animationType="slide"
        onRequestClose={() => setCategorizeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {selectedBook && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setCategorizeModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  Categorize {selectedBook.title}
                </Text>
              </View>

              <View style={styles.modalContent}>
                <Text style={styles.categorizeDescription}>
                  Choose the reading status for this book:
                </Text>

                <TouchableOpacity
                  style={[styles.categoryButton, userBookStatus?.status === 'not_started' && styles.categoryButtonActive]}
                  onPress={() => updateBookStatus('not_started')}
                >
                  <Ionicons 
                    name="bookmark-outline" 
                    size={24} 
                    color={userBookStatus?.status === 'not_started' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[styles.categoryButtonText, userBookStatus?.status === 'not_started' && styles.categoryButtonActiveText]}>To Read</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryButton, userBookStatus?.status === 'reading' && styles.categoryButtonActive]}
                  onPress={() => updateBookStatus('reading')}
                >
                  <Ionicons 
                    name="book" 
                    size={24} 
                    color={userBookStatus?.status === 'reading' ? COLORS.primary : COLORS.textMuted} 
                  />
                  <Text style={[styles.categoryButtonText, userBookStatus?.status === 'reading' && styles.categoryButtonActiveText]}>Currently Reading</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryButton, userBookStatus?.status === 'finished' && styles.categoryButtonActive]}
                  onPress={() => updateBookStatus('finished')}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={userBookStatus?.status === 'finished' ? COLORS.success : COLORS.textMuted} 
                  />
                  <Text style={[styles.categoryButtonText, userBookStatus?.status === 'finished' && { color: COLORS.success }]}>Finished Reading</Text>
                </TouchableOpacity>

                {userBookStatus && (
                  <View style={styles.currentStatus}>
                    <Text style={styles.currentStatusText}>
                      Current status: {getStatusLabel(userBookStatus.status)}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingTop: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 6,
    fontWeight: '500',
  },
  profileButton: {
    padding: 8,
    alignSelf: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  genreFilterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#E8DCC4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 160,
  },
  genreChipActive: {
    backgroundColor: '#E8DCC4',
    borderColor: '#E8DCC4',
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4C5A9',
    letterSpacing: 0.2,
  },
  genreChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  genreSection: {
    marginBottom: 32,
  },
  genreSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  genreSectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  genreSectionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  genreBooksList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  horizontalBookCard: {
    width: CARD_WIDTH,
  },
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridBookCard: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  bookList: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
  },
  bookCardTouchable: {
    width: '100%',
  },
  bookCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    width: '100%',
    minHeight: 360,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookCoverContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  bookCover: {
    width: 140,
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundDark,
  },
  bookCoverPlaceholder: {
    width: 140,
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  bookInfo: {
    marginBottom: 16,
    minHeight: 140,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  bookAuthor: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontWeight: '600',
  },
  bookDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 10,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  bookActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  categoryButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryButtonActiveText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    backgroundColor: COLORS.card,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  bookContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  noContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noContentText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  progressContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  progressButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  progressButtonText: {
    color: COLORS.card,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  noReviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noReviewsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  addReviewContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  ratingInput: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  reviewInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
  },
  categorizeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  categoryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  currentStatus: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  currentStatusText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
