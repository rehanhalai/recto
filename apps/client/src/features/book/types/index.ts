export type UserBookStatus = "wishlist" | "reading" | "finished";

export interface Book {
  id: string;
  sourceId?: string;
  title: string;
  subtitle?: string;
  authors?: { id: string; bookId: string; authorName: string }[];
  genres: string[];
  releaseDate?: string;
  description?: string;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  coverImage?: string;
  cover_i?: number;
  pageCount?: number;
  isbn13?: string;
  links?: { title: string; url: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalResults: number;
}

export interface SearchMetadata {
  query?: string;
  totalFound?: number;
  totalReturned?: number;
  filtered?: number;
}

export interface SearchResponse {
  results: Book[];
  pagination: Pagination;
  metadata?: SearchMetadata;
}

export interface AuthorSearchResponse {
  books: Book[];
  pagination: Pagination;
  metadata?: SearchMetadata;
}

export interface UserBook {
  id: string;
  bookId: string;
  book?: Book;
  status: UserBookStatus;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  bookId: string;
  user: {
    id?: string;
    name?: string;
    userName?: string;
    avatarImage?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookListItem {
  book_id: string;
  title: string;
  author: string;
  added_at: string;
  position: number;
}

export interface BookList {
  id: string;
  user_id:
    | string
    | {
        id: string;
        userName?: string;
        fullName?: string;
        avatarImage?: string;
      };
  name: string;
  description?: string;
  is_public: boolean;
  book_count: number;
  items: BookListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
