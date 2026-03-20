import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";
import { ReadingStatus } from "@recto/types";

type CurrentReadItem = {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  finishedAt: string;
  startedAt: string;
  status: ReadingStatus;
  updatedAt: string;
  book: {
    id: string;
    title: string;
    authors: string[];
    coverImage: string | null;
    sourceId: string;
  };
};

export type CurrentRead = CurrentReadItem[] | null;

export function useCurrentRead() {
  return useQuery<CurrentRead>({
    queryKey: ["feed", "current-read"],
    queryFn: async () => {
      const response = await apiInstance.get<{
        data: CurrentRead;
        message: string;
      }>("/tracker", { status: "reading" });

      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
