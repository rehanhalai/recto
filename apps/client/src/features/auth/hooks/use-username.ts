"use client";

import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

interface GenerateUsernameResponse {
  username: string;
}

interface ApiEnvelope<T> {
  data: T;
}

export const useGenerateUsername = () => {
  return useQuery({
    queryKey: ["generateUsername"],
    queryFn: async () => {
      const response = await apiInstance.get<
        GenerateUsernameResponse | ApiEnvelope<GenerateUsernameResponse>
      >("/user/generate-username");

      if ("data" in response) {
        return response.data;
      }

      return response;
    },
    enabled: false, // Manual trigger only
    retry: false,
  });
};
