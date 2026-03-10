import * as crypto from "crypto";
import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

export const addedBooks = pgTable(
  "added_books",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id)
      .notNull(),
    status: varchar("status", { length: 50 }).notNull().default("wishlist"), // reading, finished, wishlist
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueIdx: uniqueIndex("added_books_user_book_idx").on(t.userId, t.bookId),
  }),
);

export const bookReviews = pgTable(
  "book_reviews",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id)
      .notNull(),
    content: text("content"),
    rating: integer("rating").notNull(), // 0 to 5
    likesCount: integer("likes_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueUserBookIdx: uniqueIndex("book_review_user_book_idx").on(
      t.userId,
      t.bookId,
    ),
  }),
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reviewId: varchar("review_id", { length: 255 })
      .references(() => bookReviews.id)
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    uniqueReviewUserIdx: uniqueIndex("review_like_review_user_idx").on(
      t.reviewId,
      t.userId,
    ),
  }),
);

export const bookLists = pgTable("book_lists", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  isPublic: boolean("is_public").default(false),
  bookCount: integer("book_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookListItems = pgTable("book_list_items", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listId: varchar("list_id", { length: 255 })
    .references(() => bookLists.id)
    .notNull(),
  bookId: varchar("book_id", { length: 255 })
    .references(() => books.id)
    .notNull(),
  position: integer("position").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).defaultNow(),
});

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
