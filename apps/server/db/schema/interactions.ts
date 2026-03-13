import * as crypto from "crypto";
import {
  pgTable,
  pgEnum,
  varchar,
  text,
  boolean,
  smallint,
  integer,
  timestamp,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const readingStatusEnum = pgEnum("reading_status", [
  "wishlist",
  "reading",
  "finished",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const addedBooks = pgTable(
  "added_books",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id, { onDelete: "cascade" })
      .notNull(),
    status: readingStatusEnum("status").notNull().default("wishlist"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqueIdx: uniqueIndex("added_books_user_book_idx").on(t.userId, t.bookId),
    statusIdx: index("added_books_status_idx").on(t.userId, t.status),
    finishedAtCheck: check(
      "chk_added_books_finished_at",
      sql`${t.status} != 'finished' OR ${t.finishedAt} IS NOT NULL`,
    ),
  }),
);

export const bookReviews = pgTable(
  "book_reviews",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content"),
    rating: smallint("rating").notNull(),
    containsSpoilers: boolean("contains_spoilers").default(false).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqueUserBookIdx: uniqueIndex("book_review_user_book_idx").on(
      t.userId,
      t.bookId,
    ),
    bookIdIdx: index("book_reviews_book_id_idx").on(t.bookId),
  }),
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reviewId: varchar("review_id", { length: 255 })
      .references(() => bookReviews.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqueReviewUserIdx: uniqueIndex("review_like_review_user_idx").on(
      t.reviewId,
      t.userId,
    ),
  }),
);

export const bookLists = pgTable(
  "book_lists",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: varchar("description", { length: 500 }),
    isPublic: boolean("is_public").default(true).notNull(),
    bookCount: integer("book_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    userIdIdx: index("book_lists_user_id_idx").on(t.userId),
  }),
);

export const bookListItems = pgTable(
  "book_list_items",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    listId: varchar("list_id", { length: 255 })
      .references(() => bookLists.id, { onDelete: "cascade" })
      .notNull(),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("added_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniqueListBookIdx: uniqueIndex("book_list_items_list_book_idx").on(
      t.listId,
      t.bookId,
    ),
    listIdIdx: index("book_list_items_list_id_idx").on(t.listId),
  }),
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const addedBooksRelations = relations(addedBooks, ({ one }) => ({
  user: one(users, { fields: [addedBooks.userId], references: [users.id] }),
  book: one(books, { fields: [addedBooks.bookId], references: [books.id] }),
}));

export const bookReviewsRelations = relations(bookReviews, ({ one, many }) => ({
  user: one(users, { fields: [bookReviews.userId], references: [users.id] }),
  book: one(books, { fields: [bookReviews.bookId], references: [books.id] }),
  likes: many(reviewLikes),
}));

export const reviewLikesRelations = relations(reviewLikes, ({ one }) => ({
  review: one(bookReviews, {
    fields: [reviewLikes.reviewId],
    references: [bookReviews.id],
  }),
  user: one(users, { fields: [reviewLikes.userId], references: [users.id] }),
}));

export const bookListsRelations = relations(bookLists, ({ one, many }) => ({
  user: one(users, { fields: [bookLists.userId], references: [users.id] }),
  items: many(bookListItems),
}));

export const bookListItemsRelations = relations(bookListItems, ({ one }) => ({
  list: one(bookLists, {
    fields: [bookListItems.listId],
    references: [bookLists.id],
  }),
  book: one(books, { fields: [bookListItems.bookId], references: [books.id] }),
}));
