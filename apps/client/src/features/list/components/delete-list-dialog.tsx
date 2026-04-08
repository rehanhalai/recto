"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";
import { deleteList } from "../api/delete-list";

type DeleteListDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: {
    id: string;
    name: string;
  };
};

export function DeleteListDialog({
  open,
  onOpenChange,
  list,
}: DeleteListDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteListMutation = useMutation({
    mutationFn: async () => {
      return deleteList(list.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("List deleted successfully");
      router.push("/");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to delete list";
      toast.error(message);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl border border-border-subtle bg-paper">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-ink">
            Delete List
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-muted">
            Are you sure you want to delete{" "}
            <strong className="text-ink">{list.name}</strong>? This action
            cannot be undone and will remove all books from this list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteListMutation.mutate()}
            disabled={deleteListMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteListMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
