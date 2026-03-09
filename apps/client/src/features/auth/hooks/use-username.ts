"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface GenerateUsernameResponse {
  username: string;
}

export const useGenerateUsername = () => {
  return useQuery({
    queryKey: ["generateUsername"],
    queryFn: async () => {
      const response = await apiClient.get<GenerateUsernameResponse>(
        "/user/generate-username",
      );
      return response;
    },
    enabled: false, // Manual trigger only
    retry: false,
  });
};
