import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useAuth } from "@/features/auth";

import { ReadingStatus, AddedBookWithRelations } from "@recto/types";

export type TrackerStatus = `${ReadingStatus}`;
export type TrackerEntry = AddedBookWithRelations;

export function useBookTracker(bookId: string) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [optimisticStatus, setOptimisticStatus] = useState<TrackerStatus | null>(null);

  const trackersQuery = useQuery<{ data: TrackerEntry[] } | TrackerEntry[]> ({
    queryKey: ["book-tracker-status", bookId],
    queryFn: async () => {
      const [wishlist, reading, finished] = await Promise.all([
        apiInstance.get<{ data: TrackerEntry[] } | TrackerEntry[]>("/tracker", {
          status: "wishlist",
        }),
        apiInstance.get<{ data: TrackerEntry[] } | TrackerEntry[]>("/tracker", {
          status: "reading",
        }),
        apiInstance.get<{ data: TrackerEntry[] } | TrackerEntry[]>("/tracker", {
          status: "finished",
        }),
      ]);

      const normalize = (res: { data: TrackerEntry[] } | TrackerEntry[]) =>
        Array.isArray(res) ? res : (res.data ?? []);

      return {
        data: [
          ...normalize(wishlist),
          ...normalize(reading),
          ...normalize(finished),
        ],
      };
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const entry = (
    Array.isArray(trackersQuery.data)
      ? trackersQuery.data
      : (trackersQuery.data?.data ?? [])
  ).find((item) => item.bookId === bookId);

  const currentStatus = optimisticStatus ?? entry?.status ?? null;

  const upsertTracker = useMutation({
    mutationFn: async (status: TrackerStatus) => {
      return apiInstance.post("/tracker/tbrbook", {
        bookId,
        status,
      });
    },
    onMutate: async (status) => {
      setOptimisticStatus(status);
      return { previousStatus: currentStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["book-tracker-status", bookId],
      });
      toast.success("Shelf updated");
    },
    onError: (_error, _status, context) => {
      setOptimisticStatus(context?.previousStatus ?? null);
      toast.error("Could not update shelf");
    },
    onSettled: () => {
      setOptimisticStatus(null);
    },
  });

  return {
    currentStatus,
    upsertTracker,
    isLoading: trackersQuery.isLoading,
  };
}
