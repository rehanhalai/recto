import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useAuth } from "@/features/auth";
import { addBookToList, createList, getUserLists } from "../service/list-api";

export function useUserLists() {
  const { isAuthenticated } = useAuth();

  const userListsQuery = useQuery({
    queryKey: ["user-lists"],
    queryFn: getUserLists,
    enabled: isAuthenticated,
  });

  return {
    userLists: userListsQuery.data?.data ?? [],
    isLoading: userListsQuery.isLoading,
  };
}

export function useAddToList(bookId: string) {
  return useMutation({
    mutationFn: async (listId: string) =>
      addBookToList({ listId, book_id: bookId }),
    onSuccess: () => toast.success("Added to list"),
    onError: () => toast.error("Could not add to list"),
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
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("List created & book added");
    },
    onError: () => toast.error("Could not create list"),
  });
}
