// Simple Database Verification Script
// Run this after applying the FIXED schema to verify basic functionality

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vfikxuftsgozbqiemmut.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaWt4dWZ0c2dvemJxaWVtbXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTkwNzYsImV4cCI6MjA4MTE5NTA3Nn0.FcTt9PAko5rQ62Va5EDDZCTA3jEkbpomOQBrAIVH9AQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  console.log('🔍 Verifying Book Club Database Setup (Fixed Version)...\n');

  try {
    // Test 1: Check if books table exists and has data (should work now)
    console.log('1. Checking books table...');
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, genre, publication_year')
      .limit(5);

    if (booksError) {
      console.log('❌ Error accessing books:', booksError.message);
      if (booksError.message.includes('infinite recursion')) {
        console.log('   💡 This indicates the schema hasn\'t been updated with the fix.');
        console.log('   Please re-run the book-club-schema.sql in Supabase SQL Editor.');
      }
      return;
    } else {
      console.log(`✅ Books table accessible, found ${books.length} books:`);
      books.forEach(book => {
        console.log(`   - "${book.title}" by ${book.author} (${book.publication_year}) - ${book.genre}`);
      });
    }

    // Test 2: Check if profiles table is protected (should deny access for anon user)
    console.log('\n2. Checking profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1);

    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('✅ Profiles table properly protected (no unauthorized access)');
    } else if (profiles && profiles.length === 0 && !profilesError) {
      console.log('✅ Profiles table properly protected (RLS filtering working)');
    } else if (profilesError) {
      console.log('❌ Unexpected error accessing profiles:', profilesError.message);
    } else {
      console.log('⚠️  Profiles accessible without authentication');
    }

    // Test 3: Check if user_books table is protected
    console.log('\n3. Checking user_books table access...');
    const { data: userBooks, error: userBooksError } = await supabase
      .from('user_books')
      .select('*')
      .limit(1);

    if (userBooksError && userBooksError.code === 'PGRST116') {
      console.log('✅ User_books table properly protected');
    } else if (userBooks && userBooks.length === 0 && !userBooksError) {
      console.log('✅ User_books table properly protected (RLS filtering working)');
    } else if (userBooksError) {
      console.log('❌ Unexpected error accessing user_books:', userBooksError.message);
    } else {
      console.log('⚠️  User_books accessible without authentication');
    }

    // Test 4: Check if reviews table allows public read
    console.log('\n4. Checking reviews table access...');
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, comment')
      .limit(1);

    if (reviewsError && reviewsError.code === 'PGRST116') {
      console.log('✅ Reviews table properly protected');
    } else if (reviewsError) {
      console.log('❌ Unexpected error accessing reviews:', reviewsError.message);
    } else {
      console.log('✅ Reviews accessible for reading (public access)');
    }

    console.log('\n🎉 Basic verification complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test user registration and login');
    console.log('2. Test user-specific data access');
    console.log('3. Test admin functionality');
    console.log('4. Build the frontend application');

  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

verifyDatabase();