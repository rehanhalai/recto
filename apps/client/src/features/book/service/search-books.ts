import { apiInstance } from "@/lib/api";
import type { Book } from "../types";

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

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
