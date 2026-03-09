import {
  BookResponse,
  BookListResponse,
  BlogResponse,
  homeService,
} from "@/features/home/service/home.service";
import { getRandomGenres } from "@/config";

export interface HomeData {
  genres: string[];
  booksRecommendations: { [key: string]: BookResponse[] };
  bookLists: BookListResponse[];
  blogs: BlogResponse[];
}

export const homeApi = {
  /**
   * Fetch all home page data
   * Fetches genres, book recommendations, lists, and blogs
   * @param genres - Array of genres to fetch books for (passed from hook for session consistency)
   */
  async fetchHomeData(genres: string[]): Promise<HomeData> {
    try {
      // Fetch all data in parallel
      const [booksRecommendations, bookLists, blogs] = await Promise.all([
        homeService.getBooksRecommendations(genres),
        homeService.getPublicLists(3),
        homeService.getTrendingBlogs(3),
      ]);

      return {
        genres,
        booksRecommendations,
        bookLists,
        blogs,
      };
    } catch (error) {
      console.error("Error fetching home data:", error);
      throw error;
    }
  },
};
