import { useQuery } from "@tanstack/react-query";

export type FeaturedList = {
  id: string;
  title: string;
  subtitle: string;
  curatorUsername: string;
  bookCount: number;
  covers: string[];
};

/**
 * Returns a hardcoded featured list for now.
 * When a backend endpoint exists for curated lists, this hook
 * should be updated to fetch from it.
 */
export function useFeaturedList(enabled = true) {
  return useQuery<FeaturedList | null>({
    queryKey: ["sidebar", "featured-list"],
    queryFn: async () => {
      // Mock data — replace with API call when the lists endpoint exists
      return {
        id: "featured-1",
        title: "Essential Reads of 2026",
        subtitle: "A curated collection",
        curatorUsername: "recto",
        bookCount: 12,
        covers: [],
      };
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
