import { useInfiniteQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { profileKeys } from "../query-keys";
import type { ApiEnvelope, ProfileRelationPage, RelationMode } from "../types";

export function useProfileRelations(
  username: string,
  mode: RelationMode,
  enabled: boolean = false,
) {
  return useInfiniteQuery<ProfileRelationPage, Error>({
    queryKey: profileKeys.relations(username, mode),
    queryFn: async ({ pageParam }) => {
      const response = await apiInstance.get<ApiEnvelope<ProfileRelationPage>>(
        `/user/profile/${mode}`,
        {
          userName: username,
          limit: 20,
          cursor: pageParam as string | undefined,
        },
      );
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}
