/**
 * Home Service - Handles API calls for homepage data
 * Fetches book recommendations by genre, public lists, and featured blogs
 */

import { apiFetch } from "@/lib/fetch";

/**
 * Book data interface
 */
export interface BookResponse {
  openLibraryId: string;
  title: string;
  authors: string[];
  coverImage: string;
  averageRating: number;
  genres: string[];
  description?: string;
}

/**
 * Book List data interface
 */
export interface BookListResponse {
  _id: string;
  name: string;
  description: string;
  book_count: number;
  user_id?: {
    username?: string;
  };
  is_public: boolean;
  createdAt?: string;
}

/**
 * Blog data interface
 */
export interface BlogResponse {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author_id?: {
    username?: string;
  };
  cover_image?: string;
  createdAt: string;
  is_published?: boolean;
}

/**
 * Generic API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}

/**
 * Search response with results
 */
interface SearchResponse {
  results: BookResponse[];
}

/**
 * Home Service class
 */
export const homeService = {
  /**
   * Fetch books by genre
   * Uses search endpoint with genre filter
   */
  async getBooksByGenre(
    genre: string,
    limit: number = 6,
  ): Promise<BookResponse[]> {
    try {
      const response = await apiFetch<ApiResponse<SearchResponse>>(
        `/books/search?genre=${encodeURIComponent(genre)}&limit=${limit}`,
      );
      return response.data.results || [];
    } catch (error) {
      console.error(`Error fetching ${genre} books:`, error);
      return [];
    }
  },

  /**
   * Fetch all genres with books
   * Calls getBooksByGenre for each genre in parallel
   */
  async getBooksRecommendations(
    genres: string[],
  ): Promise<{ [key: string]: BookResponse[] }> {
    try {
      const results: { [key: string]: BookResponse[] } = {};

      // Limit concurrency to avoid 429 rate limits
      const concurrency = 2; // tune as needed based on API limits
      for (let i = 0; i < genres.length; i += concurrency) {
        const batch = genres.slice(i, i + concurrency);
        const batchPromises = batch.map(async (genre) => {
          const books = await this.getBooksByGenre(genre, 10);
          return { genre, books };
        });

        const settled = await Promise.allSettled(batchPromises);
        settled.forEach((result) => {
          if (result.status === "fulfilled") {
            const { genre, books } = result.value;
            results[genre] = books;
          }
        });

        // Small delay between batches to be gentle on the API
        if (i + concurrency < genres.length) {
          await new Promise((res) => setTimeout(res, 250));
        }
      }

      return results;
    } catch (error) {
      console.error("Error fetching book recommendations:", error);
      return {};
    }
  },

  /**
   * Fetch public book lists
   * Gets curated lists that are marked as public
   */
  async getPublicLists(limit: number = 3): Promise<BookListResponse[]> {
    try {
      const response = await apiFetch<ApiResponse<BookListResponse[]>>(
        `/lists/public?limit=${limit}`,
      );
      return response.data || [];
    } catch (error) {
      console.error("Error fetching public lists:", error);
      return [];
    }
  },

  /**
   * Fetch featured/trending blogs
   * Gets published blogs sorted by creation date
   */
  async getTrendingBlogs(limit: number = 3): Promise<BlogResponse[]> {
    try {
      const response = await apiFetch<
        ApiResponse<{ blogs: BlogResponse[]; pagination: any }>
      >(`/blogs?limit=${limit}&sort=createdAt&order=desc`);

      // Extract blogs from response and filter for published only
      const blogs = response.data?.blogs || [];
      return blogs.filter((blog) => blog.is_published !== false);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return [];
    }
  },

  /**
   * Get top-rated books
   * Fetches books sorted by average rating
   */
  async getTopRatedBooks(limit: number = 6): Promise<BookResponse[]> {
    try {
      const response = await apiFetch<ApiResponse<SearchResponse>>(
        `/books/search?sort=averageRating&order=desc&limit=${limit}`,
      );
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching top-rated books:", error);
      return [];
    }
  },

  /**
   * Get new releases
   * Fetches books sorted by release date
   */
  async getNewReleases(limit: number = 6): Promise<BookResponse[]> {
    try {
      const response = await apiFetch<ApiResponse<SearchResponse>>(
        `/books/search?sort=releaseDate&order=desc&limit=${limit}`,
      );
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching new releases:", error);
      return [];
    }
  },
};

export default homeService;
