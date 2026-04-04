import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { profileKeys } from "../query-keys";
import type { ApiEnvelope, ProfilePayload } from "../types";

export function useProfile(username: string) {
  return useQuery<ProfilePayload>({
    queryKey: profileKeys.detail(username),
    queryFn: async () => {
      const response = await apiInstance.get<ApiEnvelope<ProfilePayload>>(
        "/user/profile",
        { userName: username },
      );
      return response.data;
    },
  });
}
