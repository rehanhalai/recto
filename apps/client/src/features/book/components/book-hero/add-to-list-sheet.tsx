"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ListPlus } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { useUserLists, useAddToList } from "../../hooks/use-user-lists";

export function AddToListSheet({ bookId }: { bookId: string }) {
  const { isAuthenticated } = useAuth();
  const { userLists, isLoading } = useUserLists();
  const addToListMutation = useAddToList(bookId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" disabled={!isAuthenticated}>
          <ListPlus size={18} className="mr-2" />
          Add to list
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Choose a list</SheetTitle>
          <SheetDescription>
            Add this book to one of your lists.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {userLists.map((list: any) => (
            <Button
              key={list.id}
              variant="outline"
              className="w-full justify-between"
              onClick={() => addToListMutation.mutate(list.id)}
              disabled={addToListMutation.isPending}
            >
              <span className="truncate">{list.name}</span>
              <span className="text-xs text-muted-foreground">
                {list.book_count || 0} books
              </span>
            </Button>
          ))}
          {!isLoading && userLists.length === 0 && (
            <p className="text-sm text-muted-foreground">No lists yet.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
