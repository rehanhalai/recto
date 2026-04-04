import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { profileKeys } from "../query-keys";
import type { ApiEnvelope, TrackerEntry } from "../types";

export function useReadingStatus(
  userId: string | undefined,
  status: "reading" | "finished",
  enabled: boolean = true,
) {
  return useQuery<TrackerEntry[]>({
    queryKey: profileKeys.readingByStatus(userId || "", status),
    queryFn: async () => {
      const response = await apiInstance.get<ApiEnvelope<TrackerEntry[]>>(
        `/tracker/user/${userId}`,
        { status },
      );
      return response.data;
    },
    enabled: Boolean(userId && enabled),
  });
}
