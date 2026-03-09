export interface IBook {
  id?: string;
  externalId: string;
  title: string;
  subtitle?: string | null;
  releaseDate?: string | null;
  description?: string | null;
  averageRating?: number | null;
  ratingsCount?: number | null;
  coverImage?: string | null;
  coverI?: number | null;
  isbn13?: string | null;
  isStale?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;

  // These are from normalized tables or openlibrary response
  authors?: string[];
  genres?: string[];
  links?: Array<{ title: string; url: string }>;
}
