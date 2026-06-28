import { InfiniteData, QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse, PostWithRelations } from "@recto/types";

import { apiInstance } from "@/lib/api";

type ToggleLikeInput = {
  postId: string;
  isLikedByMe: boolean;
};

export function useFeedLike(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLikedByMe }: ToggleLikeInput) => {
      if (isLikedByMe) {
        return apiInstance.delete<void>(`/posts/${postId}/like`);
      }

      return apiInstance.post<void>(`/posts/${postId}/like`);
    },
    onMutate: async ({ postId, isLikedByMe }) => {
      await queryClient.cancelQueries({ queryKey: ["feed", "posts"] });

      // We don't save previous state for all queries for rollback because it's complex,
      // but we can invalidate on error. For a simple implementation, we just optimistically update all.
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<PostWithRelations>>>(
        { queryKey: ["feed", "posts"] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((post) => {
                if (post.id !== postId) {
                  return post;
                }

                return {
                  ...post,
                  isLikedByMe: !isLikedByMe,
                  likesCount: isLikedByMe
                    ? Math.max(0, post.likesCount - 1)
                    : post.likesCount + 1,
                };
              }),
            })),
          };
        },
      );

      return { postId, isLikedByMe };
    },
    onError: () => {
      // If mutation fails, we simply invalidate all feeds to refetch correct state
      queryClient.invalidateQueries({ queryKey: ["feed", "posts"] });
    },
    onSettled: () => {
      // Invalidate to ensure background sync
      queryClient.invalidateQueries({ queryKey: ["feed", "posts"] });
    },
  });
}