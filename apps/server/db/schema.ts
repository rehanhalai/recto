import * as crypto from 'crypto';
import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  userName: varchar('user_name', { length: 255 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  googleId: varchar('google_id', { length: 255 }),
  hashedPassword: text('hashed_password'),
  refreshToken: text('refresh_token'),
  bio: text('bio'),
  avatarImage: text('avatar_image'),
  coverImage: text('cover_image'),
  followersCount: integer('followers_count').default(0),
  followingCount: integer('following_count').default(0),
  postsCount: integer('posts_count').default(0),
  role: varchar('role', { length: 50 }).default('user'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const otps = pgTable('otps', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull(),
  hashedCode: text('hashed_code').notNull(),
  hashedPassword: text('hashed_password'), // Store pending password
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const books = pgTable('books', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  externalId: varchar('external_id', { length: 255 }).unique().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  subtitle: varchar('subtitle', { length: 255 }),
  releaseDate: varchar('release_date', { length: 50 }),
  description: text('description'),
  averageRating: integer('average_rating').default(0),
  ratingsCount: integer('ratings_count').default(0),
  coverImage: text('cover_image'),
  coverI: integer('cover_i'),
  isbn13: varchar('isbn13', { length: 13 }),
  alternativeIds: text('alternative_ids').array(),
  isStale: boolean('is_stale').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Normalized tables for arrays
export const bookAuthors = pgTable('book_authors', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  bookId: varchar('book_id', { length: 255 })
    .references(() => books.id)
    .notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
});

export const bookGenres = pgTable('book_genres', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  bookId: varchar('book_id', { length: 255 })
    .references(() => books.id)
    .notNull(),
  genreName: varchar('genre_name', { length: 255 }).notNull(),
});

export const bookLanguages = pgTable('book_languages', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  bookId: varchar('book_id', { length: 255 })
    .references(() => books.id)
    .notNull(),
  languageCode: varchar('language_code', { length: 10 }).notNull(),
});

export const bookLinks = pgTable('book_links', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  bookId: varchar('book_id', { length: 255 })
    .references(() => books.id)
    .notNull(),
  title: varchar('title', { length: 255 }),
  url: text('url').notNull(),
});

// Added Books / User-Book relationship
export const addedBooks = pgTable(
  'added_books',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: varchar('user_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    bookId: varchar('book_id', { length: 255 })
      .references(() => books.id)
      .notNull(),
    status: varchar('status', { length: 50 }).notNull().default('wishlist'), // reading, finished, wishlist
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueIdx: uniqueIndex('added_books_user_book_idx').on(t.userId, t.bookId),
  }),
);

export const blogs = pgTable('blogs', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: varchar('author_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  coverImage: text('cover_image'),
  content: text('content').notNull(),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const blogComments = pgTable('blog_comments', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  blogId: varchar('blog_id', { length: 255 })
    .references(() => blogs.id)
    .notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const followers = pgTable(
  'followers',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    followerId: varchar('follower_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    followingId: varchar('following_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueFollowerIdx: uniqueIndex('unique_follower_idx').on(
      t.followerId,
      t.followingId,
    ),
  }),
);

export const bookReviews = pgTable(
  'book_reviews',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    bookId: varchar('book_id', { length: 255 })
      .references(() => books.id)
      .notNull(),
    content: text('content'),
    rating: integer('rating').notNull(), // 0 to 5
    likesCount: integer('likes_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueUserBookIdx: uniqueIndex('book_review_user_book_idx').on(
      t.userId,
      t.bookId,
    ),
  }),
);

export const reviewLikes = pgTable(
  'review_likes',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reviewId: varchar('review_id', { length: 255 })
      .references(() => bookReviews.id)
      .notNull(),
    userId: varchar('user_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueReviewUserIdx: uniqueIndex('review_like_review_user_idx').on(
      t.reviewId,
      t.userId,
    ),
  }),
);

export const bookLists = pgTable('book_lists', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 500 }),
  isPublic: boolean('is_public').default(false),
  bookCount: integer('book_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const bookListItems = pgTable('book_list_items', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listId: varchar('list_id', { length: 255 })
    .references(() => bookLists.id)
    .notNull(),
  bookId: varchar('book_id', { length: 255 })
    .references(() => books.id)
    .notNull(),
  position: integer('position').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
});

import { relations } from 'drizzle-orm';

export const booksRelations = relations(books, ({ many }) => ({
  authors: many(bookAuthors),
  genres: many(bookGenres),
  links: many(bookLinks),
  languages: many(bookLanguages),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
}));

export const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, {
    fields: [bookGenres.bookId],
    references: [books.id],
  }),
}));

export const bookLinksRelations = relations(bookLinks, ({ one }) => ({
  book: one(books, {
    fields: [bookLinks.bookId],
    references: [books.id],
  }),
}));

export const bookLanguagesRelations = relations(bookLanguages, ({ one }) => ({
  book: one(books, {
    fields: [bookLanguages.bookId],
    references: [books.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  addedBooks: many(addedBooks),
  reviews: many(bookReviews),
  posts: many(posts),
  followers: many(followers, { relationName: 'followers' }),
  following: many(followers, { relationName: 'following' }),
  blogs: many(blogs),
  bookLists: many(bookLists),
}));

export const addedBooksRelations = relations(addedBooks, ({ one }) => ({
  user: one(users, {
    fields: [addedBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [addedBooks.bookId],
    references: [books.id],
  }),
}));

export const bookReviewsRelations = relations(bookReviews, ({ one, many }) => ({
  user: one(users, {
    fields: [bookReviews.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [bookReviews.bookId],
    references: [books.id],
  }),
  likes: many(reviewLikes),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  review: one(bookReviews, {
    fields: [reviewLikes.reviewId],
    references: [bookReviews.id],
  }),
  user: one(users, {
    fields: [reviewLikes.userId],
    references: [users.id],
  }),
}));

export const posts = pgTable('posts', {
  id: varchar('id', { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  authorId: varchar('author_id', { length: 255 })
    .references(() => users.id)
    .notNull(),
  bookId: varchar('book_id', { length: 255 }).references(() => books.id),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content').notNull(),
  coverImage: text('cover_image'),
  status: varchar('status', { length: 50 }).default('published'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const postComments = pgTable(
  'post_comments',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar('user_id', { length: 255 })
      .references(() => users.id)
      .notNull(),
    postId: varchar('post_id', { length: 255 })
      .references(() => posts.id)
      .notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    postIdIdx: index('post_comments_post_id_idx').on(t.postId),
  }),
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(postComments),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
}));

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: 'following',
  }),
  following: one(users, {
    fields: [followers.followingId],
    references: [users.id],
    relationName: 'followers',
  }),
}));

export const blogsRelations = relations(blogs, ({ one, many }) => ({
  author: one(users, {
    fields: [blogs.authorId],
    references: [users.id],
  }),
  comments: many(blogComments),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
  blog: one(blogs, {
    fields: [blogComments.blogId],
    references: [blogs.id],
  }),
}));

export const bookListsRelations = relations(bookLists, ({ one, many }) => ({
  user: one(users, {
    fields: [bookLists.userId],
    references: [users.id],
  }),
  items: many(bookListItems),
}));

export const bookListItemsRelations = relations(bookListItems, ({ one }) => ({
  list: one(bookLists, {
    fields: [bookListItems.listId],
    references: [bookLists.id],
  }),
  book: one(books, {
    fields: [bookListItems.bookId],
    references: [books.id],
  }),
}));
