import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useAuth } from "@/features/auth";
import { addBookToList, getUserLists } from "../service/list-api";

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
