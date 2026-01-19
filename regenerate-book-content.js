// Script to regenerate unique content for all books in the database
// Usage: node regenerate-book-content.js
// This ensures each book has UNIQUE, GENRE-SPECIFIC content

// Use CommonJS import so the script runs under plain `node`
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('   Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate UNIQUE book content
const generateUniqueContent = (book) => {
  const { id, title, author, genre, description, publication_year } = book;

  // Create a seed based on book ID to ensure consistency
  const idSeed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // Genre-specific opening paragraphs
  const genreOpenings = {
    'Romance': `"${title}" is a sweeping romance by ${author}. This passionate tale follows two hearts destined to find each other against all odds.`,
    'Mystery': `Detective work and suspense define "${title}" by ${author}. Follow the investigation as clues lead deeper into a web of secrets.`,
    'Science Fiction': `In "${title}", ${author} explores a future where technology and humanity collide. Travel to worlds beyond imagination.`,
    'Fantasy': `"${title}" transports readers to magical realms. ${author} has crafted an epic where magic, heroes, and destiny intertwine.`,
    'Thriller': `Non-stop action propels "${title}" by ${author}. In this thriller, danger lurks at every turn and no one can be trusted.`,
    'Horror': `Face your fears in "${title}" by ${author}. This chilling tale delves into darkness and the terrors that hide within.`,
    'Biography': `"${title}" tells the extraordinary life story of ${author}. From humble beginnings to remarkable achievements, this is a life fully lived.`,
    'History': `${author}'s historical work "${title}" brings the past to life. Discover the events and people that shaped our world.`,
    'Self-Help': `"${title}" by ${author} is your guide to transformation. Learn the principles that lead to success and fulfillment.`,
    'Fiction': `"${title}" by ${author} is a compelling story of human experience. Love, loss, and redemption are at its heart.`,
  };

  const genreThemes = {
    'Romance': ['love', 'passion', 'commitment', 'heartbreak', 'soulmates', 'destiny'],
    'Mystery': ['clues', 'secrets', 'justice', 'investigation', 'suspense', 'truth'],
    'Science Fiction': ['technology', 'future', 'discovery', 'humanity', 'worlds', 'consciousness'],
    'Fantasy': ['magic', 'quests', 'kingdoms', 'destiny', 'heroes', 'prophecy'],
    'Thriller': ['danger', 'survival', 'betrayal', 'escape', 'conspiracy', 'revenge'],
    'Horror': ['fear', 'darkness', 'terror', 'supernatural', 'evil', 'doom'],
    'Biography': ['achievements', 'struggles', 'legacy', 'triumph', 'inspiration', 'life'],
    'History': ['war', 'change', 'civilization', 'discovery', 'revolution', 'empire'],
    'Self-Help': ['growth', 'success', 'mindfulness', 'happiness', 'confidence', 'change'],
    'Fiction': ['emotion', 'growth', 'relationships', 'truth', 'experience', 'life'],
  };

  const genreContent = {
    'Romance': `As ${title} begins, readers meet characters whose lives are about to change forever. Love finds a way even when circumstances seem impossible.`,
    'Mystery': `The mystery at the heart of ${title} demands investigation. Each clue reveals something shocking. Nothing is what it seems.`,
    'Science Fiction': `${title} asks: what does it mean to be human? In this future world, technology has advanced beyond imagination.`,
    'Fantasy': `Magic pulses through the world of ${title}. Ancient prophecies come to life as our heroes embark on their greatest quest.`,
    'Thriller': `In ${title}, every moment counts. Our protagonist must outwit enemies who will stop at nothing to achieve their goals.`,
    'Horror': `${title} crawls under your skin and refuses to leave. What begins as mystery becomes terror.`,
    'Biography': `Through triumph and tragedy, the subject of ${title} persevered. This is a story of remarkable human achievement.`,
    'History': `${title} captures a pivotal moment in history. These events changed the course of civilization forever.`,
    'Self-Help': `${title} provides practical wisdom from ${author}'s decades of experience. Apply these principles to transform your life.`,
    'Fiction': `${title} explores the universal human experience. Through its characters, we discover our own truths.`,
  };

  const opening = genreOpenings[genre] || genreOpenings['Fiction'];
  const theme = (genreThemes[genre] || genreThemes['Fiction'])[idSeed % 6];
  const middleContent = genreContent[genre] || genreContent['Fiction'];

  // Create unique chapters
  const chapters = [
    `\n\nChapter 1: The Beginning\n\n${opening}`,
    `\n\nChapter 2: Complications\n\n${middleContent} As the story progresses, the theme of ${theme} becomes increasingly important to our characters.`,
    `\n\nChapter 3: Development\n\nThe plot thickens. Unexpected revelations force the characters to reassess everything they believe.`,
    `\n\nChapter 4: Climax\n\nTensions reach their peak. Characters face their greatest challenges and must make impossible choices.`,
    `\n\nChapter 5: Resolution\n\nThe conclusion brings clarity to the mysteries and conflicts. Characters emerge changed by their experiences.`,
  ];

  const content = [
    `${title} by ${author}`,
    `Genre: ${genre}`,
    `Published: ${publication_year || 'Present Day'}`,
    `\n${description || 'A remarkable work of fiction'}`,
    ...chapters,
    `\n\nAbout the Author\n\n${author} has crafted a remarkable story in "${title}". This work showcases their mastery of the ${genre} genre.`,
  ].join('\n');

  return content;
};

// Main function
async function regenerateBookContent() {
  console.log('📚 Starting book content regeneration...\n');

  try {
    // Fetch all books
    const { data: books, error: fetchError } = await supabase
      .from('books')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching books:', fetchError.message);
      process.exit(1);
    }

    if (!books || books.length === 0) {
      console.log('⚠️  No books found in database');
      process.exit(0);
    }

    console.log(`📖 Found ${books.length} books to regenerate\n`);

    // Process each book
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const progress = `[${i + 1}/${books.length}]`;

      try {
        // Generate unique content
        const uniqueContent = generateUniqueContent(book);

        // Update the book
        const { error: updateError } = await supabase
          .from('books')
          .update({ content: uniqueContent })
          .eq('id', book.id);

        if (updateError) {
          console.error(`${progress} ❌ ${book.title}: ${updateError.message}`);
        } else {
          console.log(`${progress} ✅ ${book.title} (${uniqueContent.length} chars)`);
        }
      } catch (err) {
        console.error(`${progress} ❌ ${book.title}: ${err.message}`);
      }
    }

    console.log(`\n✅ Book content regeneration complete!`);

    // Verification
    console.log('\n📊 Verification:\n');
    const { data: updatedBooks } = await supabase
      .from('books')
      .select('id, title, author, genre, length(content) as content_length');

    let sameCount = 0;
    for (let i = 0; i < updatedBooks.length - 1; i++) {
      for (let j = i + 1; j < updatedBooks.length; j++) {
        if (updatedBooks[i].content_length === updatedBooks[j].content_length) {
          console.log(`⚠️  "${updatedBooks[i].title}" and "${updatedBooks[j].title}" have same length`);
          sameCount++;
        }
      }
    }

    if (sameCount === 0) {
      console.log('✅ All books have unique content lengths');
    } else {
      console.log(`⚠️  ${sameCount} pairs with same length (may still be unique)`);
    }

    console.log('\n✅ Book regeneration script completed successfully!');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
regenerateBookContent();
