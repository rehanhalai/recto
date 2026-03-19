/**
 * Book-related types inferred from Drizzle ORM schema
 */

import { InferSelectModel } from "drizzle-orm";
import {
  books,
  bookAuthors,
  genres,
  bookGenres,
} from "../../../apps/server/db/schema/books";

// ─── Raw Inferred Types ───────────────────────────────────────────────────────

export type Book = InferSelectModel<typeof books>;

export type BookAuthor = InferSelectModel<typeof bookAuthors>;

export type Genre = InferSelectModel<typeof genres>;

export type BookGenre = InferSelectModel<typeof bookGenres>;

// ─── API Response Types ────────────────────────────────────────────────────────

/**
 * NOTE: averageRating and googleRating come back as strings from Drizzle
 * Parse them with parseFloat() on the client side.
 */
export type BookResponse = Omit<Book, "averageRating" | "googleRating"> & {
  averageRating: string | null; // Parse with parseFloat()
  googleRating: string | null; // Parse with parseFloat()
};

export type BookWithRelations = BookResponse & {
  authors: BookAuthor[];
  genres: Genre[];
  reviewCount?: number;
  addedToListsCount?: number;
};

export type BookAuthorResponse = BookAuthor & {
  book?: BookResponse;
};

export type GenreResponse = Genre & {
  bookCount?: number;
};

export type BookWithGenres = BookResponse & {
  genres: GenreResponse[];
};

export type BookDetailResponse = BookWithRelations & {
  averageRating: string | null; // Parse with parseFloat()
  googleRating: string | null; // Parse with parseFloat()
  ratingsCount: number;
  googleRatingsCount: number;
};
