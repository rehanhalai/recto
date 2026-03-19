/**
 * Interactions-related types inferred from Drizzle ORM schema
 * Includes reading tracking, reviews, and book lists
 */

import { InferSelectModel } from "drizzle-orm";
import {
  addedBooks,
  bookReviews,
  reviewLikes,
  bookLists,
  bookListItems,
} from "@recto/server/db/schema/interactions";

// ─── Raw Inferred Types ───────────────────────────────────────────────────────

export type AddedBook = InferSelectModel<typeof addedBooks>;

export type BookReview = InferSelectModel<typeof bookReviews>;

export type ReviewLike = InferSelectModel<typeof reviewLikes>;

export type BookList = InferSelectModel<typeof bookLists>;

export type BookListItem = InferSelectModel<typeof bookListItems>;

// ─── API Response Types ────────────────────────────────────────────────────────

export type AddedBookWithRelations = AddedBook & {
  book?: {
    id: string;
    title: string;
    coverImage: string | null;
    averageRating: string | null; // Parse with parseFloat()
  };
  user?: {
    id: string;
    userName: string;
  };
};

export type BookReviewWithRelations = BookReview & {
  author?: {
    id: string;
    userName: string;
    fullName: string | null;
    avatarImage: string | null;
  };
  book?: {
    id: string;
    title: string;
    coverImage: string | null;
  };
  isLikedByMe?: boolean;
  likeCount: number;
};

export type ReviewLikeResponse = ReviewLike & {
  user?: {
    id: string;
    userName: string;
    avatarImage: string | null;
  };
  review?: BookReviewWithRelations;
};

export type BookListResponse = BookList & {
  owner?: {
    id: string;
    userName: string;
    avatarImage: string | null;
  };
  itemCount: number;
};

export type BookListWithItems = BookListResponse & {
  items: BookListItemWithBook[];
};

export type BookListItemWithBook = BookListItem & {
  book: {
    id: string;
    title: string;
    coverImage: string | null;
    averageRating: string | null; // Parse with parseFloat()
    authors?: Array<{
      authorName: string;
    }>;
  };
};

/**
 * Reading status enum for type safety
 */
export enum ReadingStatus {
  WISHLIST = "wishlist",
  READING = "reading",
  FINISHED = "finished",
}

export type UserReadingStats = {
  userId: string;
  wishlistCount: number;
  currentlyReading: number;
  finishedCount: number;
  totalBooksRated: number;
  averageRating: number;
};

export type BookWithReadingStatus = {
  bookId: string;
  status: ReadingStatus;
  startedAt: Date | null;
  finishedAt: Date | null;
  review?: BookReviewWithRelations;
};
