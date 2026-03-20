import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export type SuggestedUser = {
  id: string;
  userName: string;
  fullName: string | null;
  avatarImage: string | null;
  bio?: string | null;
};

type SearchResponse = {
  users: SuggestedUser[];
  message: string;
};

export function useSuggestedUsers() {
  return useQuery<SuggestedUser[]>({
    queryKey: ["sidebar", "suggested-users"],
    queryFn: async () => {
      // Use the search endpoint to get suggested users
      const response = await apiInstance.get<SearchResponse>("/user/search", {
        userName: "a",
        limit: 3,
      });
      return response.users ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
