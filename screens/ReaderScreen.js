import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { readingProgressService } from '../services/readingProgressService';

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

const FONT_SIZES = {
  small: 14,
  medium: 16,
  large: 18,
  extraLarge: 20,
};

const LINE_HEIGHTS = {
  small: 20,
  medium: 24,
  large: 27,
  extraLarge: 30,
};

export default function ReaderScreen({ book, onClose, session, onRequireAuth }) {
  const [fontSize, setFontSize] = useState('medium');
  const [brightness, setBrightness] = useState(1);
  const [isRestoringPosition, setIsRestoringPosition] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const [savedProgress, setSavedProgress] = useState(null);
  
  // Page-based navigation
  const [currentPage, setCurrentPage] = useState(1);
  
  const scrollViewRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollPositionRef = useRef(0);

  // Configuration constants
  const CHARS_PER_PAGE = 2000; // Characters per page (more reliable than words)
  const MIN_PAGE_SIZE = 300; // Minimum characters on a page

  // Split content into pages - MEMOIZED to prevent recalculation
  const { pages, totalPages } = React.useMemo(() => {
    if (!book?.content || book.content.trim().length === 0) {
      console.warn(`⚠️ No content available for book: ${book?.title || 'Unknown'} (ID: ${book?.id})`);
      return { pages: [], totalPages: 0 };
    }

    const content = book.content.trim();
    const pageArray = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
      let endIndex = currentIndex + CHARS_PER_PAGE;

      // If this is the last page, include all remaining content
      if (endIndex >= content.length) {
        pageArray.push(content.substring(currentIndex));
        break;
      }

      // Find the nearest paragraph break (double newline) within the last 200 chars
      let breakPoint = endIndex;
      const searchStart = Math.max(currentIndex, endIndex - 200);
      const searchArea = content.substring(searchStart, endIndex);
      const paragraphBreak = searchArea.lastIndexOf('\n\n');

      if (paragraphBreak !== -1) {
        breakPoint = searchStart + paragraphBreak;
      } else {
        // If no paragraph break, find the nearest sentence end (period)
        const sentenceBreak = searchArea.lastIndexOf('. ');
        if (sentenceBreak !== -1) {
          breakPoint = searchStart + sentenceBreak + 2; // Include period and space
        }
      }

      // Ensure we make progress (minimum page size)
      if (breakPoint - currentIndex < MIN_PAGE_SIZE) {
        breakPoint = endIndex;
      }

      pageArray.push(content.substring(currentIndex, breakPoint).trim());
      currentIndex = breakPoint;
    }

    // DEBUG: Log book-specific details
    console.log(`\n📚 BOOK LOADED:`);
    console.log(`   Book ID: ${book?.id}`);
    console.log(`   Book Title: ${book?.title}`);
    console.log(`   Book Author: ${book?.author}`);
    console.log(`   Book Genre: ${book?.genre}`);
    console.log(`📖 PAGINATION:`);
    console.log(`   Total Characters: ${content.length}`);
    console.log(`   Total Pages: ${pageArray.length}`);
    pageArray.forEach((page, idx) => {
      console.log(`   Page ${idx + 1} (${page.length} chars): "${page.substring(0, 60).replace(/\n/g, ' ')}..."`);
    });
    console.log(`\n`);

    return {
      pages: pageArray,
      totalPages: pageArray.length,
    };
  }, [book?.content]);

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (!session?.user?.id || !book?.id) {
        setIsRestoringPosition(false);
        return;
      }

      try {
        const progress = await readingProgressService.getProgress(
          session.user.id,
          book.id
        );
        setSavedProgress(progress);

        // Restore page number
        if (progress?.currentPage && progress.currentPage > 0) {
          const validPage = Math.max(1, Math.min(progress.currentPage, totalPages || 1));
          console.log(`📖 Restored progress: Page ${validPage} of ${totalPages}`);
          setCurrentPage(validPage);
        } else {
          console.log(`📖 No saved progress, starting at page 1`);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('❌ Error loading reading progress:', error);
      } finally {
        setIsRestoringPosition(false);
      }
    };

    if (totalPages > 0) {
      loadProgress();
    } else if (totalPages === 0) {
      setIsRestoringPosition(false);
    }
  }, [session?.user?.id, book?.id, totalPages]);

  // Save progress when page changes
  const savePage = async (pageNum) => {
    if (!session?.user?.id || !book?.id || totalPages === 0) {
      return;
    }

    try {
      console.log(`💾 Saving page ${pageNum} of ${totalPages}`);
      await readingProgressService.saveProgress(session.user.id, book.id, {
        currentPage: pageNum,
        totalPages: totalPages,
        status: 'reading',
      });
      console.log(`✅ Page saved successfully`);
    } catch (error) {
      console.error('❌ Error saving page progress:', error);
      Alert.alert('Error', 'Failed to save reading progress');
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const executeNavigation = () => {
        const newPage = currentPage + 1;
        console.log(`➡️ Next page: ${currentPage} → ${newPage}`);
        setCurrentPage(newPage);
        savePage(newPage);
      };

      if (!session?.user?.id) {
        if (onRequireAuth) {
          onRequireAuth(executeNavigation);
        } else {
          Alert.alert('Login Required', 'Sign in to continue reading and save your progress');
        }
      } else {
        executeNavigation();
      }
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const executeNavigation = () => {
        const newPage = currentPage - 1;
        console.log(`⬅️ Previous page: ${currentPage} → ${newPage}`);
        setCurrentPage(newPage);
        savePage(newPage);
      };

      if (!session?.user?.id) {
        if (onRequireAuth) {
          onRequireAuth(executeNavigation);
        } else {
          Alert.alert('Login Required', 'Sign in to continue reading and save your progress');
        }
      } else {
        executeNavigation();
      }
    }
  };

  // Save progress on screen exit
  useEffect(() => {
    return () => {
      if (session?.user?.id && book?.id && totalPages > 0 && currentPage > 0) {
        console.log(`🔚 Saving final page on exit: ${currentPage}`);
        readingProgressService.saveProgress(session.user.id, book.id, {
          currentPage: currentPage,
          totalPages: totalPages,
          status: 'reading',
        }).catch((error) => {
          console.error('❌ Error saving final reading progress:', error);
        });
      }
    };
  }, [session?.user?.id, book?.id, currentPage, totalPages]);

  if (!book || !book.content) {
    return (
      <Modal visible={true} animationType="slide" transparent={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {book?.title || 'Reader'}
            </Text>
            <View style={styles.backButton} />
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No content available</Text>
            <Text style={styles.emptySubtext}>
              This book doesn't have readable content yet
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  const currentFontSize = FONT_SIZES[fontSize];
  const currentLineHeight = LINE_HEIGHTS[fontSize];

  return (
    <Modal visible={true} animationType="slide" transparent={false}>
      <View style={[styles.container, { opacity: brightness }]}>
        {isRestoringPosition && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Restoring your position...</Text>
          </View>
        )}
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {book.title}
            </Text>
            {savedProgress && savedProgress.percentage > 0 && (
              <View style={styles.progressIndicator}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${savedProgress.percentage}%` },
                  ]}
                />
              </View>
            )}
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Book content - Page-based */}
        <View style={styles.pageContainer}>
          <ScrollView style={styles.pageContent} showsVerticalScrollIndicator={false}>
            <View style={styles.contentContainer}>
              {/* Book title and author on first page */}
              {currentPage === 1 && (
                <>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>by {book.author}</Text>
                  <View style={styles.spacer} />
                </>
              )}

              {/* Current page content */}
              <Text
                style={[
                  styles.content,
                  {
                    fontSize: currentFontSize,
                    lineHeight: currentLineHeight,
                  },
                ]}
              >
                {pages[currentPage - 1] || 'Loading...'}
              </Text>

              {/* End marker on last page */}
              {currentPage === totalPages && (
                <View style={styles.endMarker}>
                  <Ionicons name="checkmark-circle" size={32} color={COLORS.primary} />
                  <Text style={styles.endText}>End of Book</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Page navigation bar */}
          <View style={styles.navigationBar}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentPage === 1 && styles.navButtonDisabled,
              ]}
              onPress={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentPage === 1 ? COLORS.border : COLORS.primary}
              />
            </TouchableOpacity>

            <View style={styles.pageIndicator}>
              <Text style={styles.pageText}>
                Page {currentPage} of {totalPages}
              </Text>
              <View style={styles.miniProgressBar}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${(currentPage / totalPages) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentPage === totalPages && styles.navButtonDisabled,
              ]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={currentPage === totalPages ? COLORS.border : COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reading controls footer */}
        <View style={styles.footer}>
          <View style={styles.controls}>
            {/* Font size controls */}
            <View style={styles.controlGroup}>
              <TouchableOpacity
                onPress={() => setFontSize('small')}
                style={[
                  styles.controlButton,
                  fontSize === 'small' && styles.activeControl,
                ]}
              >
                <Text
                  style={[
                    styles.fontSizeLabel,
                    fontSize === 'small' && { color: '#fff' },
                  ]}
                >
                  A
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFontSize('medium')}
                style={[
                  styles.controlButton,
                  fontSize === 'medium' && styles.activeControl,
                ]}
              >
                <Text
                  style={[
                    { fontSize: 16, fontWeight: '600' },
                    fontSize === 'medium' && { color: '#fff' },
                  ]}
                >
                  A
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFontSize('large')}
                style={[
                  styles.controlButton,
                  fontSize === 'large' && styles.activeControl,
                ]}
              >
                <Text
                  style={[
                    { fontSize: 18, fontWeight: '600' },
                    fontSize === 'large' && { color: '#fff' },
                  ]}
                >
                  A
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFontSize('extraLarge')}
                style={[
                  styles.controlButton,
                  fontSize === 'extraLarge' && styles.activeControl,
                ]}
              >
                <Text
                  style={[
                    { fontSize: 20, fontWeight: '600' },
                    fontSize === 'extraLarge' && { color: '#fff' },
                  ]}
                >
                  A
                </Text>
              </TouchableOpacity>
            </View>

            {/* Brightness controls */}
            <View style={styles.controlGroup}>
              <TouchableOpacity
                onPress={() => setBrightness(Math.max(0.5, brightness - 0.1))}
                style={styles.controlButton}
              >
                <Ionicons name="moon" size={18} color={COLORS.primary} />
              </TouchableOpacity>

              <View style={styles.brightnessBar}>
                <View
                  style={[
                    styles.brightnessFill,
                    { width: `${(brightness - 0.5) * 200}%` },
                  ]}
                />
              </View>

              <TouchableOpacity
                onPress={() => setBrightness(Math.min(1, brightness + 0.1))}
                style={styles.controlButton}
              >
                <Ionicons name="sunny" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  progressIndicator: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 1.5,
  },
  pageContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  pageContent: {
    flex: 1,
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  pageIndicator: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  pageText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  bookAuthor: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  spacer: {
    height: 24,
  },
  content: {
    color: COLORS.text,
    textAlign: 'justify',
    marginBottom: 32,
  },
  endMarker: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  endText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  controls: {
    gap: 16,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  activeControl: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fontSizeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  brightnessBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  brightnessFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
