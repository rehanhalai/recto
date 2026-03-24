import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export interface AffiliateLink {
  name: string;
  url: string;
  platform: string;
}

export interface AffiliateLinksResponse {
  data: {
    bookId: string;
    links: Record<string, AffiliateLink>;
  };
  message?: string;
}

export function useBookAffiliateLinks(
  bookId?: string,
  country = "IN",
  enabled = true,
) {
  return useQuery<AffiliateLinksResponse>({
    queryKey: ["book-affiliate-links", bookId, country],
    queryFn: async () =>
      apiInstance.get<AffiliateLinksResponse>(
        `/book/affiliate-links/${bookId}`,
      ),
    enabled: Boolean(bookId) && enabled,
    staleTime: 1000 * 60 * 5,
  });
}
