-- Recto dev seed data
-- Scope: users, books, posts, lists, and book reviews (+ likes/comments/list items)
-- Safe to run multiple times in dev (uses deterministic IDs + ON CONFLICT guards)

BEGIN;

-- -----------------------------------------------------------------------------
-- Users
-- -----------------------------------------------------------------------------
INSERT INTO users (
  id,
  user_name,
  full_name,
  email,
  hashed_password,
  bio,
  avatar_image,
  role,
  is_verified,
  created_at,
  updated_at
)
VALUES
  (
    'usr_seed_001',
    'seed_reader_alice_2026',
    'Alice Mercer',
    'seed.alice.2026@recto.dev',
    'seed_hash_not_for_auth',
    'Loves modern literary fiction and annotated re-reads.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80',
    'user',
    true,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'usr_seed_002',
    'seed_reader_malik_2026',
    'Malik Johnson',
    'seed.malik.2026@recto.dev',
    'seed_hash_not_for_auth',
    'Sci-fi reader, notes every chapter.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80',
    'user',
    true,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'usr_seed_003',
    'seed_reader_sofia_2026',
    'Sofia Lin',
    'seed.sofia.2026@recto.dev',
    'seed_hash_not_for_auth',
    'Tracking classics and short stories this year.',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=256&q=80',
    'user',
    true,
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'usr_seed_004',
    'seed_reader_noah_2026',
    'Noah Rivera',
    'seed.noah.2026@recto.dev',
    'seed_hash_not_for_auth',
    'Big on narrative nonfiction and memoir.',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&q=80',
    'user',
    true,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'usr_seed_005',
    'seed_reader_priya_2026',
    'Priya Anand',
    'seed.priya.2026@recto.dev',
    'seed_hash_not_for_auth',
    'Fantasy maps, marginalia, and long reviews.',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&q=80',
    'user',
    true,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Genres
-- -----------------------------------------------------------------------------
INSERT INTO genres (id, name, slug, created_at)
VALUES
  ('gen_seed_fiction', 'Fiction', 'fiction', NOW() - INTERVAL '20 days'),
  ('gen_seed_scifi', 'Science Fiction', 'science-fiction', NOW() - INTERVAL '20 days'),
  ('gen_seed_fantasy', 'Fantasy', 'fantasy', NOW() - INTERVAL '20 days'),
  ('gen_seed_nonfiction', 'Non-fiction', 'non-fiction', NOW() - INTERVAL '20 days'),
  ('gen_seed_classics', 'Classics', 'classics', NOW() - INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Books
-- -----------------------------------------------------------------------------
INSERT INTO books (
  id,
  source_id,
  source,
  title,
  subtitle,
  release_date,
  description,
  page_count,
  language,
  isbn13,
  google_rating,
  google_ratings_count,
  cover_image,
  created_at,
  updated_at
)
VALUES
  (
    'book_seed_001',
    'seed-gb-001',
    'google_books',
    'The Glass Orchard',
    NULL,
    '2019',
    'A layered family novel about memory, migration, and inherited silence.',
    352,
    'en',
    '9780000000001',
    4.20,
    1200,
    'http://books.google.com/books/content?id=seed001&printsec=frontcover&img=1&zoom=1',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'book_seed_002',
    'seed-gb-002',
    'google_books',
    'Orbit of Ash',
    NULL,
    '2021',
    'A near-future colony story about labor, class, and planetary weather.',
    416,
    'en',
    '9780000000002',
    4.10,
    980,
    'http://books.google.com/books/content?id=seed002&printsec=frontcover&img=1&zoom=1',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'book_seed_003',
    'seed-gb-003',
    'google_books',
    'Maps for the Drowned',
    NULL,
    '2017',
    'An epic fantasy of cartographers, sea kingdoms, and forgotten pacts.',
    544,
    'en',
    '9780000000003',
    4.50,
    2100,
    'http://books.google.com/books/content?id=seed003&printsec=frontcover&img=1&zoom=1',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'book_seed_004',
    'seed-gb-004',
    'google_books',
    'Rereading the Archive',
    NULL,
    '2015',
    'Essays on public memory, libraries, and the politics of citation.',
    288,
    'en',
    '9780000000004',
    4.00,
    640,
    'http://books.google.com/books/content?id=seed004&printsec=frontcover&img=1&zoom=1',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'book_seed_005',
    'seed-gb-005',
    'google_books',
    'Winter Margin Notes',
    NULL,
    '2020',
    'Interlinked stories about classrooms, letters, and unresolved friendships.',
    304,
    'en',
    '9780000000005',
    3.90,
    520,
    'http://books.google.com/books/content?id=seed005&printsec=frontcover&img=1&zoom=1',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'book_seed_006',
    'seed-gb-006',
    'google_books',
    'A City of Quiet Engines',
    NULL,
    '2018',
    'A speculative mystery set in a city powered by memory markets.',
    368,
    'en',
    '9780000000006',
    4.30,
    1340,
    'http://books.google.com/books/content?id=seed006&printsec=frontcover&img=1&zoom=1',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_authors (id, book_id, author_name)
VALUES
  ('ba_seed_001', 'book_seed_001', 'Elena Ward'),
  ('ba_seed_002', 'book_seed_002', 'Jonas Pike'),
  ('ba_seed_003', 'book_seed_003', 'Mira Solberg'),
  ('ba_seed_004', 'book_seed_004', 'Harriet Cole'),
  ('ba_seed_005', 'book_seed_005', 'Nadia Iqbal'),
  ('ba_seed_006', 'book_seed_006', 'R. T. Bell')
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_genres (id, book_id, genre_id)
VALUES
  ('bg_seed_001', 'book_seed_001', 'gen_seed_fiction'),
  ('bg_seed_002', 'book_seed_002', 'gen_seed_scifi'),
  ('bg_seed_003', 'book_seed_003', 'gen_seed_fantasy'),
  ('bg_seed_004', 'book_seed_004', 'gen_seed_nonfiction'),
  ('bg_seed_005', 'book_seed_005', 'gen_seed_fiction'),
  ('bg_seed_006', 'book_seed_006', 'gen_seed_scifi'),
  ('bg_seed_007', 'book_seed_001', 'gen_seed_classics')
ON CONFLICT (book_id, genre_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Reading shelf state (added_books)
-- -----------------------------------------------------------------------------
INSERT INTO added_books (
  id,
  user_id,
  book_id,
  status,
  started_at,
  finished_at,
  created_at,
  updated_at
)
VALUES
  (
    'ab_seed_001',
    'usr_seed_001',
    'book_seed_001',
    'reading',
    NOW() - INTERVAL '6 days',
    NULL,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'ab_seed_002',
    'usr_seed_002',
    'book_seed_002',
    'finished',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'ab_seed_003',
    'usr_seed_003',
    'book_seed_003',
    'wishlist',
    NULL,
    NULL,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'ab_seed_004',
    'usr_seed_004',
    'book_seed_004',
    'reading',
    NOW() - INTERVAL '10 days',
    NULL,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'ab_seed_005',
    'usr_seed_005',
    'book_seed_005',
    'finished',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (user_id, book_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Book reviews + review likes
-- -----------------------------------------------------------------------------
INSERT INTO book_reviews (
  id,
  user_id,
  book_id,
  content,
  rating,
  contains_spoilers,
  created_at,
  updated_at
)
VALUES
  (
    'rev_seed_001',
    'usr_seed_001',
    'book_seed_002',
    'Sharp pacing and surprisingly humane worldbuilding. The middle dragged slightly.',
    4,
    false,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'rev_seed_002',
    'usr_seed_002',
    'book_seed_001',
    'Beautiful prose and difficult characters. This one stayed with me.',
    5,
    false,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'rev_seed_003',
    'usr_seed_003',
    'book_seed_003',
    'Big world, clear stakes, great ending. A little long but worth it.',
    4,
    false,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'rev_seed_004',
    'usr_seed_004',
    'book_seed_004',
    'Solid essays, strongest in chapters on public archives and metadata.',
    4,
    false,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'rev_seed_005',
    'usr_seed_005',
    'book_seed_005',
    'Tender stories and crisp dialogue. I wanted one more chapter.',
    5,
    false,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (user_id, book_id) DO NOTHING;

INSERT INTO review_likes (id, review_id, user_id, created_at)
VALUES
  ('rl_seed_001', 'rev_seed_001', 'usr_seed_003', NOW() - INTERVAL '4 days'),
  ('rl_seed_002', 'rev_seed_001', 'usr_seed_004', NOW() - INTERVAL '4 days'),
  ('rl_seed_003', 'rev_seed_002', 'usr_seed_001', NOW() - INTERVAL '3 days'),
  ('rl_seed_004', 'rev_seed_002', 'usr_seed_005', NOW() - INTERVAL '3 days'),
  ('rl_seed_005', 'rev_seed_005', 'usr_seed_002', NOW() - INTERVAL '12 hours')
ON CONFLICT (review_id, user_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Lists + list items
-- -----------------------------------------------------------------------------
INSERT INTO book_lists (
  id,
  user_id,
  name,
  description,
  is_public,
  created_at,
  updated_at
)
VALUES
  (
    'list_seed_001',
    'usr_seed_001',
    'Rainy Weekend Reads',
    'Quiet, immersive novels for long afternoons.',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'list_seed_002',
    'usr_seed_002',
    'Speculative Starter Pack',
    'Gateway books for readers new to speculative fiction.',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'list_seed_003',
    'usr_seed_004',
    'Non-fiction That Reads Like Story',
    'Narrative nonfiction with strong voice.',
    true,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '1 day'
  ),
  (
    'list_seed_004',
    'usr_seed_005',
    'Private TBR for Spring',
    'Personal shortlist for next month.',
    false,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO book_list_items (id, list_id, book_id, added_at)
VALUES
  ('bli_seed_001', 'list_seed_001', 'book_seed_001', NOW() - INTERVAL '5 days'),
  ('bli_seed_002', 'list_seed_001', 'book_seed_005', NOW() - INTERVAL '4 days'),
  ('bli_seed_003', 'list_seed_002', 'book_seed_002', NOW() - INTERVAL '5 days'),
  ('bli_seed_004', 'list_seed_002', 'book_seed_006', NOW() - INTERVAL '4 days'),
  ('bli_seed_005', 'list_seed_002', 'book_seed_003', NOW() - INTERVAL '3 days'),
  ('bli_seed_006', 'list_seed_003', 'book_seed_004', NOW() - INTERVAL '4 days'),
  ('bli_seed_007', 'list_seed_003', 'book_seed_001', NOW() - INTERVAL '2 days'),
  ('bli_seed_008', 'list_seed_004', 'book_seed_003', NOW() - INTERVAL '2 days')
ON CONFLICT (list_id, book_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Posts + likes + comments (+ comment likes)
-- -----------------------------------------------------------------------------
INSERT INTO posts (
  id,
  author_id,
  book_id,
  content,
  image,
  created_at,
  updated_at
)
VALUES
  (
    'post_seed_001',
    'usr_seed_001',
    'book_seed_001',
    'Finally started this and the opening chapter is quietly devastating.',
    NULL,
    NOW() - INTERVAL '36 hours',
    NOW() - INTERVAL '36 hours'
  ),
  (
    'post_seed_002',
    'usr_seed_002',
    'book_seed_002',
    'Orbit of Ash nails atmosphere. The station setting feels lived in.',
    NULL,
    NOW() - INTERVAL '30 hours',
    NOW() - INTERVAL '30 hours'
  ),
  (
    'post_seed_003',
    'usr_seed_003',
    'book_seed_003',
    'Question for fantasy readers: do you prefer maps at the front or back?',
    NULL,
    NOW() - INTERVAL '24 hours',
    NOW() - INTERVAL '24 hours'
  ),
  (
    'post_seed_004',
    'usr_seed_004',
    NULL,
    'Reading sprint tonight: 40 pages before bed. No doomscrolling.',
    NULL,
    NOW() - INTERVAL '20 hours',
    NOW() - INTERVAL '20 hours'
  ),
  (
    'post_seed_005',
    'usr_seed_005',
    'book_seed_005',
    'This short story collection is all killer, no filler.',
    NULL,
    NOW() - INTERVAL '15 hours',
    NOW() - INTERVAL '15 hours'
  ),
  (
    'post_seed_006',
    'usr_seed_001',
    'book_seed_006',
    'The premise is wild and somehow still emotionally grounded.',
    NULL,
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO post_likes (id, user_id, post_id, created_at)
VALUES
  ('pl_seed_001', 'usr_seed_002', 'post_seed_001', NOW() - INTERVAL '35 hours'),
  ('pl_seed_002', 'usr_seed_003', 'post_seed_001', NOW() - INTERVAL '34 hours'),
  ('pl_seed_003', 'usr_seed_004', 'post_seed_002', NOW() - INTERVAL '29 hours'),
  ('pl_seed_004', 'usr_seed_005', 'post_seed_002', NOW() - INTERVAL '29 hours'),
  ('pl_seed_005', 'usr_seed_001', 'post_seed_003', NOW() - INTERVAL '23 hours'),
  ('pl_seed_006', 'usr_seed_002', 'post_seed_003', NOW() - INTERVAL '22 hours'),
  ('pl_seed_007', 'usr_seed_003', 'post_seed_004', NOW() - INTERVAL '19 hours'),
  ('pl_seed_008', 'usr_seed_004', 'post_seed_005', NOW() - INTERVAL '14 hours'),
  ('pl_seed_009', 'usr_seed_005', 'post_seed_006', NOW() - INTERVAL '7 hours')
ON CONFLICT (user_id, post_id) DO NOTHING;

INSERT INTO post_comments (
  id,
  user_id,
  post_id,
  parent_id,
  content,
  created_at,
  updated_at
)
VALUES
  (
    'pc_seed_001',
    'usr_seed_003',
    'post_seed_001',
    NULL,
    'That first chapter hook is incredible. Keep going.',
    NOW() - INTERVAL '34 hours',
    NOW() - INTERVAL '34 hours'
  ),
  (
    'pc_seed_002',
    'usr_seed_001',
    'post_seed_001',
    'pc_seed_001',
    'Right? I expected a slow open and got punched instead.',
    NOW() - INTERVAL '33 hours',
    NOW() - INTERVAL '33 hours'
  ),
  (
    'pc_seed_003',
    'usr_seed_005',
    'post_seed_002',
    NULL,
    'Adding this to my TBR today.',
    NOW() - INTERVAL '28 hours',
    NOW() - INTERVAL '28 hours'
  ),
  (
    'pc_seed_004',
    'usr_seed_004',
    'post_seed_003',
    NULL,
    'Front map always. I keep flipping back anyway.',
    NOW() - INTERVAL '21 hours',
    NOW() - INTERVAL '21 hours'
  ),
  (
    'pc_seed_005',
    'usr_seed_002',
    'post_seed_004',
    NULL,
    'No doomscrolling is a strong policy.',
    NOW() - INTERVAL '18 hours',
    NOW() - INTERVAL '18 hours'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO post_comment_likes (id, user_id, comment_id, created_at)
VALUES
  ('pcl_seed_001', 'usr_seed_001', 'pc_seed_001', NOW() - INTERVAL '33 hours'),
  ('pcl_seed_002', 'usr_seed_004', 'pc_seed_003', NOW() - INTERVAL '27 hours'),
  ('pcl_seed_003', 'usr_seed_003', 'pc_seed_005', NOW() - INTERVAL '17 hours')
ON CONFLICT (user_id, comment_id) DO NOTHING;

COMMIT;

-- Quick sanity checks you can run after seeding:
-- SELECT COUNT(*) FROM posts;
-- SELECT COUNT(*) FROM book_lists;
-- SELECT COUNT(*) FROM book_reviews;
-- SELECT id, likes_count, comments_count FROM posts ORDER BY created_at DESC;
-- SELECT id, book_count FROM book_lists ORDER BY created_at DESC;
-- SELECT id, average_rating, ratings_count FROM books ORDER BY created_at DESC;
