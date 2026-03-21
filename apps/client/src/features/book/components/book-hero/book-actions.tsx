"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, BookmarkSimple, Export } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth";
import { toast } from "@/lib/toast";
import { useBookTracker } from "../../hooks/use-book-tracker";
import { AddToListSheet } from "./add-to-list-sheet";

export function BookActions({ bookId }: { bookId: string }) {
  const { isAuthenticated } = useAuth();
  const { currentStatus, upsertTracker, isLoading } = useBookTracker(bookId);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Copied!");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const isPending = upsertTracker.isPending || isLoading;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button
        className={
          currentStatus === "reading"
            ? "bg-muted text-foreground hover:bg-muted"
            : "bg-accent text-accent-foreground hover:bg-accent/90"
        }
        onClick={() => upsertTracker.mutate("reading")}
        disabled={!isAuthenticated || isPending}
      >
        <BookOpen size={18} className="mr-2" />
        {currentStatus === "reading" ? "Currently reading ✓" : "Mark as reading"}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={!isAuthenticated || isPending}>
            <BookmarkSimple size={18} className="mr-2" />
            Add to shelf
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem onClick={() => upsertTracker.mutate("wishlist")}>
            Want to Read
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => upsertTracker.mutate("reading")}>
            Currently Reading
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => upsertTracker.mutate("finished")}>
            Read
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddToListSheet bookId={bookId} />

      <Button
        variant="outline"
        onClick={handleShare}
        className="sm:justify-center"
      >
        <Export size={18} />
        <span className="ml-2 sm:sr-only">Share</span>
      </Button>
    </div>
  );
}
