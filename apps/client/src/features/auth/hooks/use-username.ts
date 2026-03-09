"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";

interface GenerateUsernameResponse {
  username: string;
}

export const useGenerateUsername = () => {
  return useQuery({
    queryKey: ["generateUsername"],
    queryFn: async () => {
      const response = await apiFetch<GenerateUsernameResponse>(
        "/user/generate-username",
      );
      return response;
    },
    enabled: false, // Manual trigger only
    retry: false,
  });
};
