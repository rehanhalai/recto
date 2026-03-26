import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/features/auth";
import { addBookToList, createList, getUserLists } from "../service/list-api";

import { removeBookFromList } from "../service/list-api";

export function useUserLists(bookId?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const userListsQuery = useQuery({
    queryKey: ["user-lists", bookId],
    queryFn: () => getUserLists(bookId),
    enabled: isAuthenticated,
  });

  return {
    userLists: userListsQuery.data?.data ?? [],
    isLoading: userListsQuery.isLoading,
    refetch: userListsQuery.refetch,
  };
}

export function useAddToList(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) =>
      addBookToList({ listId, book_id: bookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists", bookId] });
      toast.success("Added to list");
    },
    onError: () => toast.error("Could not add to list"),
  });
}

export function useRemoveFromList(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) =>
      removeBookFromList({ listId, bookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists", bookId] });
      toast.success("Removed from list");
    },
    onError: () => toast.error("Could not remove from list"),
  });
}

export function useCreateList(bookId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      is_public?: boolean;
    }) => {
      const res = await createList(payload);
      const newList = (res as any)?.data ?? res;

      // Auto-add the current book to the new list if bookId provided
      if (bookId && newList?.id) {
        await addBookToList({ listId: newList.id, book_id: bookId });
      }

      return newList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists", bookId] });
      toast.success("List created");
    },
    onError: () => toast.error("Could not create list"),
  });
}
