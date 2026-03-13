import * as crypto from "crypto";
import {
  pgTable,
  pgEnum,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { bookReviews, addedBooks, bookListItems } from "./interactions";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const bookSourceEnum = pgEnum("book_source", [
  "google_books",
  "open_library",
  "manual",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const books = pgTable(
  "books",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceId: varchar("source_id", { length: 255 }).notNull(),
    source: bookSourceEnum("source").default("google_books").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    releaseDate: varchar("release_date", { length: 50 }),
    description: text("description"),
    pageCount: integer("page_count"),
    language: varchar("language", { length: 10 }),
    isbn13: varchar("isbn13", { length: 13 }),

    // Recto ratings — maintained via Postgres trigger
    averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
    ratingsCount: integer("ratings_count").default(0).notNull(),

    // Google Books cold-start data
    googleRating: numeric("google_rating", { precision: 3, scale: 2 }),
    googleRatingsCount: integer("google_ratings_count").default(0).notNull(),

    coverImage: text("cover_image"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    sourceIdIdx: index("books_source_id_idx").on(t.sourceId),
    sourceSourceIdIdx: uniqueIndex("books_source_source_id_idx").on(
      t.source,
      t.sourceId,
    ),
    titleIdx: index("books_title_idx").on(t.title),
    isbn13Idx: index("books_isbn13_idx").on(t.isbn13),
  }),
);

export const bookAuthors = pgTable(
  "book_authors",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id, { onDelete: "cascade" })
      .notNull(),
    authorName: varchar("author_name", { length: 255 }).notNull(),
  },
  (t) => ({
    bookIdIdx: index("book_authors_book_id_idx").on(t.bookId),
    authorNameIdx: index("book_authors_author_name_idx").on(t.authorName),
  }),
);

// curated master genre list — seeded manually, grown over time
export const genres = pgTable(
  "genres",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 100 }).unique().notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex("genres_slug_idx").on(t.slug),
  }),
);

export const bookGenres = pgTable(
  "book_genres",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookId: varchar("book_id", { length: 255 })
      .references(() => books.id, { onDelete: "cascade" })
      .notNull(),
    genreId: varchar("genre_id", { length: 255 })
      .references(() => genres.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    uniqueBookGenreIdx: uniqueIndex("book_genres_book_genre_idx").on(
      t.bookId,
      t.genreId,
    ),
    genreIdIdx: index("book_genres_genre_id_idx").on(t.genreId),
  }),
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const booksRelations = relations(books, ({ many }) => ({
  authors: many(bookAuthors),
  genres: many(bookGenres),
  reviews: many(bookReviews),
  addedBooks: many(addedBooks),
  listItems: many(bookListItems),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  books: many(bookGenres),
}));

export const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, {
    fields: [bookGenres.bookId],
    references: [books.id],
  }),
  genre: one(genres, {
    fields: [bookGenres.genreId],
    references: [genres.id],
  }),
}));
