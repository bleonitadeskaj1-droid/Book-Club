import { supabase } from './supabase.js';

const BOOKS_DATA = [
  {
    title: 'The Midnight Library',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.',
    cover_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80',
    status: 'to_read',
    content: `Chapter 1: The Library Between Life and Death

Nora Seed stood at the precipice of her own existence. The rain hammered against the windows of her small Bedford flat as she contemplated the choices that had brought her here. At nineteen, she had been a promising swimmer. At twenty-two, a glaciologist in the Arctic. At twenty-five, a pub philosopher. But at thirty-five, she was none of these things.

She was simply tired.

The library appeared to her not in a dream, but in that space between living and dying. Mrs. Elm, her old school librarian, stood at the entrance with a knowing smile.

"Welcome to the Midnight Library, Nora," she said. "Every book here is a different life you could have lived. A different choice you could have made."

Nora walked through endless shelves, each book spine representing a path not taken. There was the life where she became an Olympic swimmer. The life where she married Dan. The life where she stayed in the band. The life where she became a glaciologist and made groundbreaking discoveries.

"You can try as many as you wish," Mrs. Elm explained. "But remember - you must find the life you truly want to live. The one that makes you want to stay."

Nora pulled out the first book, its cover shimmering with possibility. As she opened it, the library dissolved around her, and she found herself standing in a recording studio, bass guitar in hand, her band around her, the crowd roaring beyond the stage door.

This was the life where she never quit the band.

And so her journey through infinite possibilities began...`
  },
  {
    title: 'Project Hail Mary',
    description: 'Ryland Grace wakes up on a spaceship with no memory of how he got there. His crewmates are dead. He is millions of miles from home with no way to communicate. But he has a mission - save humanity from extinction.',
    cover_url: 'https://images.unsplash.com/photo-1473929735470-5c2c6c0c3527?auto=format&fit=crop&w=400&q=80',
    status: 'to_read',
    content: `Chapter 1: Wake Up

I don't know where I am.

I try to sit up but my body won't cooperate. My arms feel like they're made of lead. I manage to open my eyes a crack. Bright light floods in. Too bright. I close them again.

Where am I?

I try to remember. Anything. My name. Where I live. What I do. Nothing comes.

Panic rises in my chest. Who am I? Why can't I remember?

I force my eyes open again. I'm in some kind of room. White walls. White ceiling. Some sort of medical equipment around me. Hospital? No. Something else.

With tremendous effort, I turn my head. There's another bed next to mine. Someone's in it. Not moving.

"Hey," I croak. My voice sounds terrible. Like I haven't used it in a long time.

No response.

I try again. "Hey! Wake up!"

Still nothing.

Something's wrong. Very wrong.

I manage to pull myself up on one elbow. My head swims but I fight through it. I have to see. I have to know.

The person in the bed next to me isn't sleeping. They're dead. And they've been dead for a while.

Horror floods through me. I look to the other side. Another bed. Another body.

What is this place?

And then I see through the window. Not a window. A viewport. And beyond it - stars. More stars than I've ever seen. And they're not moving. We're not on Earth.

We're in space.

Deep space.

Memory starts trickling back. My name is Ryland Grace. I'm a scientist. I volunteered for something. Something important.

And then it hits me like a freight train - the mission. The Hail Mary mission.

I'm humanity's last hope.

And I'm completely alone...`
  },
  {
    title: 'Atomic Habits',
    description: 'Transform your life with tiny changes that deliver remarkable results. James Clear reveals practical strategies to form good habits, break bad ones, and master the tiny behaviors that lead to success.',
    cover_url: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80',
    status: 'to_read',
    content: `Introduction: My Story

In 2012, I began publishing articles on my website jamesclear.com. I wrote about habits and human potential, and I tried to make sense of the science. The site grew slowly at first, but readers began to spread the word.

A few years later, my email list swelled to over 100,000 subscribers. I had the privilege of traveling to places like Dublin, London, and Sydney to speak about habits and behavior change. Today, over 10 million people visit my website each year, and more than 500,000 people subscribe to my weekly email newsletter.

I never expected this level of success. Looking back, I realize my writing career turned on the development of good habits.

The Fundamentals: Why Tiny Changes Make a Big Difference

It is so easy to overestimate the importance of one defining moment and underestimate the value of making small improvements on a daily basis. Too often, we convince ourselves that massive success requires massive action.

Meanwhile, improving by 1 percent isn't particularly notable—sometimes it isn't even noticeable—but it can be far more meaningful, especially in the long run. The difference a tiny improvement can make over time is astounding. Here's how the math works out: if you can get 1 percent better each day for one year, you'll end up thirty-seven times better by the time you're done. Conversely, if you get 1 percent worse each day for one year, you'll decline nearly down to zero.

What starts as a small win or a minor setback accumulates into something much more.

Chapter 1: The Surprising Power of Atomic Habits

The fate of British Cycling changed one day in 2003. The organization had endured nearly one hundred years of mediocrity. In 110 years, British riders had won just a single gold medal at the Olympic Games.

That changed when Dave Brailsford was hired as the new performance director. His approach was simple: the aggregation of marginal gains. His philosophy was that if you improved every area related to cycling by just 1 percent, those small gains would add up to remarkable improvement.

They started optimizing everything: redesigned bike seats for comfort, rubbed alcohol on tires for better grip, tested different fabrics in a wind tunnel, and even painted the inside of the team truck white to spot dust that might degrade bike performance.

Five years later, the British Cycling team dominated the road and track cycling events at the 2008 Olympic Games. That same year, Bradley Wiggins became the first British cyclist to win the Tour de France.

The aggregation of marginal gains proved to be transformative...`
  },
  {
    title: 'The Great Gatsby',
    description: 'A timeless tale of wealth, love, and the American Dream in the Jazz Age. F. Scott Fitzgerald\'s masterpiece explores the decadence and excess of 1920s New York through the mysterious Jay Gatsby.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    status: 'to_read',
    content: `Chapter 1

In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.

"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."

He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.

I graduated from New Haven in 1915, just a quarter of a century after my father, and a little later I participated in that delayed Teutonic migration known as the Great War. I enjoyed the counter-raid so thoroughly that I came back restless. Instead of being the warm centre of the world, the Middle West now seemed like the ragged edge of the universe—so I decided to go East and learn the bond business.

In the spring of twenty-two I came to New York, and rented a house in West Egg, Long Island. West Egg, the less fashionable of the two, was blessed with a view of the water and cursed with proximity to the colossal mansion of a certain Jay Gatsby.

My neighbor's house was one of those palatial affairs—a factual imitation of some Hotel de Ville in Normandy, with a tower on one side, spanking new under a thin beard of raw ivy, and a marble swimming pool, and more than forty acres of lawn and garden.

It was Gatsby's mansion.

I lived at West Egg, but I had friends at East Egg—Tom and Daisy Buchanan. Tom had been a powerful tackle on my class's football team at Yale, and he was one of those men who reach such an acute limited excellence at twenty-one that everything afterward savors of anticlimax.

When I drove over to East Egg that first evening to have dinner with them, I had no idea I was about to meet the legendary Jay Gatsby, or that my quiet summer would transform into an unforgettable journey through wealth, obsession, and tragedy...`
  },
  {
    title: 'Dune',
    description: 'Set in the distant future on the desert planet Arrakis, young Paul Atreides must navigate politics, prophecy, and betrayal to claim his destiny among the sand and spice.',
    cover_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    status: 'to_read',
    content: `Book One: DUNE

A beginning is the time for taking the most delicate care that the balances are correct. This every sister of the Bene Gesserit knows.

In the week before their departure to Arrakis, when all the final scurrying about had reached a nearly unbearable frenzy, an old crone came to visit the mother of the boy, Paul.

It was a warm night at Castle Caladan, and the ancient woman was let in by the guards who knew her as a Reverend Mother of the Bene Gesserit. Paul's mother, Lady Jessica, had been expecting her.

"Jessica," said the old woman as she entered the sitting room.

"Reverend Mother." Jessica bowed deeply. Paul stood nearby, watching.

The old woman turned her penetrating gaze on Paul. She saw a thin boy with dark hair, his mother's green eyes, features that showed the bloodlines of both Atreides and the secret Harkonnen ancestry that Jessica carried.

"Your son," said the Reverend Mother. "Fifteen years old and already he shows the training. You've taught him the Way?"

"As much as I dared, Reverend Mother."

"We shall see." She gestured at Paul with one ancient finger. "Come here, boy."

Paul approached. He had been trained since birth to observe, to control, to understand the deeper currents of politics and power. He knew this test was important.

"Put your hand in the box," commanded the Reverend Mother, producing a small cube.

Paul looked at his mother. Jessica nodded slightly, though Paul saw the fear in her eyes.

He placed his hand in the box.

"What's in there?" he asked.

"Pain," said the Reverend Mother, and pressed something cold and sharp against his neck. "Remove your hand from the box, and you die. This is the gom jabbar. The test is simple—animals pull away from pain. Humans can withstand it."

Paul felt fire race through his hand. Every nerve ending screamed. But he did not pull away...`
  },
  {
    title: 'Educated',
    description: 'Tara Westover was seventeen the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she would eventually earn a PhD from Cambridge University, transforming her life through education.',
    cover_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
    status: 'to_read',
    content: `Prologue

I'm standing on the red railway car that sits abandoned next to the barn. The wind soars, whipping my hair across my face and pushing a chill down the open neck of my shirt. The gales are strong this close to the mountain, as if the peak itself is exhaling. Down below, the valley is peaceful, undisturbed. Meanwhile our farm dances: the heavy conifer trees sway slowly, while the sagebrush and thistles quiver, bowing before every puff and pocket of air. Behind me a gentle hill slopes upward and stitches itself to the mountain base. If I look up, I can see the dark form of the Indian Princess.

The hill is paved with wild wheat. If the conifers and sagebrush are soloists, the wheat field is a corps de ballet, each stem following all the rest in bursts of movement, a million ballerinas bending, one after the other, as great gales dent their golden heads. The shape of that dent lasts only a moment, and is as close as anyone gets to seeing wind.

Turning toward our house on the hillside, I see movements of a different kind, tall shadows stiffly pushing through the currents. My brothers are awake, testing the weather. I imagine my mother at the stove, hovering over bran pancakes. I picture my father hunched by the back door, lacing his steel-toed boots and threading his callused hands into welding gloves. On the highway below, the school bus rolls past without stopping.

I am only seven, but I understand that it is this fact, more than any other, that makes my family different: we don't go to school.

Chapter 1: Choose the Good

My strongest memory is not a memory at all. It's something I imagined, then came to remember as if it had happened. The memory was formed when I was five and was prompted by a story my father told my brothers...`
  }
];

