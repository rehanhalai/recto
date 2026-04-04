import { apiInstance } from "@/lib/api";
import type { ApiEnvelope } from "@recto/types";
import type { Book } from "../types";

export async function searchBooks(
  query: string,
  limit = 10,
  page = 1,
): Promise<Book[]> {
  const response = await apiInstance.get<
    ApiEnvelope<{
      books: Book[];
      pagination: {
        currentPage: number;
        limit: number;
        hasMore: boolean;
      };
    }>
  >("/book/search", { q: query, limit, page });

  return response?.data?.books ?? [];
}
