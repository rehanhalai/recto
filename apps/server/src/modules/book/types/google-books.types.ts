/**
 * Google Books API Response Types
 * Based on: https://developers.google.com/books/docs/v1/reference/volumes
 */

// ─── RAW GOOGLE BOOKS API TYPES ────────────────────────────────────────────

/**
 * Industry identifier (ISBN, etc.)
 * Used in VolumeInfo to identify the book
 */
export interface GoogleBooksIndustryIdentifier {
  type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER";
  identifier: string;
}

/**
 * Image links for book covers
 */
export interface GoogleBooksImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

/**
 * Volume info - the metadata for a book
 */
export interface GoogleBooksVolumeInfo {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: GoogleBooksIndustryIdentifier[];
  readingModes?: {
    text: boolean;
    image: boolean;
  };
  pageCount?: number;
  printType?: "BOOK" | "MAGAZINE";
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  contentVersion?: string;
  imageLinks?: GoogleBooksImageLinks;
  language?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  maturityRating?: string;
  allowAnonLogging?: boolean;
  previewLink?: string;
  textSnippet?: string;
}

/**
 * A single volume from the Google Books API
 */
export interface GoogleBooksVolume {
  kind: string;
  id: string; // Google Books ID
  etag?: string;
  selfLink?: string;
  volumeInfo: GoogleBooksVolumeInfo;
  saleInfo?: {
    country?: string;
    saleability?: "FOR_SALE" | "PARTIAL" | "FREE" | "NOT_FOR_SALE";
    isEbook?: boolean;
    listPrice?: {
      amount: number;
      currencyCode: string;
    };
    retailPrice?: {
      amount: number;
      currencyCode: string;
    };
  };
  accessInfo?: {
    country?: string;
    viewability?: "FULL" | "PAGES_PARTIAL" | "SNIPPET" | "NO_PAGES";
    embeddable?: boolean;
    publicDomain?: boolean;
    textToSpeechPermission?: string;
    epub?: {
      isAvailable: boolean;
      acsTokenLink?: string;
    };
    pdf?: {
      isAvailable: boolean;
      acsTokenLink?: string;
    };
    accessViewStatus?: string;
    downloadLink?: string;
  };
  searchInfo?: {
    textSnippet?: string;
  };
}

/**
 * Google Books search API response
 */
export interface GoogleBooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
  error?: {
    code: number;
    message: string;
    errors?: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
  };
}

// ─── INTERNAL NORMALIZED TYPES ────────────────────────────────────────────

/**
 * Normalized book data from Google Books API
 * Ready for storage in the database
 */
export interface NormalizedBook {
  sourceId: string; // Google Books ID
  source: "google_books";
  title: string;
  subtitle?: string;
  description?: string;
  releaseDate?: string;
  pageCount?: number;
  language?: string;
  isbn13?: string;
  coverImage?: string;
  googleRating?: number;
  googleRatingsCount?: number;
  authors: string[];
  categories: string[];
}

// ─── DATABASE RESPONSE TYPES ──────────────────────────────────────────────

/**
 * BookResponse - what gets returned after DB resolution and enrichment
 * Includes both normalized data and database metadata
 */
export interface BookResponse extends NormalizedBook {
  id: string; // Primary key in recto's books table
  averageRating?: number; // Calculated rating from recto reviews
  ratingsCount?: number; // Count of recto reviews
  genres: string[]; // Normalized genres (from both Google categories and manual)
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ─── SEARCH RESPONSE TYPE ─────────────────────────────────────────────────

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Search response returned to frontend
 */
export interface SearchResponse {
  books: NormalizedBook[];
  pagination: PaginationMeta;
}

// ─── UTILITY TYPES ────────────────────────────────────────────────┬────────

/**
 * Union type for book sources
 */
export type BookSource = "google_books" | "open_library" | "manual";

/**
 * Type guard to check if a book is from Google Books
 */
export function isGoogleBooksVolume(
  volume: unknown,
): volume is GoogleBooksVolume {
  if (!volume || typeof volume !== "object") return false;
  const v = volume as Record<string, unknown>;
  return (
    v.kind === "books#volume" &&
    typeof v.id === "string" &&
    typeof v.volumeInfo === "object"
  );
}

/**
 * Type guard to check if a book is from Google Books search response
 */
export function isGoogleBooksSearchResponse(
  response: unknown,
): response is GoogleBooksSearchResponse {
  if (!response || typeof response !== "object") return false;
  const r = response as Record<string, unknown>;
  return (
    r.kind === "books#volumes" &&
    typeof r.totalItems === "number" &&
    (Array.isArray(r.items) || r.items === undefined)
  );
}
