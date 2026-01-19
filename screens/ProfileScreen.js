import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';
import { readingProgressService } from '../services/readingProgressService';

const COLORS = {
  primary: '#E8DCC4',
  primaryDark: '#D4C5A9',
  primaryLight: '#F5F5DC',
  background: '#fafafa',
  backgroundDark: '#f5f5f5',
  card: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#737373',
  textLight: '#a3a3a3',
  border: '#e5e5e5',
  borderLight: '#f5f5f5',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
  teal: '#14b8a6',
};

const STATUS_COLORS = {
  'not_started': '#a855f7',
  'reading': '#f59e0b',
  'completed': '#22c55e',
};

const STATUS_LABELS = {
  'not_started': 'To Read',
  'reading': 'Currently Reading',
  'completed': 'Finished Reading',
};

export default function ProfileScreen({ session, onLogout, onClose, onRead = null }) {
  const [userEmail, setUserEmail] = useState('');
  const [fullName, setFullName] = useState('');
    const isValidUuid = (id) => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '');
    };
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Book data
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [toRead, setToRead] = useState([]);
  const [finishedReading, setFinishedReading] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [readingProgress, setReadingProgress] = useState({}); // Track progress by book_id

  const [activeTab, setActiveTab] = useState('reading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id && isValidUuid(session.user.id)) {
      loadProfileData();
      loadBookData();
    }
  }, [session?.user?.id]);

  const loadProfileData = async () => {
    if (!session?.user?.id || !isValidUuid(session.user.id)) return;

    try {
      setUserEmail(session.user.email || '');

      // Try to fetch profile - handle both new and old database schemas
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is expected for new users
        console.error('Error loading profile:', error);
      }

      // Safely extract fields - they may not exist on older databases
      if (profile) {
        setFullName(profile.full_name || '');
        setUsername(profile.username || '');
        setAvatarUrl(profile.avatar_url || null);
        setBio(profile.bio || '');
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
      // Don't show error to user - profile can be empty initially
    }
  };

  const loadBookData = async () => {
    if (!session?.user?.id || !isValidUuid(session.user.id)) return;

    setLoading(true);
    try {
      // Fetch user books
      const { data: userBooksData, error: userBooksError } = await supabase
        .from('user_books')
        .select('id, user_id, book_id, status, is_favorite, last_page, books(id, title, author, cover_url, content)')
        .eq('user_id', session.user.id);

      if (userBooksError) throw userBooksError;

      const reading = [];
      const toReadList = [];
      const finished = [];
      const favoritesList = [];
      const progressMap = {};

      userBooksData?.forEach(item => {
        const book = {
          id: item.book_id,
          title: item.books?.title || 'Unknown',
          author: item.books?.author || 'Unknown',
          cover_url: item.books?.cover_url,
          content: item.books?.content || '',
          status: item.status,
          userBookId: item.id,
        };

        // Store progress
        if (item.last_page) {
          progressMap[item.book_id] = item.last_page;
        }

        if (item.status === 'reading') reading.push(book);
        if (item.status === 'not_started') toReadList.push(book);
        if (item.status === 'completed') finished.push(book);
        if (item.is_favorite) favoritesList.push(book);
      });

      setCurrentlyReading(reading);
      setToRead(toReadList);
      setFinishedReading(finished);
      setFavorites(favoritesList);
      setReadingProgress(progressMap);

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, rating, comment, books(title, author, cover_url)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const reviewsWithBooks = reviewsData?.map(review => ({
        id: review.id,
        title: review.books?.title || 'Unknown',
        author: review.books?.author || 'Unknown',
        cover_url: review.books?.cover_url,
        rating: review.rating,
        comment: review.comment,
      })) || [];

      setMyReviews(reviewsWithBooks);
    } catch (err) {
      console.error('Error loading book data:', err);
      Alert.alert('Error', 'Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.cancelled && result.assets?.[0]) {
        const file = result.assets[0];
        const fileName = `${session.user.id}-${Date.now()}.jpg`;

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: 'image/jpeg',
        });

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        setAvatarUrl(publicUrl);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      Alert.alert('Error', 'Failed to upload avatar');
    }
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Use UPSERT to ensure profile is created or updated
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          full_name: fullName,
          username: username || null,
          avatar_url: avatarUrl,
          bio: bio,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (upsertError) throw upsertError;

      // Refetch profile to confirm changes
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error refetching profile:', fetchError);
      }

      // Update local state with fetched data
      if (updatedProfile) {
        setFullName(updatedProfile.full_name || '');
        setUsername(updatedProfile.username || '');
        setAvatarUrl(updatedProfile.avatar_url || null);
        setBio(updatedProfile.bio || '');
      }

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    // Use native Alert on mobile; fall back to window.confirm on web
    if (Platform.OS === 'web') {
      const proceed = typeof window !== 'undefined'
        ? window.confirm('Are you sure you want to logout?')
        : true;
      if (!proceed) return;
      try {
        await supabase.auth.signOut();
        // Clear local state after logout
        setUserEmail('');
        setFullName('');
        setUsername('');
        setAvatarUrl(null);
        setBio('');
        setIsEditingProfile(false);
        setIsSavingProfile(false);
        setCurrentlyReading([]);
        setToRead([]);
        setFinishedReading([]);
        setMyReviews([]);
        setFavorites([]);
        setReadingProgress({});
        if (typeof onLogout === 'function') onLogout();
      } catch (err) {
        console.error('Failed to logout:', err);
      }
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              // Clear local state after logout
              setUserEmail('');
              setFullName('');
              setUsername('');
              setAvatarUrl(null);
              setBio('');
              setIsEditingProfile(false);
              setIsSavingProfile(false);
              setCurrentlyReading([]);
              setToRead([]);
              setFinishedReading([]);
              setMyReviews([]);
              setFavorites([]);
              setReadingProgress({});
              if (typeof onLogout === 'function') onLogout();
            } catch (err) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  // Role-aware close behavior
  const handleClose = () => {
    const email = session?.user?.email || '';
    const isAdmin = email === 'admin@gmail.com';
    // Only invoke close if provided by parent; parent controls navigation.
    if (typeof onClose === 'function') {
      onClose();
    }
    // If no onClose provided (full-screen profile), do nothing here to avoid unintended navigation.
    // Users can use bottom tabs to switch views; admins remain on Admin when applicable.
  };

  const BookCard = ({ book, showProgress = false, onContinueReading = null }) => (
    <View style={styles.bookCard}>
      {book.cover_url ? (
        <Image
          source={{ uri: book.cover_url }}
          style={styles.bookCover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.bookCover, { backgroundColor: COLORS.border }]}>
          <Ionicons name="book" size={32} color={COLORS.textSecondary} />
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
        {book.status && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[book.status] },
            ]}
          >
            <Text style={styles.statusText}>
              {STATUS_LABELS[book.status]}
            </Text>
          </View>
        )}
        {showProgress && book.status === 'reading' && readingProgress[book.id] !== undefined && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Reading Progress</Text>
              <Text style={styles.progressPercent}>
                {readingProgress[book.id]}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${readingProgress[book.id]}%` },
                ]}
              />
            </View>
            {onContinueReading && (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={onContinueReading}
              >
                <Ionicons name="play" size={16} color="#fff" />
                <Text style={styles.continueButtonText}>Continue Reading</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {review.cover_url ? (
          <Image
            source={{ uri: review.cover_url }}
            style={styles.reviewCover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.reviewCover, { backgroundColor: COLORS.border }]}>
            <Ionicons name="book" size={20} color={COLORS.textSecondary} />
          </View>
        )}
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewTitle} numberOfLines={2}>
            {review.title}
          </Text>
          <Text style={styles.reviewAuthor}>{review.author}</Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={14}
                color={i < review.rating ? '#f59e0b' : '#e2e8f0'}
              />
            ))}
            <Text style={styles.ratingText}>{review.rating}/5</Text>
          </View>
        </View>
      </View>
      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );

  const EmptyState = ({ icon, message }) => (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
            )}
            {isEditingProfile && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleAvatarUpload}
              >
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {!isEditingProfile ? (
            // View Mode
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>{fullName || 'Add your name'}</Text>
              <Text style={styles.displayEmail}>{userEmail}</Text>
              {username && (
                <Text style={styles.displayUsername}>@{username}</Text>
              )}
              {bio && <Text style={styles.displayBio}>{bio}</Text>}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingProfile(true)}
              >
                <Ionicons name="pencil" size={16} color={COLORS.primary} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Edit Mode
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isSavingProfile}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Username (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  editable={!isSavingProfile}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bio (optional)</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChangeText={setBio}
                  editable={!isSavingProfile}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditingProfile(false);
                    loadProfileData();
                  }}
                  disabled={isSavingProfile}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, isSavingProfile && styles.buttonDisabled]}
                  onPress={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { id: 'reading', label: `Reading (${currentlyReading.length})`, icon: 'book' },
            { id: 'toRead', label: `To Read (${toRead.length})`, icon: 'bookmark' },
            { id: 'finished', label: `Finished (${finishedReading.length})`, icon: 'checkmark-circle' },
            { id: 'reviews', label: `Reviews (${myReviews.length})`, icon: 'star' },
            { id: 'favorites', label: `Favorites (${favorites.length})`, icon: 'heart' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab,
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                {tab.label.split('(')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'reading' && (
            <>
              {currentlyReading.length > 0 ? (
                currentlyReading.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    showProgress={true}
                    onContinueReading={
                      onRead ? () => onRead(book) : undefined
                    }
                  />
                ))
              ) : (
                <EmptyState
                  icon="book-outline"
                  message="No books currently reading"
                />
              )}
            </>
          )}

          {activeTab === 'toRead' && (
            <>
              {toRead.length > 0 ? (
                toRead.map(book => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <EmptyState
                  icon="bookmark-outline"
                  message="No books in your to-read list"
                />
              )}
            </>
          )}

          {activeTab === 'finished' && (
            <>
              {finishedReading.length > 0 ? (
                finishedReading.map(book => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <EmptyState
                  icon="checkmark-circle-outline"
                  message="No finished books yet"
                />
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              {myReviews.length > 0 ? (
                myReviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <EmptyState
                  icon="star-outline"
                  message="No reviews yet"
                />
              )}
            </>
          )}

          {activeTab === 'favorites' && (
            <>
              {favorites.length > 0 ? (
                favorites.map(book => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <EmptyState
                  icon="heart-outline"
                  message="No favorite books yet"
                />
              )}
            </>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 28,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.card,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.card,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
  },
  displayName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  displayEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  displayUsername: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 8,
  },
  displayBio: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 8,
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  editForm: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  bioInput: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  bookCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  bookCover: {
    width: 90,
    height: 130,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  bookAuthor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressSection: {
    marginTop: 10,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewCover: {
    width: 60,
    height: 90,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  reviewAuthor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  reviewComment: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
    marginLeft: 8,
  },
  spacer: {
    height: 20,
  },
});
