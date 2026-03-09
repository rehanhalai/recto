import { apiClient } from "@/lib/api-client";
import { ApiResponse, BookList } from "../types";

interface CreateListPayload {
  name: string;
  description?: string;
  is_public?: boolean;
}

interface UpdateListPayload {
  listId: string;
  name?: string;
  description?: string;
  is_public?: boolean;
}

interface AddBookPayload {
  listId: string;
  book_id: string;
}

interface RemoveBookPayload {
  listId: string;
  bookId: string;
}

interface ReorderPayload {
  listId: string;
  bookIds: string[];
}

export const createList = (payload: CreateListPayload) =>
  apiClient.post<ApiResponse<BookList>>("/lists", payload);

export const updateList = (payload: UpdateListPayload) =>
  apiClient.patch<ApiResponse<BookList>>(`/lists/${payload.listId}`, {
    name: payload.name,
    description: payload.description,
    is_public: payload.is_public,
  });

export const deleteList = (listId: string) =>
  apiClient.delete<ApiResponse<null>>(`/lists/${listId}`);

export const addBookToList = (payload: AddBookPayload) =>
  apiClient.post<ApiResponse<BookList>>(`/lists/${payload.listId}/books`, {
    book_id: payload.book_id,
  });

export const removeBookFromList = (payload: RemoveBookPayload) =>
  apiClient.delete<ApiResponse<BookList>>(
    `/lists/${payload.listId}/books/${payload.bookId}`,
  );

export const reorderBooks = (payload: ReorderPayload) =>
  apiClient.patch<ApiResponse<BookList>>(`/lists/${payload.listId}/reorder`, {
    bookIds: payload.bookIds,
  });

export const getUserLists = () =>
  apiClient.get<ApiResponse<BookList[]>>("/lists/user/my-lists");

export const getPublicLists = (params?: { limit?: number; skip?: number }) =>
  apiClient.get<ApiResponse<BookList[]>>(
    "/lists/public" +
      (params
        ? "?" +
          new URLSearchParams({
            ...(params.limit ? { limit: String(params.limit) } : {}),
            ...(params.skip ? { skip: String(params.skip) } : {}),
          }).toString()
        : ""),
  );
