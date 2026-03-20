import { useQuery } from "@tanstack/react-query";
import { getTrendingBooks } from "../../feed/api/get-trending-books";

export function useTrendingBooks(limit = 10) {
  return useQuery({
    queryKey: ["books", "trending", limit],
    queryFn: () => getTrendingBooks(limit),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