async function seedBooks() {
  console.log('Starting to seed books...');
  
  try {
    // First, let's check what books already exist
    const { data: existingBooks, error: fetchError } = await supabase
      .from('books')
      .select('title');
    
    if (fetchError) {
      console.error('Error fetching existing books:', fetchError.message);
      return;
    }

    const existingTitles = existingBooks?.map(b => b.title) || [];
    console.log('Existing books:', existingTitles);

    // Filter out books that already exist
    const booksToAdd = BOOKS_DATA.filter(book => !existingTitles.includes(book.title));
    
    if (booksToAdd.length === 0) {
      console.log('All books already exist in the database!');
      return;
    }

    console.log(`Adding ${booksToAdd.length} new books...`);

    // Insert new books
    const { data, error } = await supabase
      .from('books')
      .insert(booksToAdd);

    if (error) {
      console.error('Error inserting books:', error.message);
      console.log('Trying with minimal payload (title + status only)...');
      
      // Fallback: try with just title and status
      const minimalBooks = booksToAdd.map(b => ({ 
        title: b.title, 
        status: b.status 
      }));
      
      const { error: fallbackError } = await supabase
        .from('books')
        .insert(minimalBooks);
      
      if (fallbackError) {
        console.error('Fallback also failed:', fallbackError.message);
      } else {
        console.log('✓ Books added with minimal data. You may need to add description, cover_url, and content columns to your Supabase books table.');
      }
    } else {
      console.log('✓ Successfully added all books!');
    }

    // Show final count
    const { data: finalBooks } = await supabase
      .from('books')
      .select('title');
    
    console.log(`\nTotal books in database: ${finalBooks?.length || 0}`);
    console.log('Books:', finalBooks?.map(b => b.title).join(', '));
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the seed function
seedBooks();
