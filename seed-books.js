import { supabase } from './supabase.js';

// Comprehensive book collection across diverse genres
const sampleBooks = [
  // FICTION
  {
    title: 'The Midnight Library',
    author: 'Matt Haig',
    publication_year: 2020,
    genre: 'Fiction',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
  },
  {
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    publication_year: 2003,
    genre: 'Fiction',
    description: 'A devastating story of childhood friendship torn apart by jealousy, set against the backdrop of Afghanistan\'s tumultuous history.',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop'
  },
  {
    title: 'The Goldfinch',
    author: 'Donna Tartt',
    publication_year: 2013,
    genre: 'Fiction',
    description: 'A young boy in New York City, Theo Decker, miraculously survives an accident that kills his mother. His life becomes linked to a small painting.',
    cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'
  },
  
  // ROMANCE
  {
    title: 'It Ends with Us',
    author: 'Colleen Hoover',
    publication_year: 2016,
    genre: 'Romance',
    description: 'A powerful story about breaking cycles of abuse and finding strength in yourself. A must-read contemporary romance.',
    cover_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=600&fit=crop'
  },
  {
    title: 'People We Meet on Vacation',
    author: 'Emily Henry',
    publication_year: 2021,
    genre: 'Romance',
    description: 'Two best friends take one last trip to see if their friendship can become something more in this funny, emotional love story.',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'
  },
  {
    title: 'Red, White & Royal Blue',
    author: 'Casey McQuiston',
    publication_year: 2019,
    genre: 'Romance',
    description: 'When his mother becomes President, Alex Claremont-Diaz is promptly cast as the American equivalent of a young royal. But a rivalry with Prince Henry turns into something deeper.',
    cover_url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&h=600&fit=crop'
  },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    publication_year: 2017,
    genre: 'Romance',
    description: 'Reclusive Hollywood icon Evelyn Hugo finally shares the true story of her glamorous and scandalous life, one husband at a time.',
    cover_url: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=600&fit=crop'
  },
  
  // FANTASY
  {
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    publication_year: 2011,
    genre: 'Fantasy',
    description: 'Two young magicians are bound in a magical competition within a mysterious circus. A breathtaking tale of wonder and love.',
    cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop'
  },
  {
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    publication_year: 2007,
    genre: 'Fantasy',
    description: 'The tale of Kvothe, from his childhood in a troupe of traveling players, to years spent as a near-feral orphan, to his time as a student at a prestigious magic academy.',
    cover_url: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop'
  },
  {
    title: 'The House in the Cerulean Sea',
    author: 'TJ Klune',
    publication_year: 2020,
    genre: 'Fantasy',
    description: 'A magical inspection of the most dangerous children in the magical world leads to unexpected friendship and belonging.',
    cover_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop'
  },
  {
    title: 'Circe',
    author: 'Madeline Miller',
    publication_year: 2018,
    genre: 'Fantasy',
    description: 'In this stunning reimagining, the goddess Circe is exiled to an island where she discovers power beyond imagination.',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop'
  },
  {
    title: 'Piranesi',
    author: 'Susanna Clarke',
    publication_year: 2020,
    genre: 'Fantasy',
    description: 'A mysterious man lives in a vast, bewildering house of halls and staircases. A masterpiece of imagination and wonder.',
    cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop'
  },
  
  // MYSTERY
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    publication_year: 2019,
    genre: 'Mystery',
    description: 'A woman shoots her husband five times in the face and never speaks again. The psychotherapist becomes obsessed with uncovering her motive.',
    cover_url: 'https://images.unsplash.com/photo-1543002588-d4d8c8b03cf7?w=400&h=600&fit=crop'
  },
  {
    title: 'The Guest List',
    author: 'Lucy Foley',
    publication_year: 2020,
    genre: 'Mystery',
    description: 'A wedding on a remote island off the coast of Ireland. A rising body count. Who among the guests is the killer?',
    cover_url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop'
  },
  {
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    publication_year: 2018,
    genre: 'Mystery',
    description: 'Abandoned in the marshes of North Carolina, Kya grows up alone and becomes mysterious when a local man is found dead.',
    cover_url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop'
  },
  {
    title: 'The Thursday Murder Club',
    author: 'Richard Osman',
    publication_year: 2020,
    genre: 'Mystery',
    description: 'Four unlikely friends meet weekly to investigate unsolved murders, but when a real killer arrives at their retirement village, they face their first live case.',
    cover_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop'
  },
  {
    title: 'Verity',
    author: 'Colleen Hoover',
    publication_year: 2018,
    genre: 'Mystery',
    description: 'A thrilling story of a writer who becomes emotionally entangled with the wife of an author she\'s hired to write about.',
    cover_url: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400&h=600&fit=crop'
  },
  
  // SCIENCE FICTION
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    publication_year: 2021,
    genre: 'Science Fiction',
    description: 'A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the author of The Martian.',
    cover_url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&h=600&fit=crop'
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    publication_year: 1965,
    genre: 'Science Fiction',
    description: 'The greatest science fiction novel ever written. An epic tale of politics, religion, and ecology on a desert planet.',
    cover_url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=600&fit=crop'
  },
  {
    title: 'The Three-Body Problem',
    author: 'Liu Cixin',
    publication_year: 2008,
    genre: 'Science Fiction',
    description: 'Set against the backdrop of China\'s Cultural Revolution, a secret military project sends signals into space to establish contact with aliens.',
    cover_url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop'
  },
  {
    title: 'Ender\'s Game',
    author: 'Orson Scott Card',
    publication_year: 1985,
    genre: 'Science Fiction',
    description: 'Young Ender Wiggin is recruited to battle school to train in the art of war against an alien race threatening Earth.',
    cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'
  },
  {
    title: 'Neuromancer',
    author: 'William Gibson',
    publication_year: 1984,
    genre: 'Science Fiction',
    description: 'A hacker is hired for one last job that takes him into cyberspace and corporate espionage in this cyberpunk classic.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
  },
  
  // SELF-HELP
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    publication_year: 2018,
    genre: 'Self-Help',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Practical strategies from the world\'s leading expert on habit formation.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
  },
  {
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    publication_year: 1997,
    genre: 'Self-Help',
    description: 'A guide to spiritual enlightenment that teaches living in the present moment is the truest path to happiness.',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop'
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen Covey',
    publication_year: 1989,
    genre: 'Self-Help',
    description: 'A holistic approach to solving personal and professional problems with penetrating insights and practical lessons.',
    cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop'
  },
  {
    title: 'The Subtle Art of Not Giving a F*ck',
    author: 'Mark Manson',
    publication_year: 2016,
    genre: 'Self-Help',
    description: 'A counterintuitive approach to living a good life, teaching you to focus only on what truly matters.',
    cover_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop'
  },
  {
    title: 'Can\'t Hurt Me',
    author: 'David Goggins',
    publication_year: 2018,
    genre: 'Self-Help',
    description: 'Master Your Mind and Defy the Odds. From Navy SEAL to ultra-endurance athlete, Goggins shares his story of transformation.',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop'
  },
  
  // BIOGRAPHY
  {
    title: 'Educated',
    author: 'Tara Westover',
    publication_year: 2018,
    genre: 'Biography',
    description: 'Born to survivalists in the Idaho mountains, Tara Westover was never sent to school. She raised herself through books and teaches herself enough to gain admission to college.',
    cover_url: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=600&fit=crop'
  },
  {
    title: 'Becoming',
    author: 'Michelle Obama',
    publication_year: 2018,
    genre: 'Biography',
    description: 'In her memoir, the former First Lady describes her journey from childhood on the South Side of Chicago to the White House.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    publication_year: 2011,
    genre: 'Biography',
    description: 'Based on more than forty interviews with Jobs over two years, this is the definitive portrait of the greatest innovator of his generation.',
    cover_url: 'https://images.unsplash.com/photo-1543002588-d4d8c8b03cf7?w=400&h=600&fit=crop'
  },
  {
    title: 'The Glass Castle',
    author: 'Jeannette Walls',
    publication_year: 2005,
    genre: 'Biography',
    description: 'A remarkable memoir of resilience and redemption, and a revelatory look into a family at once deeply dysfunctional and uniquely vibrant.',
    cover_url: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&h=600&fit=crop'
  },
  {
    title: 'Born a Crime',
    author: 'Trevor Noah',
    publication_year: 2016,
    genre: 'Biography',
    description: 'Stories from a South African childhood growing up as the son of a white father and black mother during apartheid.',
    cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'
  },
];

