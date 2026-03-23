import { useQuery } from "@tanstack/react-query";
import { searchBooks } from "../service/search-books";

export function useGenreBooks(genre: string, limit = 8) {
  return useQuery({
    queryKey: ["books", "genre", genre, limit],
    queryFn: () => searchBooks(`subject:${genre}`, limit, 1),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
