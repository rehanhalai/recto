import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

export interface AffiliateLink {
  name: string;
  url: string;
  platform: string;
}

export interface AffiliateLinksResponse {
  bookId: string;
  links: Record<string, AffiliateLink>;
  message?: string;
}

export function useBookAffiliateLinks(bookId?: string, country = "IN") {
  return useQuery<AffiliateLinksResponse>({
    queryKey: ["book-affiliate-links", bookId, country],
    queryFn: async () =>
      apiInstance.get<AffiliateLinksResponse>(
        `/book/affiliate-links/${bookId}`,
        {
          country,
        },
      ),
    enabled: Boolean(bookId),
    staleTime: 1000 * 60 * 5,
  });
}
