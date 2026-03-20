import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export type CurrentRead =
  | {
      userId: string;
      bookId: string;
      createdAt: string;
      finishedAt: string;
      id: string;
      startedAt: string;
      status: string;
      updatedAt: string;
      book: {
        id: string;
        title: string;
        coverImage: string | null;
        authors: { authorName: string }[];
      };
    }[]
  | null;

export function useCurrentRead() {
  return useQuery<CurrentRead>({
    queryKey: ["feed", "current-read"],
    queryFn: async () => {
      const response = await apiInstance.get<{
        data: CurrentRead;
        message: string;
      }>("/user/me/current-read");
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
