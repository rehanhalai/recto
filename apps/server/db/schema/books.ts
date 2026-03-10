import * as crypto from "crypto";
import {
  pgTable,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const books = pgTable("books", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  externalId: varchar("external_id", { length: 255 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  releaseDate: varchar("release_date", { length: 50 }),
  description: text("description"),
  averageRating: integer("average_rating").default(0),
  ratingsCount: integer("ratings_count").default(0),
  coverImage: text("cover_image"),
  coverI: integer("cover_i"),
  isbn13: varchar("isbn13", { length: 13 }),
  alternativeIds: text("alternative_ids").array(),
  isStale: boolean("is_stale").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const bookAuthors = pgTable("book_authors", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookId: varchar("book_id", { length: 255 })
    .references(() => books.id)
    .notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
});

export const bookGenres = pgTable("book_genres", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookId: varchar("book_id", { length: 255 })
    .references(() => books.id)
    .notNull(),
  genreName: varchar("genre_name", { length: 255 }).notNull(),
});

export const bookLanguages = pgTable("book_languages", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookId: varchar("book_id", { length: 255 })
    .references(() => books.id)
    .notNull(),
  languageCode: varchar("language_code", { length: 10 }).notNull(),
});

export const bookLinks = pgTable("book_links", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  bookId: varchar("book_id", { length: 255 })
    .references(() => books.id)
    .notNull(),
  title: varchar("title", { length: 255 }),
  url: text("url").notNull(),
});

// relations

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
