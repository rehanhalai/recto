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
      await queryClient.cancelQueries({ queryKey });

      const previousFeed = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<PostWithRelations>>
      >(queryKey);

      if (previousFeed) {
        queryClient.setQueryData<InfiniteData<PaginatedResponse<PostWithRelations>>>(
          queryKey,
          {
            ...previousFeed,
            pages: previousFeed.pages.map((page) => ({
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
          },
        );
      }

      return { previousFeed };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKey, context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}