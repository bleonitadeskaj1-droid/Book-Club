-- Add more books to the books table
-- This script adds diverse books across multiple genres

INSERT INTO books (title, author, genre, description, publication_year, cover_url) VALUES
-- Romance
('The Notebook', 'Nicholas Sparks', 'Romance', 'A timeless love story spanning decades with emotions that resonate deeply.', 1996, 'https://covers.openlibrary.org/b/id/7995156-M.jpg'),
('Pride and Prejudice', 'Jane Austen', 'Romance', 'A classic romance featuring Elizabeth Bennet and Mr. Darcy in Regency England.', 1813, 'https://covers.openlibrary.org/b/id/8235688-M.jpg'),
('Outlander', 'Diana Gabaldon', 'Romance', 'Time-traveling adventure blending history, romance, and danger across centuries.', 1991, 'https://covers.openlibrary.org/b/id/7963344-M.jpg'),
('The Time Traveler''s Wife', 'Audrey Niffenegger', 'Romance', 'An extraordinary love story complicated by involuntary time travel.', 2003, 'https://covers.openlibrary.org/b/id/8045960-M.jpg'),

-- Science Fiction
('Dune', 'Frank Herbert', 'Science Fiction', 'An epic saga of politics, religion, and ecology on a desert planet.', 1965, 'https://covers.openlibrary.org/b/id/8419599-M.jpg'),
('The Martian', 'Andy Weir', 'Science Fiction', 'An astronaut stranded on Mars must use his ingenuity to survive and return home.', 2011, 'https://covers.openlibrary.org/b/id/8394088-M.jpg'),
('Foundation', 'Isaac Asimov', 'Science Fiction', 'A sweeping space opera about the fall and rise of galactic civilizations.', 1951, 'https://covers.openlibrary.org/b/id/7990905-M.jpg'),
('Neuromancer', 'William Gibson', 'Science Fiction', 'A groundbreaking cyberpunk novel featuring hackers and artificial intelligence.', 1984, 'https://covers.openlibrary.org/b/id/8343197-M.jpg'),

-- Fantasy
('The Fellowship of the Ring', 'J.R.R. Tolkien', 'Fantasy', 'The beginning of an epic quest to destroy the One Ring and save Middle-earth.', 1954, 'https://covers.openlibrary.org/b/id/8414568-M.jpg'),
('A Game of Thrones', 'George R.R. Martin', 'Fantasy', 'An intricate tale of power struggles and magic in a richly detailed world.', 1996, 'https://covers.openlibrary.org/b/id/8415036-M.jpg'),
('The Name of the Wind', 'Patrick Rothfuss', 'Fantasy', 'The story of Kvothe, a legendary figure recounting his extraordinary life.', 2007, 'https://covers.openlibrary.org/b/id/8407862-M.jpg'),
('Mistborn', 'Brandon Sanderson', 'Fantasy', 'A girl with mysterious powers becomes the key to overthrowing an empire.', 2006, 'https://covers.openlibrary.org/b/id/8398772-M.jpg'),

-- Mystery
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 'Mystery', 'A gripping mystery involving a missing woman and dark secrets in Sweden.', 2005, 'https://covers.openlibrary.org/b/id/8375821-M.jpg'),
('The Murder of Roger Ackroyd', 'Agatha Christie', 'Mystery', 'A classic whodunit featuring detective Hercule Poirot solving a complex murder.', 1926, 'https://covers.openlibrary.org/b/id/8240268-M.jpg'),
('Gone Girl', 'Gillian Flynn', 'Mystery', 'A twisting narrative about a marriage gone terribly wrong on anniversary night.', 2012, 'https://covers.openlibrary.org/b/id/8404737-M.jpg'),
('The Da Vinci Code', 'Dan Brown', 'Mystery', 'An action-packed mystery involving art, history, and hidden secrets.', 2003, 'https://covers.openlibrary.org/b/id/8362741-M.jpg'),

-- Thriller
('The Silence of the Lambs', 'Thomas Harris', 'Thriller', 'An FBI agent seeks help from a brilliant psychopath to catch a serial killer.', 1988, 'https://covers.openlibrary.org/b/id/8395156-M.jpg'),
('The Girl on the Train', 'Paula Hawkins', 'Thriller', 'A psychological thriller told through the eyes of multiple unreliable narrators.', 2015, 'https://covers.openlibrary.org/b/id/8408936-M.jpg'),
('Rebecca', 'Daphne du Maurier', 'Thriller', 'A haunting tale of suspicion and jealousy in a gothic English manor.', 1938, 'https://covers.openlibrary.org/b/id/8215631-M.jpg'),

-- Historical Fiction
('The Book Thief', 'Markus Zusak', 'Historical Fiction', 'A girl finds solace in books during Nazi Germany, narrated by Death itself.', 2005, 'https://covers.openlibrary.org/b/id/8377856-M.jpg'),
('All the Light We Cannot See', 'Anthony Doerr', 'Historical Fiction', 'Two young lives converge during World War II in occupied France.', 2014, 'https://covers.openlibrary.org/b/id/8406581-M.jpg'),
('The Nightingale', 'Kristin Hannah', 'Historical Fiction', 'Two sisters navigate survival and love during the Nazi occupation of France.', 2015, 'https://covers.openlibrary.org/b/id/8407423-M.jpg'),

-- Adventure
('The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'Adventure', 'Classic detective stories featuring the brilliant Sherlock Holmes and Dr. Watson.', 1892, 'https://covers.openlibrary.org/b/id/8221543-M.jpg'),
('Treasure Island', 'Robert Louis Stevenson', 'Adventure', 'A thrilling tale of pirates, treasure, and adventure on the high seas.', 1882, 'https://covers.openlibrary.org/b/id/8283617-M.jpg'),
('The Count of Monte Cristo', 'Alexandre Dumas', 'Adventure', 'An epic adventure of revenge, redemption, and treasure on a grand scale.', 1844, 'https://covers.openlibrary.org/b/id/8261421-M.jpg'),

-- Contemporary Fiction
('The Midnight Library', 'Matt Haig', 'Contemporary Fiction', 'A woman explores infinite parallel lives in a mysterious library between life and death.', 2020, 'https://covers.openlibrary.org/b/id/8422157-M.jpg'),
('Where the Crawdads Sing', 'Delia Owens', 'Contemporary Fiction', 'A girl grows up alone in the marshes and becomes entangled in a murder mystery.', 2018, 'https://covers.openlibrary.org/b/id/8418452-M.jpg'),
('The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Contemporary Fiction', 'A reclusive Hollywood icon reveals secrets about her glamorous but scandalous life.', 2017, 'https://covers.openlibrary.org/b/id/8416285-M.jpg'),

ON CONFLICT (title, author) DO NOTHING;
