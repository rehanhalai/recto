/**
 * Application Configuration
 * Centralized config for environment variables and API settings
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const config = {
  api: {
    baseUrl: API_URL,
    timeout: 30000, // 30 seconds
  },
  auth: {
    accessTokenKey: "recto_access_token",
    refreshTokenKey: "recto_refresh_token",
    userKey: "recto_user",
  },
  google: {
    authUrl: `${API_URL}/user/google`,
  },
} as const;

/**
 * Complete list of genres for book recommendations and exploration
 * Used throughout the app for genre-based filtering and discovery
 */
export const GENRES = [
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Mystery",
  "Thriller",
  "Horror",
  "Historical Fiction",
  "Non-Fiction",
  "Biography",
  "Self-Help",
  "Philosophy",
  "Psychology",
  "Business",
  "Technology",
  "Politics",
  "History",
  "Poetry",
  "Young Adult",
  "Children",
  "Comics & Graphic Novels",
] as const;

/**
 * Get a random selection of genres
 * @param count - Number of random genres to return
 * @returns Array of random genre names
 */
export const getRandomGenres = (count: number = 5): string[] => {
  const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
