import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase';
import AdminSidebar from '../components/AdminSidebar';

const FULL_BOOKS = [
  {
    title: 'Pride and Prejudice',
    description: 'Jane Austen\'s masterpiece about Elizabeth Bennet navigating issues of manners, morality, education, and marriage in the society of 19th-century England.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    content: `Chapter 1

It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.

However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.

"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"

Mr. Bennet replied that he had not.

"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."

Mr. Bennet made no answer.

"Do you not want to know who has taken it?" cried his wife impatiently.

"You want to tell me, and I have no objection to hearing it."

This was invitation enough.

"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week."

"What is his name?"

"Bingley."

"Is he married or single?"

"Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!"

"How so? How can it affect them?"

"My dear Mr. Bennet," replied his wife, "how can you be so tiresome! You must know that I am thinking of his marrying one of them."

"Is that his design in settling here?"

"Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes."

"I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley may like you the best of the party."

Chapter 2

Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it...`
  },
  {
    title: 'The Adventures of Sherlock Holmes',
    description: 'A collection of twelve short stories featuring the legendary detective Sherlock Holmes and his companion Dr. Watson solving mysteries across Victorian London.',
    cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80',
    content: `A Scandal in Bohemia

To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.

He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer.

They were admirable things for the observer—excellent for drawing the veil from men's motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.

I had seen little of Holmes lately. My marriage had drifted us away from each other. My own complete happiness, and the home-centred interests which rise up around the man who first finds himself master of his own establishment, were sufficient to absorb all my attention, while Holmes, who loathed every form of society with his whole Bohemian soul, remained in our lodgings in Baker Street, buried among his old books, and alternating from week to week between cocaine and ambition, the drowsiness of the drug, and the fierce energy of his own keen nature.

One night—it was on the twentieth of March, 1888—I was returning from a journey to a patient (for I had now returned to civil practice), when my way led me through Baker Street. As I passed the well-remembered door, which must always be associated in my mind with my wooing, and with the dark incidents of the Study in Scarlet, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers...`
  },
  {
    title: 'Frankenstein',
    description: 'Mary Shelley\'s gothic masterpiece about Victor Frankenstein, a scientist who creates a sapient creature in an unorthodox scientific experiment.',
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    content: `Letter 1

St. Petersburgh, Dec. 11th, 17—

TO Mrs. Saville, England

You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.

I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes.

Inspirited by this wind of promise, my daydreams become more fervent and vivid. I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight. There, Margaret, the sun is forever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour.

There—for with your leave, my sister, I will put some trust in preceding navigators—there snow and frost are banished; and, sailing over a calm sea, we may be wafted to a land surpassing in wonders and in beauty every region hitherto discovered on the habitable globe.

What may not be expected in a country of eternal light? I may there discover the wondrous power which attracts the needle and may regulate a thousand celestial observations that require only this voyage to render their seeming eccentricities consistent forever.

I shall satiate my ardent curiosity with the sight of a part of the world never before visited, and may tread a land never before imprinted by the foot of man. These are my enticements, and they are sufficient to conquer all fear of danger or death and to induce me to commence this laborious voyage with the joy a child feels when he embarks in a little boat...`
  },
  {
    title: 'Moby-Dick',
    description: 'Herman Melville\'s epic tale of Captain Ahab\'s obsessive quest for revenge against Moby Dick, the white whale that destroyed his ship and took his leg.',
    cover_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=400&q=80',
    content: `Chapter 1: Loomings

Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.

Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off—then, I account it high time to get to sea as soon as I can.

This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.

There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.

Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall, northward. What do you see?—Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries...`
  },
  {
    title: 'The Great Gatsby',
    description: 'A timeless tale of wealth, love, and the American Dream in the Jazz Age. Fitzgerald\'s masterpiece explores the decadence of 1920s New York through the mysterious Jay Gatsby.',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80',
    content: `Chapter 1

In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.

"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."

He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.

I graduated from New Haven in 1915, just a quarter of a century after my father, and a little later I participated in that delayed Teutonic migration known as the Great War. I enjoyed the counter-raid so thoroughly that I came back restless. Instead of being the warm centre of the world, the Middle West now seemed like the ragged edge of the universe—so I decided to go East and learn the bond business.

In the spring of twenty-two I came to New York, and rented a house in West Egg, Long Island. West Egg, the less fashionable of the two, was blessed with a view of the water and cursed with proximity to the colossal mansion of a certain Jay Gatsby.

My neighbor's house was one of those palatial affairs—a factual imitation of some Hotel de Ville in Normandy, with a tower on one side, spanking new under a thin beard of raw ivy, and a marble swimming pool, and more than forty acres of lawn and garden.

It was Gatsby's mansion.

I lived at West Egg, but I had friends at East Egg—Tom and Daisy Buchanan. Tom had been a powerful tackle on my class's football team at Yale, and he was one of those men who reach such an acute limited excellence at twenty-one that everything afterward savors of anticlimax.

When I drove over to East Egg that first evening to have dinner with them, I had no idea I was about to meet the legendary Jay Gatsby, or that my quiet summer would transform into an unforgettable journey through wealth, obsession, and tragedy...`
  },
  {
    title: 'A Tale of Two Cities',
    description: 'Charles Dickens\' historical novel set in London and Paris before and during the French Revolution, depicting the plight of the French peasantry.',
    cover_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    content: `Book the First—Recalled to Life
Chapter I: The Period

It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way—in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.

There were a king with a large jaw and a queen with a plain face, on the throne of England; there were a king with a large jaw and a queen with a fair face, on the throne of France. In both countries it was clearer than crystal to the lords of the State preserves of loaves and fishes, that things in general were settled for ever.

It was the year of Our Lord one thousand seven hundred and seventy-five. Spiritual revelations were conceded to England at that favoured period, as at this. Mrs. Southcott had recently attained her five-and-twentieth blessed birthday, of whom a prophetic private in the Life Guards had heralded the sublime appearance by announcing that arrangements were made for the swallowing up of London and Westminster...`
  },
  {
    title: 'The Adventures of Tom Sawyer',
    description: 'Mark Twain\'s beloved tale of a mischievous boy growing up along the Mississippi River, full of adventure, imagination, and childhood wonder.',
    cover_url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=400&q=80',
    content: `CHAPTER I

"TOM!"

No answer.

"TOM!"

No answer.

"What's gone with that boy, I wonder? You TOM!"

No answer.

The old lady pulled her spectacles down and looked over them about the room; then she put them up and looked out under them. She seldom or never looked THROUGH them for so small a thing as a boy; they were her state pair, the pride of her heart, and were built for "style," not service—she could have seen through a pair of stove-lids just as well. She looked perplexed for a moment, and then said, not fiercely, but still loud enough for the furniture to hear:

"Well, I lay if I get hold of you I'll—"

She did not finish, for by this time she was bending down and punching under the bed with the broom, and so she needed breath to punctuate the punches with. She resurrected nothing but the cat.

"I never did see the beat of that boy!"

She went to the open door and stood in it and looked out among the tomato vines and "jimpson" weeds that constituted the garden. No Tom. So she lifted up her voice at an angle calculated for distance and shouted:

"Y-o-u-u TOM!"

There was a slight noise behind her and she turned just in time to seize a small boy by the slack of his roundabout and arrest his flight.

"There! I might 'a' thought of that closet. What you been doing in there?"

"Nothing."

"Nothing! Look at your hands. And look at your mouth. What IS that truck?"

"I don't know, aunt."

"Well, I know. It's jam—that's what it is. Forty times I've said if you didn't let that jam alone I'd skin you. Hand me that switch."

The switch hovered in the air—the peril was desperate—

"My! Look behind you, aunt!"

The old lady whirled round, and snatched her skirts out of danger. The lad fled on the instant, scrambled up the high board-fence, and disappeared over it...`
  },
  {
    title: 'Dracula',
    description: 'Bram Stoker\'s gothic horror masterpiece about Count Dracula\'s attempt to move from Transylvania to England, and the battle to stop him.',
    cover_url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=400&q=80',
    content: `CHAPTER I

JONATHAN HARKER'S JOURNAL

(Kept in shorthand.)

3 May. Bistritz.—Left Munich at 8:35 P.M., on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late. Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets. I feared to go very far from the station, as we had arrived late and would start as near the correct time as possible.

The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.

We left in pretty good time, and came after nightfall to Klausenburgh. Here I stopped for the night at the Hotel Royale. I had for dinner, or rather supper, a chicken done up some way with red pepper, which was very good but thirsty. (Mem., get recipe for Mina.) I asked the waiter, and he said it was called "paprika hendl," and that, as it was a national dish, I should be able to get it anywhere along the Carpathians.

I found my smattering of German very useful here, indeed, I don't know how I should be able to get on without it.

Having had some time at my disposal when in London, I had visited the British Museum, and made search among the books and maps in the library regarding Transylvania; it had struck me that some foreknowledge of the country could hardly fail to have some importance in dealing with a nobleman of that country.

I find that the district he named is in the extreme east of the country, just on the borders of three states, Transylvania, Moldavia, and Bukovina, in the midst of the Carpathian mountains; one of the wildest and least known portions of Europe...`
  },
  {
    title: 'Alice\'s Adventures in Wonderland',
    description: 'Lewis Carroll\'s whimsical tale of a girl who falls down a rabbit hole into a fantasy world populated by peculiar creatures.',
    cover_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    content: `CHAPTER I. Down the Rabbit-Hole

Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering how in the world she was to get out again.

The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well...`
  },
  {
    title: 'The Picture of Dorian Gray',
    description: 'Oscar Wilde\'s philosophical novel about a young man whose portrait ages while he remains eternally youthful, exploring themes of vanity and moral corruption.',
    cover_url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80',
    content: `Chapter I

The studio was filled with the rich odour of roses, and when the light summer wind stirred amidst the trees of the garden, there came through the open door the heavy scent of the lilac, or the more delicate perfume of the pink-flowering thorn.

From the corner of the divan of Persian saddle-bags on which he was lying, smoking, as was his custom, innumerable cigarettes, Lord Henry Wotton could just catch the gleam of the honey-sweet and honey-coloured blossoms of a laburnum, whose tremulous branches seemed hardly able to bear the burden of a beauty so flamelike as theirs; and now and then the fantastic shadows of birds in flight flitted across the long tussore-silk curtains that were stretched in front of the huge window, producing a kind of momentary Japanese effect, and making him think of those pallid, jade-faced painters of Tokyo who, through the medium of an art that is necessarily immobile, seek to convey the sense of swiftness and motion.

The sullen murmur of the bees shouldering their way through the long unmown grass, or circling with monotonous insistence round the dusty gilt horns of the straggling woodbine, seemed to make the stillness more oppressive. The dim roar of London was like the bourdon note of a distant organ.

In the centre of the room, clamped to an upright easel, stood the full-length portrait of a young man of extraordinary personal beauty, and in front of it, some little distance away, was sitting the artist himself, Basil Hallward, whose sudden disappearance some years ago caused, at the time, such public excitement and gave rise to so many strange conjectures...`
  },
  {
    title: 'The Jungle Book',
    description: 'Rudyard Kipling\'s collection of stories about Mowgli, a boy raised by wolves in the Indian jungle, and his adventures with animal friends.',
    cover_url: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=400&q=80',
    content: `MOWGLI'S BROTHERS

Now Chil the Kite brings home the night
That Mang the Bat sets free—
The herds are shut in byre and hut
For loosed till dawn are we.
This is the hour of pride and power,
Talon and tush and claw.
Oh, hear the call!—Good hunting all
That keep the Jungle Law!

It was seven o'clock of a very warm evening in the Seeonee hills when Father Wolf woke up from his day's rest, scratched himself, yawned, and spread out his paws one after the other to get rid of the sleepy feeling in their tips. Mother Wolf lay with her big gray nose dropped across her four tumbling, squealing cubs, and the moon shone into the mouth of the cave where they all lived. "Augrh!" said Father Wolf. "It is time to hunt again." He was going to spring down hill when a little shadow with a bushy tail crossed the threshold and whined: "Good luck go with you, O Chief of the Wolves. And good luck and strong white teeth go with noble children that they may never forget the hungry in this world."

It was the jackal—Tabaqui, the Dish-licker—and the wolves of India despise Tabaqui because he runs about making mischief, and telling tales, and eating rags and pieces of leather from the village rubbish-heaps. But they are afraid of him too, because Tabaqui, more than anyone else in the jungle, is apt to go mad, and then he forgets that he was ever afraid of anyone, and runs through the forest biting everything in his way...`
  }
];

const AI_BOOKS = FULL_BOOKS.map(b => ({ title: b.title, description: b.description, cover_url: b.cover_url, content: b.content.substring(0, 100) + '...' }));

export default function AdminScreen({ userId, logout }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [editingId, setEditingId] = useState(null);
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSidebar, setShowSidebar] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const defaultStatus = 'to_read';

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
    loadProfile();
    // Don't auto-create profile for hardcoded admin since it can't be stored in profiles table
    if (userId !== 'admin@gmail.com') {
      createProfileIfNotExists();
    }
  }, []);

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
      console.log('📊 User count:', data?.length || 0);
      data?.forEach((user, idx) => {
        console.log(`👤 User ${idx + 1}: ID=${user.id}, Email=${user.email}, Role=${user.role}`);
      });
      let usersList = data || [];
      
      // Add hardcoded admin user if not already in the list
      const adminExists = usersList.some(user => user.email === 'admin@gmail.com');
      if (!adminExists && userId === 'admin@gmail.com') {
        usersList = [{
          id: 'admin-user-id',
          email: 'admin@gmail.com',
          role: 'admin'
        }, ...usersList];
      }
      
      if (usersList.length === 0) {
        console.log('⚠️ No users in profiles table');
        setUsers([]);
        setError('');
        return;
      }

      const mappedUsers = usersList.map((user, idx) => {
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
    console.log('🗑️ Attempting to delete user with ID:', userId);
    if (!userId) {
      console.log('❌ No userId provided');
      return;
    }

    // Prevent deleting the hardcoded admin user
    if (userId === 'admin-user-id') {
      console.log('❌ Cannot delete hardcoded admin user');
      setError('Cannot delete the admin user');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Use Alert for React Native instead of browser confirm
    Alert.alert(
      'Confirm Delete',
      `Delete user ${userId}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => performDelete(userId) }
      ]
    );
  };

  const performDelete = async (userId) => {
    console.log('🗑️ Starting delete process for user ID:', userId);

    try {
      console.log('🔄 Attempting to delete from database...');
      const { error } = await supabase.from('profiles').delete().eq('id', userId);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setError(`Failed to delete user: ${error.message}`);
        return;
      }

      console.log('✅ Database delete successful, refreshing users list...');
      setError('✓ User deleted successfully');
      await fetchUsers(); // Wait for fetch to complete
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('❌ Delete exception:', err);
      console.error('Exception details:', err);
      setError('Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const loadProfile = async () => {
    // Skip Supabase profile calls to avoid RLS recursion issues; just set display values
    setProfileName('admin');
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
      const newRole = userId === 'admin@gmail.com' ? 'admin' : 'user';

      // For hardcoded admin, use a fixed ID since there's no real auth user
      const profileData = userId === 'admin@gmail.com' 
        ? { email: userId, role: newRole, id: 'admin-user-id' }
        : { email: userId, role: newRole };

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
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

  const toggleFavorite = async (bookId, currentFavorite) => {
    const next = !currentFavorite;
    await supabase.from('books').update({ favorite: next }).eq('id', bookId);
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

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase.from('books').select('*').order('title', { ascending: true });
    if (err) setError(err.message);
    setBooks(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCoverUrl('');
    setContent('');
    setStatus(defaultStatus);
  };

  const generateAI = () => {
    const pick = AI_BOOKS[Math.floor(Math.random() * AI_BOOKS.length)];
    setTitle(pick.title);
    setDescription(pick.description);
    setCoverUrl(pick.cover_url);
    setContent(pick.content || '');
  };

  const addAllBooks = async () => {
    setSaving(true);
    setError('');
    
    const existingTitles = books.map(b => b.title);
    const booksToAdd = FULL_BOOKS.filter(b => !existingTitles.includes(b.title))
      .map(b => ({ ...b, status: defaultStatus }));
    
    if (booksToAdd.length === 0) {
      setError('✓ All 6 books already in library!');
      setSaving(false);
      return;
    }

    console.log(`Attempting to add ${booksToAdd.length} books with full content...`);
    const { data, error: err } = await supabase.from('books').insert(booksToAdd);
    
    if (err) {
      console.log('Full insert failed:', err.message);
      setError(`⚠️ Database error: ${err.message}. Your Supabase books table may be missing columns: content, description, cover_url. Add them in Supabase SQL Editor.`);
      
      // Try minimal payload as fallback
      console.log('Trying minimal payload...');
      const minimal = booksToAdd.map(b => ({ title: b.title, status: b.status }));
      const { error: fallbackErr } = await supabase.from('books').insert(minimal);
      if (fallbackErr) {
        setError(`❌ Failed: ${fallbackErr.message}`);
      } else {
        setError('⚠️ Books added with title only. Add columns (content, description, cover_url) to your Supabase books table for full content.');
      }
    } else {
      setError(`✓ Successfully added ${booksToAdd.length} books with full readable content!`);
    }
    
    setSaving(false);
    fetchBooks();
  };

  const addSampleBook = async () => {
    if (books.some(b => b.title === FULL_BOOKS[0].title)) {
      setError('Sample book already exists.');
      return;
    }
    setSaving(true);
    setError('');
    const sample = { ...FULL_BOOKS[0], status: defaultStatus };
    const { error: err } = await supabase.from('books').insert([sample]);
    if (err) {
      setError(`Cannot add sample: ${err.message}`);
    } else {
      setError('✓ Sample book added with full content.');
      fetchBooks();
    }
    setSaving(false);
  };

  const importPublicDomainBook = async () => {
    setSaving(true);
    setError('');
    try {
      const url = 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt'; // Pride and Prejudice (public domain)
      const resp = await fetch(url);
      const text = await resp.text();
      const title = 'Pride and Prejudice';

      if (books.some(b => b.title === title)) {
        setError('Pride and Prejudice already exists.');
        setSaving(false);
        return;
      }

      const payload = {
        title,
        description: 'Public domain classic by Jane Austen.',
        cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80',
        content: text,
        status: defaultStatus
      };

      const { error: err } = await supabase.from('books').insert([payload]);
      if (err) {
        setError(`Import failed: ${err.message}. Ensure columns content/description/cover_url exist.`);
      } else {
        setError('✓ Imported Pride and Prejudice with full text.');
        fetchBooks();
      }
    } catch (e) {
      setError(`Import failed: ${e.message}`);
    }
    setSaving(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError('');
    const payload = {
      title: title.trim(),
      description: description.trim(),
      cover_url: coverUrl.trim() || null,
      content: content.trim() || null,
      status
    };

    let err;
    if (editingId) {
      const { error: updateError } = await supabase.from('books').update(payload).eq('id', editingId);
      err = updateError;
    } else {
      const { error: insertError } = await supabase.from('books').insert([payload]);
      err = insertError;
    }

    // If schema lacks new columns, retry with minimal payload.
    if (err) {
      const minimal = { title: payload.title, status: payload.status };
      if (editingId) {
        const { error: updateFallback } = await supabase.from('books').update(minimal).eq('id', editingId);
        err = updateFallback;
      } else {
        const { error: insertFallback } = await supabase.from('books').insert([minimal]);
        err = insertFallback;
      }
    }

    if (err) {
      setError(err.message);
    } else {
      resetForm();
      fetchBooks();
    }
    setSaving(false);
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setTitle(book.title || '');
    setDescription(book.description || '');
    setCoverUrl(book.cover_url || '');
    setContent(book.content || '');
    setStatus(book.status || defaultStatus);
  };

  const handleDelete = async (id) => {
    setSaving(true);
    setError('');
    const { error: delError } = await supabase.from('books').delete().eq('id', id);
    if (delError) setError(delError.message);
    setSaving(false);
    if (editingId === id) resetForm();
    fetchBooks();
  };

  const BookRow = ({ item }) => (
    <View style={styles.listCard}>
      <View style={styles.rowStart}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.coverPlaceholderText}>{(item.title || 'B').slice(0, 1)}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity onPress={() => toggleFavorite(item.id, item.favorite)}>
              <Text style={{ fontSize: 20, marginLeft: 8 }}>{item.favorite ? '⭐' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.statusText}>{item.status}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description || 'No description'}</Text>
          <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginRight: 16 }}>
              <Text style={styles.link}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.danger}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#0f172a", "#111827", "#0b1021"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.header}>Admin Console</Text>
            <Text style={styles.subheader}>Signed in as {userId}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 0 }}>
            <TouchableOpacity 
              style={[styles.logout, { marginRight: 8, minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }]} 
              onPress={() => setShowSidebar(true)}
            >
              <Text style={styles.logoutText}>☰</Text>
            </TouchableOpacity>
            {logout ? (
              <TouchableOpacity 
                style={[styles.logout, { minHeight: 44, justifyContent: 'center' }]} 
                onPress={logout}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{editingId ? 'Edit book' : 'Add book'}</Text>
          <TextInput
            placeholder="Title"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Short description"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 80 }]}
            multiline
          />
          <TextInput
            placeholder="Cover image URL"
            placeholderTextColor="#94a3b8"
            value={coverUrl}
            onChangeText={setCoverUrl}
            style={styles.input}
          />
          <TextInput
            placeholder="Book content (page 1)"
            placeholderTextColor="#94a3b8"
            value={content}
            onChangeText={setContent}
            style={[styles.input, { height: 100 }]}
            multiline
          />

          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
              <Text style={styles.primaryButtonText}>{editingId ? 'Update' : 'Add'} Book</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={generateAI} disabled={saving}>
              <Text style={styles.secondaryButtonText}>Generate with AI</Text>
            </TouchableOpacity>
          </View>

          {editingId ? (
            <TouchableOpacity onPress={resetForm} style={styles.clearLink}>
              <Text style={styles.linkMuted}>Cancel edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={[styles.card, { padding: 12 }]}> 
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Library ({books.length})</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={addAllBooks} disabled={saving}>
                <Text style={[styles.link, { marginRight: 12 }]}>+ Add All Books</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={fetchBooks}>
                <Text style={styles.link}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#67e8f9" style={{ marginVertical: 20 }} />
          ) : books.length === 0 ? (
            <Text style={styles.empty}>No books yet. Generate one to get started.</Text>
          ) : (
            books.map(book => <BookRow key={book.id} item={book} />)
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
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
  adminButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.6)'
  },
  adminButtonText: {
    color: '#e0f2fe',
    fontWeight: '700',
    fontSize: 15
  },
  screen: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 48 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { color: '#e0f2fe', fontSize: 26, fontWeight: '800' },
  subheader: { color: '#94a3b8', marginTop: 2 },
  logout: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1
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
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  primaryButtonText: { color: '#0b1021', fontWeight: '800', textAlign: 'center' },
  secondaryButton: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderColor: 'rgba(14,165,233,0.6)',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12
  },
  secondaryButtonText: { color: '#67e8f9', fontWeight: '700' },
  clearLink: { marginTop: 6 },
  linkMuted: { color: '#94a3b8' },
  listCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  rowStart: { flexDirection: 'row', alignItems: 'flex-start' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#e2e8f0', fontWeight: '700', flex: 1, marginRight: 8 },
  statusText: { color: '#cbd5e1', fontSize: 12, textTransform: 'uppercase' },
  desc: { color: '#94a3b8', marginTop: 4 },
  link: { color: '#67e8f9', fontWeight: '700' },
  danger: { color: '#f87171', fontWeight: '700' },
  empty: { color: '#94a3b8', textAlign: 'center', marginVertical: 10 },
  error: { color: '#f87171', marginTop: 10 },
  settingLabel: { color: '#94a3b8', marginBottom: 4 },
  settingValue: { color: '#e2e8f0', fontWeight: '700', marginBottom: 8 },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  statusChipActive: {
    borderColor: '#0ea5e9',
    backgroundColor: 'rgba(14,165,233,0.18)'
  },
  statusChipText: { color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', fontSize: 12 },
  statusChipTextActive: { color: '#0ea5e9' },
  cover: {
    width: 70,
    height: 94,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1
  },
  coverPlaceholderText: { color: '#e2e8f0', fontSize: 20, fontWeight: '800' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  sidebarContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    flex: 1
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e0f2fe'
  },
  sidebarCloseButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  sidebarClose: {
    fontSize: 28,
    color: '#cbd5e1',
    fontWeight: '700'
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(14,165,233,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0ea5e9',
    marginBottom: 12
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#0ea5e9'
  },
  avatarButtons: {
    flexDirection: 'row',
    marginBottom: 8
  },
  avatarActionButton: {
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderColor: 'rgba(14,165,233,0.6)',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 10
  },
  avatarActionText: {
    color: '#67e8f9',
    fontWeight: '700',
    fontSize: 13
  },
  profileUsername: {
    color: '#94a3b8',
    marginTop: 4
  },
  profileForm: {
    padding: 20
  },
  profileLabel: {
    color: '#cbd5e1',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12
  },
  profileInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  profileSaveButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  profileSaveText: {
    color: '#0b1021',
    fontWeight: '800',
    fontSize: 16
  },
  profileStats: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  statsTitle: {
    color: '#e0f2fe',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8
  },
  statsText: {
    color: '#94a3b8',
    marginVertical: 2
  },
  sidebarLogout: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)'
  },
  sidebarLogoutText: {
    color: '#f87171',
    fontWeight: '700'
  },
  userManagementButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.6)'
  },
  userManagementButtonText: {
    color: '#67e8f9',
    fontWeight: '700',
    fontSize: 15
  },
  userManagementSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  userManagementTitle: {
    color: '#e0f2fe',
    fontWeight: '700',
    fontSize: 15
  },
  emptyUsers: {
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 10
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  userAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14,165,233,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#0ea5e9'
  },
  userAvatarSmallImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  },
  userAvatarSmallText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0ea5e9'
  },
  userName: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 14
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2
  },
  deleteUserButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)'
  },
  deleteUserText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 12
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  sidebarContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%'
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  sidebarTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700'
  },
  sidebarCloseButton: {
    padding: 8
  },
  sidebarClose: {
    color: '#94a3b8',
    fontSize: 24,
    fontWeight: '300'
  },
  sidebarSection: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20
  },
  sidebarMenuText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600'
  },
  sidebarMenuArrow: {
    color: '#94a3b8',
    fontSize: 14
  },
  sidebarSubContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  sidebarLogout: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.4)',
    borderWidth: 1,
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  sidebarLogoutText: {
    color: '#f87171',
    fontWeight: '700',
    fontSize: 16
  }
});

