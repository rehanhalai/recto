import { useQuery } from "@tanstack/react-query";
import { useBookStore } from "@/features/book/store/book-store";
import { fetchBook } from "../service/book-api";

interface FetchBookPayload {
  externalId: string;
  title?: string;
  authors?: string[];
}

export const useBookByCard = (payload: FetchBookPayload) => {
  const setCurrentBook = useBookStore((state) => state.setCurrentBook);

  const query = useQuery({
    queryKey: ["book", payload.externalId, payload.title],
    queryFn: async () => {
      const res = await fetchBook(payload);
      const book = res.data;
      setCurrentBook(book);
      return book;
    },
    retry: 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return query;
};
