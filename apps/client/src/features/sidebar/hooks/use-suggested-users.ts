import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export type SuggestedUser = {
  id: string;
  userName: string;
  fullName: string | null;
  avatarImage: string | null;
};

type SearchResponse = {
  data: {
    users: SuggestedUser[];
  };
  message: string;
};

export function useSuggestedUsers(enabled = true) {
  return useQuery<SuggestedUser[]>({
    queryKey: ["sidebar", "suggested-users"],
    queryFn: async () => {
      // Use the search endpoint to get suggested users
      const response = await apiInstance.get<SearchResponse>("/search", {
        q: "re",
        type: "users",
        limit: 3,
      });
      return response.data.users;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
