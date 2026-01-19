import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { interactionService } from '../services/interactionService';

const { width: screenWidth } = Dimensions.get('window');

const COLORS = {
  primary: '#E8DCC4',
  primaryLight: '#F5F5DC',
  primaryDark: '#D4C5A9',
  background: '#f8fafc',
  card: '#ffffff',
  surface: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};

const STATUS_OPTIONS = [
  { value: 'not_started', label: '📚 To Read', color: '#94a3b8' },
  { value: 'reading', label: '📖 Currently Reading', color: '#f59e0b' },
  { value: 'completed', label: '✅ Finished Reading', color: '#10b981' },
];

export default function BookDetailScreen({ book, session, onClose, onRead, onRequireAuth }) {
  const [status, setStatus] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadBookData();
  }, [book]);

  const loadBookData = async () => {
    // If user is not logged in, skip fetching user-specific data
    if (!session?.user?.id) {
      setStatus(null);
      setReview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch status
      const userStatus = await interactionService.getBookStatus(
        session.user.id,
        book.id
      );
      setStatus(userStatus);

      // Fetch review
      const userReview = await interactionService.getUserReview(
        session.user.id,
        book.id
      );
      if (userReview) {
        setReview(userReview);
        setReviewText(userReview.comment || '');
        setReviewRating(userReview.rating || 5);
      } else {
        setReviewText('');
        setReviewRating(5);
      }
    } catch (err) {
      console.error('Error loading book data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const executeChange = async () => {
      setSaving(true);
      try {
        console.log('DEBUG: Changing status to:', newStatus);
        console.log('DEBUG: Session user ID:', session?.user?.id);
        console.log('DEBUG: Book ID:', book?.id);
        
        await interactionService.updateBookStatus(session.user.id, book.id, newStatus);
        setStatus(newStatus);
        showSuccess(`Status updated to ${newStatus.replace(/-/g, ' ')}`);
      } catch (err) {
        Alert.alert('Error', `Failed to update status: ${err.message}`);
        console.error('Full error:', err);
      } finally {
        setSaving(false);
      }
    };

    if (!session?.user) {
      // User not authenticated - require login
      if (onRequireAuth) {
        onRequireAuth(executeChange);
      } else {
        Alert.alert('Login Required', 'Please sign in to change your reading status');
      }
    } else {
      // User is authenticated
      executeChange();
    }
  };

  const handleSaveReview = async () => {
    const executeSave = async () => {
      setSaving(true);
      try {
        await interactionService.saveReview(
          session.user.id,
          book.id,
          reviewRating,
          reviewText
        );
        
        // Reload review data
        const updated = await interactionService.getUserReview(
          session.user.id,
          book.id
        );
        setReview(updated);
        setReviewModalVisible(false);
        showSuccess('Review saved successfully!');
      } catch (err) {
        Alert.alert('Error', 'Failed to save review');
        console.error(err);
      } finally {
        setSaving(false);
      }
    };

    if (!session?.user) {
      if (onRequireAuth) {
        onRequireAuth(executeSave);
      } else {
        Alert.alert('Login Required', 'Please sign in to leave a review');
      }
    } else {
      executeSave();
    }
  };

  const handleDeleteReview = async () => {
    const executeDelete = async () => {
      Alert.alert(
        'Delete Review',
        'Are you sure you want to delete your review?',
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Delete',
            onPress: async () => {
              setSaving(true);
              try {
                await interactionService.deleteReview(session.user.id, book.id);
                setReview(null);
                setReviewText('');
                setReviewRating(5);
                showSuccess('Review deleted');
              } catch (err) {
                Alert.alert('Error', 'Failed to delete review');
              } finally {
                setSaving(false);
              }
            },
          },
        ]
      );
    };

    if (!session?.user) {
      if (onRequireAuth) {
        onRequireAuth(executeDelete);
      } else {
        Alert.alert('Login Required', 'Please sign in to manage your reviews');
      }
    } else {
      executeDelete();
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const getStatusColor = (s) => {
    return STATUS_OPTIONS.find(opt => opt.value === s)?.color || '#94a3b8';
  };

  if (loading) {
    return (
      <Modal visible={true} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Details</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Success message */}
        {successMessage && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Book cover and title */}
          <View style={styles.bookHeader}>
            {book.cover_url && (
              <Image
                source={{ uri: book.cover_url }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
            {book.publication_year && (
              <Text style={styles.year}>{book.publication_year}</Text>
            )}
            {book.genre && (
              <View style={styles.genreBadge}>
                <Text style={styles.genreText}>{book.genre}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {book.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{book.description}</Text>
            </View>
          )}

          {/* Reading Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Status</Text>
            <View style={styles.statusButtons}>
              {STATUS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleStatusChange(option.value)}
                  disabled={saving}
                  style={[
                    styles.statusButton,
                    status === option.value && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === option.value && { color: '#fff' },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* User Review Section */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>My Review</Text>
              <TouchableOpacity
                onPress={() => setReviewModalVisible(true)}
                style={styles.editButton}
              >
                <Ionicons
                  name={review ? 'pencil' : 'add'}
                  size={20}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            {review ? (
              <View style={styles.reviewCard}>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={18}
                      color={i < review.rating ? '#f59e0b' : '#e2e8f0'}
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    {review.rating}/5
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <TouchableOpacity
                  onPress={handleDeleteReview}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={16} color={COLORS.error} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noReview}>
                <Ionicons name="create-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.noReviewText}>No review yet</Text>
                <Text style={styles.noReviewSubtext}>Tap the add button to write one</Text>
              </View>
            )}
          </View>

          {/* Read Button */}
          {book.content && (
            <TouchableOpacity
              onPress={() => {
                onClose();
                onRead(book);
              }}
              style={styles.readButton}
            >
              <Ionicons name="book" size={20} color="#fff" />
              <Text style={styles.readButtonText}>Read Book</Text>
            </TouchableOpacity>
          )}

          <View style={styles.spacer} />
        </ScrollView>

        {/* Review Modal */}
        <Modal
          visible={reviewModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {review ? 'Edit Review' : 'Write Review'}
                </Text>
                <TouchableOpacity
                  onPress={() => setReviewModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Rating picker */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Rating</Text>
                <View style={styles.ratingPicker}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <TouchableOpacity
                      key={num}
                      onPress={() => setReviewRating(num)}
                    >
                      <Ionicons
                        name={num <= reviewRating ? 'star' : 'star-outline'}
                        size={32}
                        color={num <= reviewRating ? '#f59e0b' : '#e2e8f0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Review text */}
              <View style={styles.reviewTextSection}>
                <Text style={styles.ratingLabel}>Comment</Text>
                <TextInput
                  style={styles.reviewTextInput}
                  placeholder="Share your thoughts about this book..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={6}
                  value={reviewText}
                  onChangeText={setReviewText}
                />
              </View>

              {/* Save button */}
              <TouchableOpacity
                onPress={handleSaveReview}
                disabled={saving}
                style={styles.saveButton}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.success,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  successText: {
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingVertical: 16,
  },
  bookHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  coverImage: {
    width: 150,
    height: 225,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  bookInfo: {
    paddingHorizontal: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  year: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  genreBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  statusButtons: {
    gap: 8,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    padding: 8,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  noReview: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  noReviewSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  readButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  ratingPicker: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  reviewTextSection: {
    marginBottom: 20,
  },
  reviewTextInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
