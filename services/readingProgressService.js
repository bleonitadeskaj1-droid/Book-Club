/**
 * Reading Progress Service
 * Handles tracking and retrieving user reading progress
 */

import { supabase } from '../supabase';

export const readingProgressService = {
  // Validate UUIDs for Supabase user_id
  isValidUuid(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  },
  /**
   * Save reading progress for a book
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   * @param {object} options - { scrollPosition, contentLength, currentPage, totalPages, status }
   */
  async saveProgress(userId, bookId, { scrollPosition = 0, contentLength = 1, currentPage = null, totalPages = null, status = 'reading' }) {
    try {
      // Skip if invalid demo/admin user id
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping saveProgress: invalid userId', userId);
        return { success: false, percentage: 0, currentPage: null, totalPages: null };
      }
      const updateData = {
        user_id: userId,
        book_id: bookId,
        status: status || 'reading',
        updated_at: new Date().toISOString(),
      };

      // Handle page-based navigation
      if (currentPage !== null && totalPages !== null) {
        updateData.current_page = currentPage;
        updateData.total_pages = totalPages;
        // Calculate percentage from current page
        updateData.last_page = Math.round((currentPage / totalPages) * 100);
      } else {
        // Handle scroll-based progress (legacy)
        const readingPercentage = contentLength > 0 
          ? Math.min(Math.round((scrollPosition / contentLength) * 100), 100)
          : 0;
        updateData.last_page = readingPercentage;
      }

      // Upsert user_books record with progress
      const { error } = await supabase
        .from('user_books')
        .upsert(updateData, {
          onConflict: 'user_id,book_id',
        });

      if (error) {
        console.error('Error saving reading progress:', error);
        throw error;
      }

      return {
        success: true,
        percentage: updateData.last_page,
        currentPage: updateData.current_page,
        totalPages: updateData.total_pages,
      };
    } catch (err) {
      console.error('Reading progress service error:', err);
      throw err;
    }
  },

  /**
   * Get reading progress for a book
   * @param {string} userId - User ID
   * @param {string} bookId - Book ID
   */
  async getProgress(userId, bookId) {
    try {
      // Return default for invalid demo/admin user id
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping getProgress: invalid userId', userId);
        return {
          status: 'not_started',
          percentage: 0,
          currentPage: 1,
          totalPages: 0,
          updatedAt: null,
        };
      }
      const { data, error } = await supabase
        .from('user_books')
        .select('status, last_page, current_page, total_pages, updated_at')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (expected for new books)
        console.error('Error fetching reading progress:', error);
        throw error;
      }

      // Return default if no record exists
      if (!data) {
        return {
          status: 'not_started',
          percentage: 0,
          currentPage: 1,
          totalPages: 0,
          updatedAt: null,
        };
      }

      return {
        status: data.status || 'reading',
        percentage: data.last_page || 0,
        currentPage: data.current_page || 1,
        totalPages: data.total_pages || 0,
        updatedAt: data.updated_at,
      };
    } catch (err) {
      console.error('Error getting reading progress:', err);
      throw err;
    }
  },

  /**
   * Get currently reading books for user
   * @param {string} userId - User ID
   */
  async getCurrentlyReading(userId) {
    try {
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping getCurrentlyReading: invalid userId', userId);
        return [];
      }
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          id,
          book_id,
          status,
          last_page,
          updated_at,
          books:book_id (
            id,
            title,
            author,
            cover_url,
            content
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'reading')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching currently reading:', error);
        throw error;
      }

      return (data || []).map(item => ({
        userBookId: item.id,
        bookId: item.book_id,
        status: item.status,
        percentage: item.last_page || 0,
        updatedAt: item.updated_at,
        book: item.books,
      }));
    } catch (err) {
      console.error('Error in getCurrentlyReading:', err);
      return [];
    }
  },

  /**
   * Get finished reading books for user
   * @param {string} userId - User ID
   */
  async getFinishedReading(userId) {
    try {
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping getFinishedReading: invalid userId', userId);
        return [];
      }
      const { data, error } = await supabase
        .from('user_books')
        .select(`
          id,
          book_id,
          status,
          last_page,
          updated_at,
          books:book_id (
            id,
            title,
            author,
            cover_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching finished reading:', error);
        throw error;
      }

      return (data || []).map(item => ({
        userBookId: item.id,
        bookId: item.book_id,
        status: item.status,
        updatedAt: item.updated_at,
        book: item.books,
      }));
    } catch (err) {
      console.error('Error in getFinishedReading:', err);
      return [];
    }
  },

  /**
   * Calculate reading position (pixels) based on percentage and content length
   * @param {number} percentage - Reading percentage (0-100)
   * @param {number} contentLength - Total content length in pixels
   */
  calculatePosition(percentage, contentLength) {
    if (!contentLength) return 0;
    return Math.round((percentage / 100) * contentLength);
  },
};
