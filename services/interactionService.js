// Service for managing user interactions with books (status, reviews, etc.)
import { supabase } from '../supabase';

export const interactionService = {
  // Utility: validate a UUID (for Supabase user_id requirements)
  isValidUuid(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  },
  // ========================
  // READING STATUS OPERATIONS
  // Valid values: 'not_started', 'reading', 'completed'
  // ========================

  // Get reading status for a specific book
  async getBookStatus(userId, bookId) {
    try {
      // Skip query if demo/admin ID is not a valid UUID
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping getBookStatus: invalid userId', userId);
        return null;
      }
      const { data, error } = await supabase
        .from('user_books')
        .select('status')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data?.status || null;
    } catch (err) {
      console.error('Error fetching status:', err);
      return null;
    }
  },

  // Get all reading statuses for a user
  async getAllUserStatuses(userId) {
    try {
      // Skip query if demo/admin ID is not a valid UUID
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping getAllUserStatuses: invalid userId', userId);
        return {};
      }
      const { data, error } = await supabase
        .from('user_books')
        .select('book_id, status')
        .eq('user_id', userId);

      if (error) throw error;

      // Convert to object for easy lookup
      const statusMap = {};
      data?.forEach(item => {
        statusMap[item.book_id] = item.status;
      });
      return statusMap;
    } catch (err) {
      console.error('Error fetching all statuses:', err);
      return {};
    }
  },

  // Update reading status
  async updateBookStatus(userId, bookId, status) {
    try {
      console.log('updateBookStatus called with:', { userId, bookId, status });
      // Prevent invalid UUID updates (e.g., hardcoded admin demo ID)
      if (!this.isValidUuid(userId)) {
        console.warn('Skipping updateBookStatus: invalid userId', userId);
        return null;
      }
      
      // First check if record exists
      const { data: existing, error: checkError } = await supabase
        .from('user_books')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing status:', checkError);
        throw checkError;
      }

      if (existing) {
        console.log('Record exists, updating...');
        // Update existing
        const { data, error } = await supabase
          .from('user_books')
          .update({ status })
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update success:', data);
        return data?.[0];
      } else {
        console.log('Record does not exist, inserting new...');
        // Insert new
        const { data, error } = await supabase
          .from('user_books')
          .insert({
            user_id: userId,
            book_id: bookId,
            status,
          })
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert success:', data);
        return data?.[0];
      }
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    }
  },

  // ========================
  // REVIEW OPERATIONS
  // ========================

  // Get review for a book by current user
  async getUserReview(userId, bookId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (err) {
      console.error('Error fetching review:', err);
      return null;
    }
  },

  // Get all reviews for a book
  async getBookReviews(bookId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching book reviews:', err);
      return [];
    }
  },

  // Save or update review
  async saveReview(userId, bookId, rating, comment) {
    try {
      // Check if review exists
      const existing = await this.getUserReview(userId, bookId);

      if (existing) {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .select();

        if (error) throw error;
        return data?.[0];
      } else {
        // Insert new review
        const { data, error } = await supabase
          .from('reviews')
          .insert({
            user_id: userId,
            book_id: bookId,
            rating,
            comment,
          })
          .select();

        if (error) throw error;
        return data?.[0];
      }
    } catch (err) {
      console.error('Error saving review:', err);
      throw err;
    }
  },

  // Delete review
  async deleteReview(userId, bookId) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting review:', err);
      throw err;
    }
  },
};
