import { useInfiniteQuery } from "@tanstack/react-query";
import type { PostWithRelations, PaginatedResponse } from "@recto/types";
import { apiInstance } from "@/lib/api";

type ApiEnvelope<T> = {
  statusCode: number;
  message: string;
  data: T;
};

async function fetchExplorePosts(
  cursor?: string,
): Promise<PaginatedResponse<PostWithRelations>> {
  const response = await apiInstance.get<
    ApiEnvelope<PaginatedResponse<PostWithRelations>>
  >("/posts/feed", {
    limit: 10,
    cursor,
  });
  return response.data;
}

export function useExploreFeed(
  initialData?: PaginatedResponse<PostWithRelations>,
) {
  const query = useInfiniteQuery<PaginatedResponse<PostWithRelations>, Error>({
    queryKey: ["feed", "posts", "explore"],
    queryFn: ({ pageParam }) =>
      fetchExplorePosts(pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    staleTime: 1000 * 60 * 2,
  });

  const posts = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    posts,
  };
}
