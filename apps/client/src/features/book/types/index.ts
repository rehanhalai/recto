import type { 
  BookDetailResponse,
  BookList as RectoBookList,
  BookListItem as RectoBookListItem,
  ReadingStatus
} from "@recto/types";

export type UserBookStatus = `${ReadingStatus}`;

export type Book = BookDetailResponse;

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

export type BookListItem = RectoBookListItem;
export type BookList = RectoBookList & {
  items: BookListItem[];
};

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
