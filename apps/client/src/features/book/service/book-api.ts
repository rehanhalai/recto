import { apiInstance } from "@/lib/api";
import { config } from "@/config";
import { Book } from "../types";
import { cache } from "react";

export const fetchBook = (volumeId: string) =>
  apiInstance.get<Book & { message?: string }>(`/book/${volumeId}`);

// Server-side fetch memoized per request to avoid duplicate calls from
// generateMetadata + page for the same id.
export const fetchBookSSR = cache(
  async (volumeId: string): Promise<Book | null> => {
    try {
      const response = await fetch(
        `${config.apiUrl}/book/${encodeURIComponent(volumeId)}`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        },
      );

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as Book & { data?: Book };
      return data?.data ?? data;
    } catch {
      return null;
    }
  },
);

export function getFirstAuthor(book: Book | null) {
  if (
    !book?.authors ||
    !Array.isArray(book.authors) ||
    book.authors.length === 0
  ) {
    return undefined;
  }

  const author = book.authors[0];
  return typeof author === "string" ? author : author?.authorName;
}

export function stripTags(text: string) {
  return text.replace(/<[^>]+>/g, "").trim();
}

// export const searchBooks = (params: SearchBooksParams) =>
//   apiClient.get<
//     ApiResponse<{ results: Book[]; pagination: SearchResponse["pagination"] }>
//   >(
//     "/books/search?" +
//       new URLSearchParams({
//         ...(params.title ? { title: params.title } : {}),
//         ...(params.genre ? { genre: params.genre } : {}),
//         ...(params.sort ? { sort: params.sort } : {}),
//         ...(params.order ? { order: params.order } : {}),
//         ...(params.page ? { page: String(params.page) } : {}),
//         ...(params.limit ? { limit: String(params.limit) } : {}),
//       }).toString(),
//   );

// export const searchBooksByAuthor = (params: SearchByAuthorParams) =>
//   apiClient.get<ApiResponse<AuthorSearchResponse>>(
//     "/books/search/author?" +
//       new URLSearchParams({
//         author: params.author,
//         ...(params.page ? { page: String(params.page) } : {}),
//         ...(params.limit ? { limit: String(params.limit) } : {}),
//       }).toString(),
//   );

// export const getPurchaseLinks = (bookId: string) =>
//   apiClient.get<
//     ApiResponse<{ allLinks: Record<string, { title: string; url: string }[]> }>
//   >(`/books/purchase-links/${bookId}`, {
//     requiresAuth: false,
//     maxRetries: 3,
//     retryDelayMs: 1000,
//   });

// export const setUserBookStatus = (payload: SetStatusPayload) =>
//   apiClient.post<ApiResponse<UserBook>>("/books/tbrbook", payload);

// export const removeUserBook = (tbrId: string) =>
//   apiClient.delete<ApiResponse<null>>(`/books/tbrbook/${tbrId}`);

// export const fetchUserBooks = (status: UserBookStatus) =>
//   apiClient.get<ApiResponse<UserBook[]>>(
//     `/books/fetch-user-books?status=${status}`,
//     { maxRetries: 3, retryDelayMs: 1000 },
//   );

// export const getReviews = (bookId: string) =>
//   apiClient.get<ApiResponse<Review[]>>(`/books/reviews/${bookId}`, {
//     maxRetries: 3,
//     retryDelayMs: 1000,
//   });

// export const addReview = (payload: AddReviewPayload) =>
//   apiClient.post<ApiResponse<Review>>("/books/reviews/add", payload);

// export const updateReview = (payload: UpdateReviewPayload) =>
//   apiClient.patch<ApiResponse<Review>>(
//     `/books/reviews/${payload.reviewId}`,
//     payload,
//   );

// export const deleteReview = (reviewId: string) =>
//   apiClient.delete<ApiResponse<null>>(`/books/reviews/${reviewId}`);
