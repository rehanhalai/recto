import { useInfiniteQuery } from "@tanstack/react-query";
import type {
  ApiEnvelope,
  PostWithRelations,
  PaginatedResponse,
} from "@recto/types";
import { apiInstance } from "@/lib/api";

async function fetchFollowingPosts(
  cursor?: string,
): Promise<PaginatedResponse<PostWithRelations>> {
  const response = await apiInstance.get<
    ApiEnvelope<PaginatedResponse<PostWithRelations>>
  >("/posts/following", {
    limit: 10,
    cursor,
  });
  return response.data;
}

export function useFollowingFeed(enabled: boolean = true) {
  const query = useInfiniteQuery<PaginatedResponse<PostWithRelations>, Error>({
    queryKey: ["feed", "posts", "following"],
    queryFn: ({ pageParam }) =>
      fetchFollowingPosts(pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  const posts = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    posts,
  };
}
