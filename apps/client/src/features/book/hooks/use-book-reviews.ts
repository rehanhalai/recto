import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

import { BookReviewWithRelations } from "@recto/types";

export type BookReview = BookReviewWithRelations;

interface ReviewsPage {
  reviews: BookReview[];
  userHasReviewed: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasMore: boolean;
  };
  message?: string;
}

export function useBookReviews(bookId?: string, limit = 6) {
  return useInfiniteQuery<ReviewsPage>({
    queryKey: ["book-reviews", bookId, limit],
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === "number" ? pageParam : 1;
      return apiInstance.get<ReviewsPage>(`/reviews/${bookId}`, {
        page,
        limit,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.currentPage + 1
        : undefined,
    enabled: Boolean(bookId),
    staleTime: 1000 * 30,
  });
}

export function useCreateReview(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { rating: number; content?: string }) =>
      apiInstance.post("/reviews/add", {
        bookId,
        rating: payload.rating,
        content: payload.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-reviews", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book-stats", bookId] });
    },
  });
}

export function useUpdateReview(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      reviewId: string;
      rating?: number;
      content?: string;
    }) => apiInstance.patch(`/reviews/${payload.reviewId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["book-reviews", bookId] });
      queryClient.invalidateQueries({ queryKey: ["book-stats", bookId] });
    },
  });
}
