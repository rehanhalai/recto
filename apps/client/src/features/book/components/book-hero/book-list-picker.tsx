"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPlus,
  Plus,
  Check,
  MagnifyingGlass,
  PlusCircle,
  Archive,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/features/auth";
import {
  useUserLists,
  useAddToList,
  useRemoveFromList,
  useCreateList,
} from "../../hooks/use-user-lists";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";

interface BookListPickerProps {
  bookId: string;
  className?: string;
}

export function BookListPicker({ bookId, className }: BookListPickerProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { userLists, isLoading } = useUserLists(bookId);
  const addToListMutation = useAddToList(bookId);
  const removeFromListMutation = useRemoveFromList(bookId);
  const createListMutation = useCreateList(bookId);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const filteredLists = useMemo(() => {
    return userLists.filter((list: any) =>
      list.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [userLists, search]);

  const handleToggle = (listId: string, isIncluded: boolean) => {
    if (isIncluded) {
      removeFromListMutation.mutate(listId);
    } else {
      addToListMutation.mutate(listId);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createListMutation.mutate(
      { name: newName.trim(), is_public: false },
      {
        onSuccess: () => {
          setNewName("");
          setShowCreate(false);
        },
      },
    );
  };

  const Content = (
    <div className="flex flex-col h-full max-h-[80vh]">
      <div className="space-y-4 pb-4">
        <div className="relative">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            size={18}
          />
          <Input
            placeholder="Search your lists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-muted/20 border-border-subtle/50 rounded-xl"
          />
        </div>

        {!showCreate ? (
          <Button
            variant="ghost"
            onClick={() => setShowCreate(true)}
            className="w-full justify-start h-12 gap-3 px-3 hover:bg-muted/40 rounded-xl text-ink-muted hover:text-foreground group"
          >
            <PlusCircle
              size={22}
              className="text-accent group-hover:scale-110 transition-transform"
            />
            <span className="font-medium">Create new list</span>
          </Button>
        ) : (
          <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Input
              autoFocus
              placeholder="Name your list..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-11 bg-background border-accent/30 focus-visible:ring-accent/20 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || createListMutation.isPending}
              className="h-11 px-4 bg-accent hover:bg-accent/90 text-black rounded-xl"
            >
              <Check weight="bold" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setNewName("");
              }}
              className="h-11 px-4 rounded-xl"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2 h-full min-h-75">
        <div className="space-y-1 py-2">
          {isLoading ? (
            <div className="py-10 text-center text-ink-muted/50 text-sm">
              Loading your collections...
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Archive size={32} className="mx-auto text-ink-muted/30" />
              <p className="text-ink-muted text-sm">No lists found</p>
            </div>
          ) : (
            filteredLists.map((list: any) => (
              <button
                key={list.id}
                onClick={() => handleToggle(list.id, list.is_included)}
                disabled={
                  addToListMutation.isPending ||
                  removeFromListMutation.isPending
                }
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                  list.is_included
                    ? "bg-accent/5 hover:bg-accent/10"
                    : "hover:bg-muted/40",
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border-subtle/50 shrink-0">
                  {list.covers?.[0] ? (
                    <img
                      src={list.covers[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Archive size={20} className="text-ink-muted/40" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {list.name}
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    {list.book_count || 0} books
                  </p>
                </div>
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                    list.is_included
                      ? "bg-accent border-accent text-white scale-110"
                      : "border-border-subtle group-hover:border-accent/50",
                  )}
                >
                  {list.is_included && <Check size={14} weight="bold" />}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const sharedHeader = (
    <>
      <div className="font-serif italic text-accent text-sm mb-1 tracking-wider uppercase">
        Collections
      </div>
      <div className="text-2xl font-serif text-foreground">Add to list</div>
      <p className="text-ink-muted text-sm mt-1">
        Organize your library by adding this book to your personal collections.
      </p>
    </>
  );

  const trigger = (
    <Button variant="outline" className={className} disabled={!isAuthenticated}>
      <ListPlus
        size={18}
        className="mr-2 text-ink-muted transition-colors group-hover:text-foreground"
      />
      Add to list
    </Button>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-105 p-5 gap-5 rounded-3xl border-border-subtle/60 shadow-2xl bg-paper/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="text-left space-y-0 px-1">
            {sharedHeader}
          </DialogHeader>
          <div className="px-1 flex flex-col h-full overflow-hidden">
            {Content}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] p-6 rounded-t-3xl border-border-subtle/60 bg-paper/95 backdrop-blur-xl"
      >
        <SheetHeader className="text-left space-y-0 mb-6">
          {sharedHeader}
        </SheetHeader>
        <div className="flex-1 overflow-hidden h-full">{Content}</div>
      </SheetContent>
    </Sheet>
  );
}
