import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";
import { profileKeys } from "../query-keys";
import type { ApiEnvelope, ProfilePayload } from "../types";

export function useFollowUser(username: string, userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shouldFollow: boolean) => {
      if (!userId) {
        throw new Error("User id is required to update follow status");
      }

      if (shouldFollow) {
        const response = await apiInstance.post<ApiEnvelope<object>>(
          `/user/${userId}/follow`,
        );
        return response.data;
      }

      const response = await apiInstance.delete<ApiEnvelope<object>>(
        `/user/${userId}/follow`,
      );
      return response.data;
    },
    onSuccess: (_result, shouldFollow) => {
      queryClient.setQueryData<ProfilePayload | undefined>(
        profileKeys.detail(username),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            context: {
              ...old.context,
              isFollowing: shouldFollow,
            },
          };
        },
      );

      toast.success(shouldFollow ? "Following user" : "Unfollowed user");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Something went wrong";
      toast.error(message);
    },
  });
}
