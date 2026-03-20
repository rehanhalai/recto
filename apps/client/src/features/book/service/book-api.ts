import { apiInstance } from "@/lib/api";
import { Book } from "../types";

export const fetchBook = (volumeId: string) =>
  apiInstance.get<Book & { message?: string }>(`/book/${volumeId}`);

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
