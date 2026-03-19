import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export type CurrentRead = {
  book: {
    id: string;
    title: string;
    coverImage: string | null;
    authors: { authorName: string }[];
  };
} | null;

export function useCurrentRead() {
  return useQuery<CurrentRead>({
    queryKey: ["feed", "current-read"],
    queryFn: () => apiInstance.get<CurrentRead>("/users/me/current-read"),
    staleTime: 1000 * 60 * 2,
  });
}
