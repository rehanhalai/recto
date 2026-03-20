import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export type TrendingBook = {
  id: string;
  title: string;
  coverImage: string | null;
};

type TrendingResponse = {
  data: {
    posts: Array<{
      id: string;
      bookId: string | null;
      book?: TrendingBook;
    }>;
  };
  message: string;
};

export function useTrendingBooks() {
  return useQuery<TrendingBook[]>({
    queryKey: ["sidebar", "trending-books"],
    queryFn: async () => {
      // Fetch trending feed and extract unique books
      const response = await apiInstance.get<TrendingResponse>(
        "/feed/trending",
        { limit: 20 },
      );

      console.log(response.data);

      // Extract unique books from the posts
      const booksMap = new Map<string, TrendingBook>();
      const posts = response.data.posts ?? [];

      for (const post of posts) {
        if (post.book && post.book.id && !booksMap.has(post.book.id)) {
          booksMap.set(post.book.id, post.book);
        }
      }
      console.log(booksMap);
      return Array.from(booksMap.values()).slice(0, 8);
    },
    staleTime: 1000 * 60 * 5,
  });
}
