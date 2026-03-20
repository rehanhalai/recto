import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export interface BookStatsResponse {
  readers: number;
  reviews: number;
  lists: number;
  averageRating: number;
  ratingsCount: number;
  distribution: {
    five: number;
    four: number;
    three: number;
    two: number;
    one: number;
  };
}

export function useBookStats(bookId?: string) {
  return useQuery<BookStatsResponse>({
    queryKey: ["book-stats", bookId],
    queryFn: async () =>
      apiInstance.get<BookStatsResponse>(`/book/stats/${bookId}`),
    enabled: Boolean(bookId),
    staleTime: 1000 * 60,
  });
}
