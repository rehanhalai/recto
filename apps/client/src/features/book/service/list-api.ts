import { apiFetch } from "@/lib/fetch";
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
  apiFetch<ApiResponse<BookList>>("/lists", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateList = (payload: UpdateListPayload) =>
  apiFetch<ApiResponse<BookList>>(`/lists/${payload.listId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: payload.name,
      description: payload.description,
      is_public: payload.is_public,
    }),
  });

export const deleteList = (listId: string) =>
  apiFetch<ApiResponse<null>>(`/lists/${listId}`, {
    method: "DELETE",
  });

export const addBookToList = (payload: AddBookPayload) =>
  apiFetch<ApiResponse<BookList>>(`/lists/${payload.listId}/books`, {
    method: "POST",
    body: JSON.stringify({
      book_id: payload.book_id,
    }),
  });

export const removeBookFromList = (payload: RemoveBookPayload) =>
  apiFetch<ApiResponse<BookList>>(
    `/lists/${payload.listId}/books/${payload.bookId}`,
    { method: "DELETE" },
  );

export const reorderBooks = (payload: ReorderPayload) =>
  apiFetch<ApiResponse<BookList>>(`/lists/${payload.listId}/reorder`, {
    method: "PATCH",
    body: JSON.stringify({
      bookIds: payload.bookIds,
    }),
  });

export const getUserLists = () =>
  apiFetch<ApiResponse<BookList[]>>("/lists/user/my-lists");

export const getPublicLists = (params?: { limit?: number; skip?: number }) =>
  apiFetch<ApiResponse<BookList[]>>(
    "/lists/public" +
      (params
        ? "?" +
          new URLSearchParams({
            ...(params.limit ? { limit: String(params.limit) } : {}),
            ...(params.skip ? { skip: String(params.skip) } : {}),
          }).toString()
        : ""),
  );
