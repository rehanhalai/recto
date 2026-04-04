import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { profileKeys } from "../query-keys";
import type { ApiEnvelope, PublicList } from "../types";

export function useUserLists(
  userId: string | undefined,
  enabled: boolean = true,
) {
  return useQuery<PublicList[]>({
    queryKey: profileKeys.lists(userId || ""),
    queryFn: async () => {
      const response = await apiInstance.get<ApiEnvelope<PublicList[]>>(
        `/lists/user/${userId}`,
      );
      return response.data;
    },
    enabled: Boolean(userId && enabled),
  });
}
