import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  ApiEnvelope,
  PostWithRelations,
  PaginatedResponse,
} from "@recto/types";
import { apiInstance } from "@/lib/api";

export type FeedType = "explore" | "following";

async function fetchFeed({
  type,
  pageParam,
}: {
  type: FeedType;
  pageParam?: string;
}): Promise<PaginatedResponse<PostWithRelations>> {
  const endpoint = type === "following" ? "/posts/following" : "/posts/feed";

  const response = await apiInstance.get<
    ApiEnvelope<PaginatedResponse<PostWithRelations>>
  >(endpoint, {
    limit: 10,
    cursor: pageParam,
  });

  return response.data;
}

export function useFeed(
  type: FeedType = "explore",
  initialData?: PaginatedResponse<PostWithRelations>,
) {
  const query = useInfiniteQuery<PaginatedResponse<PostWithRelations>, Error>({
    queryKey: ["feed", "posts", type],
    queryFn: ({ pageParam }) =>
      fetchFeed({ type, pageParam: pageParam as string | undefined }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData:
      type === "explore" && initialData
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
