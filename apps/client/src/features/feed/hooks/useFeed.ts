import { useInfiniteQuery } from "@tanstack/react-query";
import type { PostWithRelations, PaginatedResponse } from "@recto/types";
import { apiInstance } from "@/lib/api";

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

async function fetchFeed({
  pageParam,
}: {
  pageParam?: string;
}): Promise<PaginatedResponse<PostWithRelations>> {
  const response = await apiInstance.get<
    ApiEnvelope<PaginatedResponse<PostWithRelations>>
  >("/posts/feed", {
    limit: 10,
    cursor: pageParam,
  });

  return response.data;
}

export function useFeed(initialData?: PaginatedResponse<PostWithRelations>) {
  const query = useInfiniteQuery<PaginatedResponse<PostWithRelations>, Error>({
    queryKey: ["feed", "posts"],
    queryFn: ({ pageParam }) =>
      fetchFeed({ pageParam: pageParam as string | undefined }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const posts = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    posts,
  };
}
