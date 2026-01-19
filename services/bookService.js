// Book service for handling book-related operations
import { supabase } from '../supabase';

export const bookService = {
  // Get all books
  async getBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');

    if (error) throw error;
    return data || [];
  },

  // Get book by ID
  async getBookById(id) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Search books
  async searchBooks(query) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .order('title');

    if (error) throw error;
    return data || [];
  },

  // Get user's reading progress for a book
  async getReadingProgress(userId, bookId) {
    const { data, error } = await supabase
      .from('user_reading_status')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || { progress_percentage: 0, status: 'not_started' };
  },

  // Update reading progress
  async updateReadingProgress(userId, bookId, progress) {
    const progressData = {
      user_id: userId,
      book_id: bookId,
      progress_percentage: progress,
      last_read_at: new Date().toISOString(),
      status: progress > 0 ? (progress >= 100 ? 'completed' : 'reading') : 'not_started',
    };

    // First check if record exists
    const { data: existing } = await supabase
      .from('user_reading_status')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('user_reading_status')
        .update(progressData)
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabase
        .from('user_reading_status')
        .insert(progressData);

      if (error) throw error;
    }
  },

  // Toggle favorite status
  async toggleFavorite(userId, bookId) {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) throw error;
      return false; // Not favorited
    } else {
      // Add favorite
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          book_id: bookId,
        });

      if (error) throw error;
      return true; // Favorited
    }
  },

  // Check if book is favorited by user
  async isFavorited(userId, bookId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },
};