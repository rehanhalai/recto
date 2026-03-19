"use client";

import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

interface GenerateUsernameResponse {
  username: string;
}

export const useGenerateUsername = () => {
  return useQuery({
    queryKey: ["generateUsername"],
    queryFn: async () => {
      const response = await apiInstance.get<GenerateUsernameResponse>(
        "/user/generate-username",
      );
      return response;
    },
    enabled: false, // Manual trigger only
    retry: false,
  });
};