async function seedBooks() {
  console.log('🌱 Starting to seed books...');
  console.log(`📦 Total books to add: ${sampleBooks.length}`);
  
  try {
    // Fetch existing books to check for duplicates
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('title, author');

    if (fetchError) {
      console.error('❌ Error checking existing books:', fetchError);
      return;
    }

    console.log(`📚 Found ${existingBooks?.length || 0} existing books in database`);

    // Create a Set of existing book identifiers (title + author)
    const existingBookKeys = new Set(
      existingBooks?.map(book => `${book.title.toLowerCase()}|${book.author.toLowerCase()}`) || []
    );

    // Filter out duplicates
    const newBooks = sampleBooks.filter(book => {
      const bookKey = `${book.title.toLowerCase()}|${book.author.toLowerCase()}`;
      if (existingBookKeys.has(bookKey)) {
        console.log(`⏭️  Skipping duplicate: ${book.title} by ${book.author}`);
        return false;
      }
      return true;
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total books in seed file: ${sampleBooks.length}`);
    console.log(`   Already exist (skipped): ${sampleBooks.length - newBooks.length}`);
    console.log(`   New books to add: ${newBooks.length}`);

    if (newBooks.length === 0) {
      console.log('\n✅ All books already exist in database. No duplicates added!');
      return;
    }

    // Insert only new books
    console.log('\n📥 Inserting new books...');
    const { data, error } = await supabase
      .from('books')
      .insert(newBooks);

    if (error) {
      console.error('❌ Error seeding books:', error);
      console.error('Error details:', error.message);
      console.error('Note: You need admin permissions to add books.');
    } else {
      console.log(`\n✅ Successfully added ${newBooks.length} new books!`);
      console.log('\n📖 Books added by genre:');
      
      // Group by genre
      const booksByGenre = {};
      newBooks.forEach(book => {
        if (!booksByGenre[book.genre]) {
          booksByGenre[book.genre] = [];
        }
        booksByGenre[book.genre].push(book);
      });

      Object.keys(booksByGenre).sort().forEach(genre => {
        console.log(`\n  ${genre} (${booksByGenre[genre].length}):`);
        booksByGenre[genre].forEach(book => {
          console.log(`    - ${book.title} by ${book.author} (${book.publication_year})`);
        });
      });
    }
  } catch (err) {
    console.error('❌ Exception during seeding:', err);
  }
}

seedBooks();
