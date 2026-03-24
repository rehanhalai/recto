"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ListPlus, Plus, Check } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { useUserLists, useAddToList, useCreateList } from "../../hooks/use-user-lists";

export function AddToListSheet({ bookId, className }: { bookId: string; className?: string }) {
  const { isAuthenticated } = useAuth();
  const { userLists, isLoading } = useUserLists();
  const addToListMutation = useAddToList(bookId);
  const createListMutation = useCreateList(bookId);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createListMutation.mutate(
      { name: newName.trim(), description: newDescription.trim() || undefined, is_public: isPublic },
      {
        onSuccess: () => {
          setNewName("");
          setNewDescription("");
          setIsPublic(false);
          setShowCreate(false);
        },
      },
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={className} disabled={!isAuthenticated}>
          <ListPlus size={18} className="mr-2 text-ink-muted transition-colors group-hover:text-foreground" />
          Add to list
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Choose a list</SheetTitle>
          <SheetDescription>
            Add this book to one of your lists, or create a new one.
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
          {!isLoading && userLists.length === 0 && !showCreate && (
            <p className="text-sm text-muted-foreground">No lists yet. Create one below!</p>
          )}

          {showCreate ? (
            <div className="mt-3 space-y-3 rounded-lg border border-border-subtle/70 bg-muted/30 p-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="List name"
                className="w-full rounded-md border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full rounded-md border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring min-h-16 resize-none"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                Make this list public
              </label>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createListMutation.isPending}
                  className="flex-1"
                >
                  <Check size={16} className="mr-1" />
                  {createListMutation.isPending ? "Creating..." : "Create & add book"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full mt-2 border-dashed"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={16} className="mr-2" />
              Create new list
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
