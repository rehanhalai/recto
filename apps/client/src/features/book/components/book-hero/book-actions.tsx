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

  const getPrimaryProps = () => {
    switch (currentStatus) {
      case "reading":
        return { label: "Reading ✓", weight: "fill" as const };
      case "wishlist":
        return { label: "Added to wishlist ✓", weight: "fill" as const };
      case "finished":
        return { label: "Completed reading ✓", weight: "fill" as const };
      default:
        return { label: "Start Reading", weight: "bold" as const };
    }
  };

  const { label, weight } = getPrimaryProps();

  return (
    <div className="mt-2 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4 sm:rounded-2xl sm:border sm:border-border-subtle/60 sm:bg-card/40 sm:p-3 sm:shadow-sm sm:backdrop-blur-md">
      <Button
        className={
          currentStatus
            ? "group flex-1 justify-center bg-muted text-foreground shadow-sm transition-all duration-300 hover:bg-muted/80 sm:flex-none sm:px-6 sm:hover:scale-[1.02] active:scale-[0.98]"
            : "group flex-1 justify-center bg-accent text-accent-foreground shadow-md shadow-accent/20 transition-all duration-300 hover:bg-accent/90 sm:flex-none sm:px-6 sm:hover:-translate-y-0.5 sm:hover:shadow-lg sm:hover:shadow-accent/30 active:translate-y-0"
        }
        onClick={() => upsertTracker.mutate("reading")}
        disabled={!isAuthenticated || isPending}
      >
        <BookOpen
          size={18}
          className="mr-2 transition-transform duration-300 group-hover:scale-110"
          weight={weight}
        />
        <span className="font-medium tracking-wide">{label}</span>
      </Button>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:items-center sm:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="group w-full bg-muted/60 border-border-subtle/40 shadow-sm transition-all duration-300 hover:bg-muted hover:shadow-md sm:w-auto sm:hover:-translate-y-0.5 active:translate-y-0"
              disabled={!isAuthenticated || isPending}
            >
              <BookmarkSimple
                size={18}
                className="mr-2 text-ink-muted transition-colors group-hover:text-foreground"
                weight={
                  currentStatus && currentStatus !== "reading"
                    ? "fill"
                    : "regular"
                }
              />
              Shelf
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" sideOffset={8}>
            <DropdownMenuItem
              onClick={() => upsertTracker.mutate("wishlist")}
              className="cursor-pointer"
            >
              Want to Read
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => upsertTracker.mutate("reading")}
              className="cursor-pointer"
            >
              Currently Reading
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => upsertTracker.mutate("finished")}
              className="cursor-pointer"
            >
              Finished Reading
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddToListSheet
          bookId={bookId}
          className="group w-full bg-muted/60 border-border-subtle/40 shadow-sm transition-all duration-300 hover:bg-muted hover:shadow-md sm:w-auto sm:hover:-translate-y-0.5 active:translate-y-0"
        />

        <div className="hidden sm:block sm:flex-1" />

        <Button
          variant="ghost"
          onClick={handleShare}
          className="col-span-2 sm:col-span-1 justify-center border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted inline-flex transition-all duration-300 sm:w-10 sm:px-0 sm:hover:rotate-12 sm:hover:scale-110 sm:rounded-full"
          title="Share book"
        >
          <Export size={18} />
          <span className="ml-2 sm:hidden">Share this book</span>
        </Button>
      </div>
    </div>
  );
}
