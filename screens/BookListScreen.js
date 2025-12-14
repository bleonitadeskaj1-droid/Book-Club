import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';
import AdminSidebar from '../components/AdminSidebar';

const STATUS_OPTIONS = ['to_read', 'reading', 'finished'];
const AI_SUGGESTIONS = [
  'The Pragmatic Programmer',
  'Clean Code',
  'Atomic Habits',
  'Thinking, Fast and Slow',
  'Deep Work'
];

function BookListScreen({ isAdmin = false, logout, userId }) {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('to_read');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [readerBook, setReaderBook] = useState(null);
  const [showReader, setShowReader] = useState(false);
  const [readerPage, setReaderPage] = useState(0);
  const PAGE_SIZE = 1400; // characters per page for the reader
  const [lastPages, setLastPages] = useState({}); // Track last page for each book
  const [reviews, setReviews] = useState([]); // All reviews from all users
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Admin sidebar state
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const filteredBooks = useMemo(() => {
    let arr = books;
    if (filter === 'favorites') {
      arr = arr.filter(b => b.favorite);
    } else if (filter !== 'all') {
      arr = arr.filter(b => b.status === filter);
    }
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      arr = arr.filter(b => (
        (b.title || '').toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q)
      ));
    }
    return arr;
  }, [books, filter, searchQuery]);

  useEffect(() => {
    fetchBooks();
    fetchReviews();
    loadProfile();
    createProfileIfNotExists(); // Auto-create profile on mount
  }, []);

  const loadProfile = async () => {
    // Skip Supabase profile calls to avoid RLS recursion issues; just set display values
    setProfileName(userId.includes('admin') ? 'Admin' : 'User');
    setProfileEmail(userId);
    setAvatarUrl('');
  };

  const createProfileIfNotExists = async () => {
    if (!userId) {
      console.log('❌ No userId provided');
      return;
    }

    try {
      console.log('🔍 Checking if profile exists for email:', userId);

      const { data: existingProfiles, error: selectError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', userId);

      if (selectError) {
        console.error('❌ Error checking profile:', selectError);
        return;
      }

      if (existingProfiles && existingProfiles.length > 0) {
        console.log('✅ Profile already exists:', existingProfiles[0]);
        return;
      }

      console.log('➕ Creating new profile for:', userId);
      const newRole = 'user'; // Regular users always get 'user' role

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          email: userId,
          role: newRole
        }])
        .select();

      if (insertError) {
        console.error('❌ Error creating profile:', insertError);
        return;
      }

      console.log('✅ Profile created successfully:', newProfile);
    } catch (err) {
      console.error('🔴 Exception:', err);
    }
  };

  const saveProfile = async () => {
    // Profile table only has id and role, can't save name/email
    setError('✓ Profile settings saved (display only)');
    setTimeout(() => setError(''), 3000);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    console.log('🔍 Fetching users from profiles table...');
    try {
      const { data, error } = await supabase.from('profiles').select('id, role, email');

      if (error) {
        console.error('❌ Error fetching users:', error);
        setError(`Error: ${error.message}`);
        setUsers([]);
        return;
      }

      console.log('✅ Users fetched:', data);
      if (!data || data.length === 0) {
        console.log('⚠️ No users in profiles table');
        setUsers([]);
        setError('');
        return;
      }

      const mappedUsers = data.map((user, idx) => {
        console.log(`Processing user ${idx + 1}:`, user);
        return {
          ...user,
          user_id: user.id,
          name: user.role === 'admin' ? 'Admin User' : `User ${idx + 1}`,
          userEmail: user.email || `user${idx}@bookclub.com`,
          roleLabel: user.role ? user.role.toUpperCase() : 'USER'
        };
      });

      console.log('📋 Mapped users:', mappedUsers);
      setUsers(mappedUsers);
      setError('');
    } catch (err) {
      console.error('🔴 Exception:', err);
      setError(`Exception: ${err.message}`);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!userId) return;
    if (!confirm(`Delete user ${userId}? This cannot be undone.`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) {
      setError(`Failed to delete user: ${error.message}`);
      return;
    }
    setError('✓ User deleted successfully');
    fetchUsers();
    setTimeout(() => setError(''), 3000);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera roll permissions!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Sorry, we need camera permissions!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase.from('books').select('*').order('title');
    if (err) setError(err.message);
    setBooks(data || []);
    // Build last page map
    const pageMap = {};
    (data || []).forEach(book => {
      pageMap[book.id] = book.last_page || 0;
    });
    setLastPages(pageMap);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data, error: err } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (err) {
      console.log('Reviews fetch error (table may not exist):', err.message);
      setReviews([]);
    } else {
      setReviews(data || []);
    }
  };

  const addBook = async (bookTitle = title) => {
    const trimmed = (bookTitle || '').trim();
    if (!trimmed) return;
    await supabase.from('books').insert([{ title: trimmed, status }]);
    setTitle('');
    fetchBooks();
  };

  const updateStatus = async (id, nextStatus) => {
    await supabase.from('books').update({ status: nextStatus }).eq('id', id);
    fetchBooks();
  };

  const deleteBook = async (id) => {
    await supabase.from('books').delete().eq('id', id);
    fetchBooks();
  };

  const toggleFavorite = async (book) => {
    const next = !book.favorite;
    await supabase.from('books').update({ favorite: next }).eq('id', book.id);
    fetchBooks();
  };

  const downloadBook = async (book) => {
    try {
      if (!book.content) {
        setError('No content to download for this book.');
        return;
      }
      setDownloadingId(book.id);
      const filename = `${(book.title || 'book').replace(/[^a-z0-9\-\s]/gi, '_')}.txt`;

      if (Platform.OS === 'web') {
        const blob = new Blob([book.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setError(`✓ Downloaded: ${filename}`);
      } else {
        if (!FileSystem || !FileSystem.writeAsStringAsync) {
          setError('Downloads not supported in this environment.');
          return;
        }
        const baseDir = FileSystem.documentDirectory;
        const uri = baseDir + filename;
        await FileSystem.writeAsStringAsync(uri, book.content, { encoding: FileSystem.EncodingType.UTF8 });
        setError(`✓ Saved to app documents: ${filename}`);
      }
    } catch (e) {
      setError(`Download failed: ${e.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const saveNote = async (bookId, note, rating) => {
    // Check if user already reviewed this book
    const existingReview = reviews.find(r => r.book_id === bookId && r.user_id === userId);
    
    let saveErr;
    if (existingReview) {
      // Update existing review
      const { error } = await supabase.from('reviews')
        .update({ comment: note, rating, updated_at: new Date().toISOString() })
        .eq('id', existingReview.id);
      saveErr = error;
    } else {
      // Insert new review
      const { error } = await supabase.from('reviews').insert([{
        book_id: bookId,
        user_id: userId,
        comment: note,
        rating
      }]);
      saveErr = error;
    }
    
    if (saveErr) {
      console.error('Save error:', saveErr);
      setError(`Failed to save review: ${saveErr.message}. Make sure reviews table exists with columns: book_id, user_id, comment, rating`);
    } else {
      console.log('Review saved successfully');
      await fetchReviews();
    }
    setEditingId(null);
  };

  const StatusBadge = ({ value }) => (
    <View style={[styles.badge, styles[value]]}>
      <Text style={styles.badgeText}>{value}</Text>
    </View>
  );

  const splitPages = (text) => {
    if (!text) return [];
    const clean = text.replace(/\r\n/g, '\n');
    const pages = [];
    let idx = 0;
    while (idx < clean.length) {
      pages.push(clean.slice(idx, idx + PAGE_SIZE));
      idx += PAGE_SIZE;
    }
    return pages.length ? pages : [''];
  };

  const renderCover = (item) => {
    if (item.cover_url) {
      return <Image source={{ uri: item.cover_url }} style={styles.cover} />;
    }
    return (
      <View style={[styles.cover, styles.coverPlaceholder]}>
        <Text style={styles.coverPlaceholderText}>{(item.title || 'Book').slice(0, 1)}</Text>
      </View>
    );
  };

  const BookCard = React.memo(({ item }) => {
    const [localNote, setLocalNote] = useState('');
    const [localRating, setLocalRating] = useState(0);
    const nextStatus = item.status === 'to_read' ? 'reading' : item.status === 'reading' ? 'finished' : 'to_read';
    const isEditing = editingId === item.id;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.title}</Text>
          <StatusBadge value={item.status} />
        </View>

        <View style={styles.rowStart}>
          {renderCover(item)}
          <View style={{ flex: 1 }}>
            <Text style={styles.description}>{item.description || 'No description yet. Add one from admin.'}</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => {
              const savedPage = lastPages[item.id] || 0;
              setReaderBook(item);
              setReaderPage(savedPage);
              setShowReader(true);
            }}>
              <Text style={styles.secondaryButtonText}>{lastPages[item.id] > 0 ? `Continue (p.${lastPages[item.id] + 1})` : 'Read'}</Text>
            </TouchableOpacity>

            <View style={[styles.rowWrap, { marginTop: 6 }]}> 
              <TouchableOpacity style={styles.iconButton} onPress={() => toggleFavorite(item)}>
                <Text style={styles.iconText}>{item.favorite ? '★ Favorite' : '☆ Favorite'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => downloadBook(item)} disabled={downloadingId === item.id}>
                <Text style={styles.iconText}>{downloadingId === item.id ? 'Downloading…' : '⤓ Download'}</Text>
              </TouchableOpacity>
              {isAdmin ? (
                <TouchableOpacity style={styles.iconButton} onPress={() => deleteBook(item.id)}>
                  <Text style={[styles.iconText, { color: '#f87171' }]}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Status selection for all users */}
        <View style={[styles.rowWrap, { marginTop: 4 }]}>
          {STATUS_OPTIONS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, item.status === s && styles.chipActive]}
              onPress={() => updateStatus(item.id, s)}
            >
              <Text style={item.status === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isEditing ? (
          <>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setLocalRating(star)}>
                  <Text style={styles.star}>{star <= localRating ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Add a comment (optional)"
              placeholderTextColor="#94a3b8"
              value={localNote}
              onChangeText={setLocalNote}
              style={[styles.input, { minHeight: 80 }]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus={false}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={() => {
              saveNote(item.id, localNote, localRating);
              setLocalNote('');
              setLocalRating(0);
            }}>
              <Text style={styles.primaryButtonText}>Save Review</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setEditingId(null);
              setLocalNote('');
              setLocalRating(0);
            }}>
              <Text style={styles.linkMuted}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {(() => {
              const bookReviews = reviews.filter(r => r.book_id === item.id);
              if (bookReviews.length === 0) {
                return <Text style={styles.note}>No reviews yet</Text>;
              }
              return (
                <View style={styles.allReviewsContainer}>
                  <Text style={styles.reviewsHeader}>Reviews ({bookReviews.length})</Text>
                  {bookReviews.map(review => (
                    <View key={review.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUser}>{review.user_id}</Text>
                        <View style={styles.starDisplay}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Text key={star} style={styles.starSmall}>{star <= review.rating ? '⭐' : '☆'}</Text>
                          ))}
                        </View>
                      </View>
                      {review.comment ? <Text style={styles.reviewComment}>{review.comment}</Text> : null}
                    </View>
                  ))}
                </View>
              );
            })()}
            <View style={styles.rowBetween}>
              <TouchableOpacity
                onPress={() => {
                  const userReview = reviews.find(r => r.book_id === item.id && r.user_id === userId);
                  setLocalNote(userReview?.comment || '');
                  setLocalRating(userReview?.rating || 0);
                  setEditingId(item.id);
                }}
              >
                <Text style={styles.edit}>{reviews.find(r => r.book_id === item.id && r.user_id === userId) ? 'Edit my review' : 'Add review'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {isAdmin ? (
          <View style={styles.rowBetween}>
            <TouchableOpacity onPress={() => deleteBook(item.id)}>
              <Text style={styles.danger}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  });

  BookCard.displayName = 'BookCard';

  return (
    <LinearGradient colors={["#0f172a", "#111827", "#0b1021"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>📚 Book Club</Text>
            <Text style={styles.subheader}>
              {isAdmin
                ? 'Admin can add/manage books; members can review.'
                : 'Browse titles and leave your review.'}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={() => setShowSidebar(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Add form */}
        {isAdmin ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add a book</Text>
            <TextInput
              placeholder="Title or paste from clipboard"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <View style={styles.rowWrap}>
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  style={[styles.chip, status === s && styles.chipActive]}
                >
                  <Text style={status === s ? styles.chipTextActive : styles.chipText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => addBook()}>
              <Text style={styles.primaryButtonText}>Add Book</Text>
            </TouchableOpacity>

            <Text style={styles.sectionSubtitle}>AI quick picks</Text>
            <View style={styles.rowWrap}>
              {AI_SUGGESTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.suggestion} onPress={() => addBook(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Filters + Search */}
        <View style={[styles.card, { paddingVertical: 12 }]}> 
          <Text style={styles.sectionTitle}>Browse</Text>
          <TextInput
            placeholder="Search books by title or description"
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
          />
          <View style={styles.rowWrap}>
            {['all', 'favorites', ...STATUS_OPTIONS].map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
                <Text style={filter === f ? styles.chipTextActive : styles.chipText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* List */}
        <View style={{ width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="large" color="#67e8f9" style={{ marginTop: 20 }} />
          ) : filteredBooks.length === 0 ? (
            <Text style={styles.empty}>No books yet. Add one or pick a suggestion.</Text>
          ) : (
            <FlatList
              data={filteredBooks}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => <BookCard item={item} />}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              extraData={editingId}
            />
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Profile Sidebar */}
        <Modal visible={showSidebar} animationType="slide" transparent>
          <View style={styles.sidebarOverlay}>
            <View style={styles.sidebarContent}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => setShowSidebar(false)}>
                  <Text style={styles.sidebarClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.avatarContainer}>
                <TouchableOpacity style={styles.avatar} onPress={pickImage}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{(profileName || userId || 'U').charAt(0).toUpperCase()}</Text>
                  )}
                </TouchableOpacity>
                <View style={styles.avatarButtons}>
                  <TouchableOpacity style={styles.avatarActionButton} onPress={pickImage}>
                    <Text style={styles.avatarActionText}>📷 Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.avatarActionButton} onPress={takePhoto}>
                    <Text style={styles.avatarActionText}>📸 Camera</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.profileUsername}>{userId}</Text>
              </View>

              <View style={styles.profileForm}>
                <Text style={styles.profileLabel}>Display Name</Text>
                <TextInput
                  placeholder="Your name"
                  placeholderTextColor="#94a3b8"
                  value={profileName}
                  onChangeText={setProfileName}
                  style={styles.profileInput}
                />

                <Text style={styles.profileLabel}>Email</Text>
                <TextInput
                  placeholder="your.email@example.com"
                  placeholderTextColor="#94a3b8"
                  value={profileEmail}
                  onChangeText={setProfileEmail}
                  style={styles.profileInput}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity style={styles.profileSaveButton} onPress={saveProfile}>
                  <Text style={styles.profileSaveText}>Save Changes</Text>
                </TouchableOpacity>

                <View style={styles.profileStats}>
                  <Text style={styles.statsTitle}>My Stats</Text>
                  <Text style={styles.statsText}>Reviews: {reviews.filter(r => r.user_id === userId).length}</Text>
                  <Text style={styles.statsText}>Books Read: {books.filter(b => b.status === 'finished').length}</Text>
                </View>

                {logout ? (
                  <TouchableOpacity style={styles.sidebarLogout} onPress={() => { setShowSidebar(false); logout(); }}>
                    <Text style={styles.sidebarLogoutText}>Logout</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showReader} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{readerBook?.title || 'Book'}</Text>
                <TouchableOpacity onPress={async () => {
                  // Save current page before closing
                  if (readerBook?.id) {
                    await supabase.from('books').update({ last_page: readerPage }).eq('id', readerBook.id);
                    setLastPages(prev => ({ ...prev, [readerBook.id]: readerPage }));
                  }
                  setShowReader(false);
                  setReaderBook(null);
                }}>
                  <Text style={styles.linkStrong}>Close</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Page {readerPage + 1}</Text>
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {(() => {
                  const pages = splitPages(readerBook?.content);
                  if (!pages.length) {
                    return (
                      <View>
                        <Text style={[styles.readerText, { color: '#f87171', marginBottom: 12 }]}>
                          ⚠️ Content not available yet.
                        </Text>
                        <Text style={[styles.readerText, { color: '#94a3b8', marginBottom: 12 }]}>
                          To fix this:{'\n'}
                          1. Go to Admin Console{'\n'}
                          2. Click "+ Add All Books" button{'\n'}
                          3. Make sure your Supabase books table has these columns: content, description, cover_url
                        </Text>
                        {readerBook?.description ? (
                          <View>
                            <Text style={[styles.readerText, { fontWeight: '700', marginTop: 8 }]}>Description:</Text>
                            <Text style={[styles.readerText, { marginTop: 4, fontStyle: 'italic' }]}>
                              {readerBook.description}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  }
                  const safePage = Math.min(readerPage, pages.length - 1);
                  const text = pages[safePage];
                  if (safePage !== readerPage) setReaderPage(safePage);
                  return <Text style={styles.readerText}>{text}</Text>;
                })()}
              </ScrollView>
              {readerBook?.content ? (
                <View style={styles.rowBetween}>
                  <TouchableOpacity
                    onPress={() => setReaderPage(p => Math.max(0, p - 1))}
                    disabled={readerPage === 0}
                  >
                    <Text style={readerPage === 0 ? styles.linkMuted : styles.linkStrong}>Prev</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const total = splitPages(readerBook?.content).length;
                      setReaderPage(p => Math.min(total - 1, p + 1));
                    }}
                    disabled={(splitPages(readerBook?.content).length || 1) - 1 === readerPage}
                  >
                    <Text style={(splitPages(readerBook?.content).length || 1) - 1 === readerPage ? styles.linkMuted : styles.linkStrong}>Next</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      </ScrollView>

      <AdminSidebar
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
        userId={userId}
        logout={logout}
        showAdminProfile={showAdminProfile}
        setShowAdminProfile={setShowAdminProfile}
        profileName={profileName}
        setProfileName={setProfileName}
        profileEmail={profileEmail}
        setProfileEmail={setProfileEmail}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        saveProfile={saveProfile}
        pickImage={pickImage}
        takePhoto={takePhoto}
        books={books}
        showUserManagement={showUserManagement}
        setShowUserManagement={setShowUserManagement}
        users={users}
        loadingUsers={loadingUsers}
        fetchUsers={fetchUsers}
        deleteUser={deleteUser}
        styles={styles}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60 },
  headerRow: { marginBottom: 12 },
  header: { color: '#e0f2fe', fontSize: 28, fontWeight: '800' },
  subheader: { color: '#94a3b8', marginTop: 4 },
  logout: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    marginBottom: 10
  },
  logoutText: { color: '#e2e8f0', fontWeight: '700' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14
  },
  sectionTitle: { color: '#e2e8f0', fontWeight: '700', marginBottom: 8 },
  sectionSubtitle: { color: '#cbd5e1', marginTop: 6, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10
  },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 4,
    marginBottom: 6
  },
  chipActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9'
  },
  chipText: { color: '#cbd5e1' },
  chipTextActive: { color: '#0b1021', fontWeight: '700' },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6
  },
  primaryButtonText: { color: '#0b1021', fontWeight: '800' },
  secondaryButton: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderColor: 'rgba(14,165,233,0.6)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8
  },
  secondaryButtonText: { color: '#67e8f9', fontWeight: '700' },
  suggestion: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 6,
    marginBottom: 6
  },
  suggestionText: { color: '#e2e8f0' },
  title: { fontSize: 17, fontWeight: '700', color: '#e2e8f0' },
  description: { color: '#cbd5e1', marginTop: 6 },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6
  },
  iconText: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  note: { marginVertical: 6, color: '#cbd5e1' },
  reviewContainer: { marginVertical: 8 },
  allReviewsContainer: { marginTop: 12, marginBottom: 8 },
  reviewsHeader: { color: '#e2e8f0', fontWeight: '700', fontSize: 15, marginBottom: 8 },
  reviewItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewUser: { color: '#67e8f9', fontWeight: '700', fontSize: 13 },
  reviewComment: { color: '#cbd5e1', fontSize: 14, marginTop: 4 },
  starContainer: { flexDirection: 'row', marginBottom: 12, marginTop: 8 },
  starDisplay: { flexDirection: 'row', marginBottom: 6 },
  star: { fontSize: 36, marginRight: 8 },
  starSmall: { fontSize: 18, marginRight: 4 },
  edit: { color: '#38bdf8', marginTop: 5, fontWeight: '600' },
  linkStrong: { color: '#8b6f47', fontWeight: '700', fontSize: 16 },
  linkMuted: { color: '#94a3b8', marginTop: 6 },
  danger: { color: '#f87171', fontWeight: '700' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14
  },
  badgeText: { color: '#0b1021', fontSize: 12, fontWeight: '700' },
  to_read: { backgroundColor: '#cbd5e1' },
  reading: { backgroundColor: '#facc15' },
  finished: { backgroundColor: '#34d399' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 12 },
  error: { color: '#f87171', marginTop: 12 },
  cover: {
    width: 90,
    height: 120,
    borderRadius: 10,
    marginRight: 12,
    marginVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1
  },
  coverPlaceholderText: { color: '#e2e8f0', fontSize: 28, fontWeight: '800' },
  rowStart: { flexDirection: 'row', alignItems: 'flex-start' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16
  },
  modalCard: {
    backgroundColor: '#f9f7f4',
    borderRadius: 4,
    padding: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#d4c5b0'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalTitle: { color: '#2d2d2d', fontSize: 22, fontWeight: '800', flex: 1, marginRight: 10, fontFamily: 'serif' },
  modalSubtitle: { color: '#6b5d4f', marginBottom: 12, fontSize: 13, fontStyle: 'italic' },
  modalBody: { maxHeight: 450, paddingHorizontal: 8 },
  readerText: { color: '#2d2d2d', lineHeight: 26, fontSize: 16, fontFamily: 'serif', textAlign: 'justify' },
  menuButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  menuIcon: { color: '#e2e8f0', fontSize: 24, fontWeight: '700' },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  sidebarContent: {
    width: '80%',
    maxWidth: 350,
    height: '100%',
    backgroundColor: '#0b1021',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  sidebarTitle: { color: '#e2e8f0', fontSize: 22, fontWeight: '800' },
  sidebarClose: { color: '#94a3b8', fontSize: 32, fontWeight: '300', padding: 8, minWidth: 44, textAlign: 'center' },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden'
  },
  avatarImage: {
    width: 80,
    height: 80
  },
  avatarText: { color: '#0b1021', fontSize: 32, fontWeight: '800' },
  avatarButtons: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  avatarActionButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  avatarActionText: { color: '#cbd5e1', fontSize: 12 },
  profileUsername: { color: '#67e8f9', fontSize: 16, fontWeight: '700' },
  profileForm: { flex: 1 },
  profileLabel: { color: '#94a3b8', marginBottom: 6, fontSize: 13, fontWeight: '700' },
  profileInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  profileSaveButton: {
    backgroundColor: '#0ea5e9',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24
  },
  profileSaveText: { color: '#0b1021', fontWeight: '800', fontSize: 16 },
  profileStats: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  statsTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  statsText: { color: '#cbd5e1', fontSize: 14, marginBottom: 4 },
  sidebarLogout: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.4)',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  sidebarLogoutText: { color: '#f87171', fontWeight: '700', fontSize: 16 }
});

export default BookListScreen;
