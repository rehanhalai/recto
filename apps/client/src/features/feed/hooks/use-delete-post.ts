import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return apiInstance.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Post deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to delete post.");
    },
  });
}
