import { useInfiniteQuery } from "@tanstack/react-query";
import type { PaginatedResponse, PostWithRelations } from "@recto/types";
import { apiInstance } from "@/lib/api";
import { profileKeys } from "../query-keys";
import type { ApiEnvelope } from "../types";

export function useUserPosts(
  userId: string | undefined,
  enabled: boolean = true,
) {
  return useInfiniteQuery<PaginatedResponse<PostWithRelations>, Error>({
    queryKey: profileKeys.posts(userId || ""),
    queryFn: async ({ pageParam }) => {
      const response = await apiInstance.get<
        ApiEnvelope<PaginatedResponse<PostWithRelations>>
      >(`/posts/user/${userId}`, {
        limit: 10,
        cursor: pageParam as string | undefined,
      });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(userId && enabled),
  });
}
