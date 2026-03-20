import { useQuery } from "@tanstack/react-query";
import { useBookStore } from "@/features/book/store/book-store";
import { fetchBook } from "../service/book-api";
import type { Book } from "../types";

interface FetchBookPayload {
  volumeId: string;
}

export const useBookByCard = (payload: FetchBookPayload) => {
  const setCurrentBook = useBookStore((state) => state.setCurrentBook);

  const query = useQuery<Book>({
    queryKey: ["book", payload.volumeId],
    queryFn: async () => {
      const res = await fetchBook(payload.volumeId);
      const book =
        typeof res === "object" && res !== null && "data" in res
          ? (res as { data: Book }).data
          : (res as Book);
      setCurrentBook(book);
      return book;
    },
    enabled: Boolean(payload.volumeId),
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return query;
};
