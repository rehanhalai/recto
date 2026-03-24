import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export function useSearch(
  query: string,
  type: "all" | "users" | "books" | "lists" = "all",
  page: number = 1,
  limit: number = 10,
) {
  return useQuery({
    queryKey: ["search", query, type, page, limit],
    queryFn: async () => {
      const response = await apiInstance.get<any>("/search", {
        q: query,
        type,
        page,
        limit,
      });
      return response.data;
    },
    enabled: !!query && query.length >= 2,
  });
}

export function useInfiniteSearch(
  query: string,
  type: "users" | "books" | "lists",
  limit: number = 12,
) {
  return useInfiniteQuery({
    queryKey: ["search", "infinite", query, type, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiInstance.get<any>("/search", {
        q: query,
        type,
        page: pageParam,
        limit,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      if (!pagination || !pagination.hasMore) return undefined;
      return pagination.currentPage + 1;
    },
    initialPageParam: 1,
    enabled: !!query && query.length >= 2,
  });
}
