"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  BookmarkSimple,
  Export,
  ShoppingCart,
  CaretDown,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useAuthStore } from "@/features/auth";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  useBookTracker,
  type TrackerStatus,
} from "../../hooks/use-book-tracker";
import { BookListPicker } from "./book-list-picker";
import { BuyBookResponsive } from "./buy-book-responsive";

export function BookActions({ bookId }: { bookId: string }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { currentStatus, hasEntry, upsertTracker, removeTracker, isLoading } =
    useBookTracker(bookId);
  const [showBuy, setShowBuy] = useState(false);

  const isPending =
    upsertTracker.isPending || removeTracker.isPending || isLoading;

  const getPrimaryLabel = () => {
    switch (currentStatus) {
      case "reading":
        return "Currently Reading";
      case "wishlist":
        return "Want to Read";
      case "finished":
        return "Completed";
      default:
        return "Add to shelf";
    }
  };

  const statusItems: Array<{
    id: TrackerStatus;
    label: string;
    color: string;
  }> = [
    { id: "wishlist", label: "Want to read", color: "bg-stone-400" },
    { id: "reading", label: "Currently reading", color: "bg-emerald-500" },
    { id: "finished", label: "Completed", color: "bg-sky-500" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Integrated Shelf Section */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle/50 bg-card/20 shadow-sm transition-all hover:bg-card/40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-14 w-full items-center justify-start gap-4 px-6 text-base font-medium transition-colors hover:bg-transparent"
              disabled={!isAuthenticated || isPending}
            >
              <BookmarkSimple
                size={20}
                className="text-ink-muted"
                weight="bold"
              />
              <span className="flex-1 text-left">{getPrimaryLabel()}</span>
              <div className="h-6 w-px bg-border-subtle/40 mx-2" />
              <CaretDown size={14} className="opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[320px] p-0 overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-card/80 border border-border-subtle/40 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            sideOffset={12}
            align="start"
          >
            <div className="flex flex-col divide-y divide-border-subtle/30">
              {statusItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => upsertTracker.mutate(item.id)}
                  className="flex h-14 cursor-pointer items-center gap-4 px-5 transition-all duration-200 hover:bg-muted/50 focus:bg-muted/60 group"
                >
                  <div
                    className={cn(
                      "h-3.5 w-3.5 rounded-full shadow-sm transition-all duration-300 group-hover:scale-125 group-hover:shadow-md",
                      item.color,
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium transition-all duration-200",
                      currentStatus === item.id
                        ? "text-foreground font-semibold"
                        : "text-ink-muted group-hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  {currentStatus === item.id && (
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </DropdownMenuItem>
              ))}
              {currentStatus && hasEntry && (
                <DropdownMenuItem
                  onClick={() => removeTracker.mutate()}
                  disabled={removeTracker.isPending}
                  className="flex h-14 cursor-pointer items-center gap-4 px-5 transition-all duration-200 hover:bg-red-500/10 focus:bg-red-500/15 group"
                >
                  <div
                    className={cn(
                      "h-3.5 w-3.5 rounded-full shadow-sm",
                      removeTracker.isPending
                        ? "bg-red-500/70 animate-pulse"
                        : "bg-red-500/40",
                    )}
                  />
                  <span className="flex-1 text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-all duration-200">
                    {removeTracker.isPending
                      ? "Removing..."
                      : "Remove from shelf"}
                  </span>
                </DropdownMenuItem>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Secondary Actions: Add to List & Buy */}
      <div className="flex items-stretch gap-3">
        <BookListPicker
          bookId={bookId}
          className="flex-1 h-12 gap-3.5 rounded-2xl border-border-subtle/50 bg-card/20 hover:bg-card/40 text-sm font-medium transition-all shadow-sm justify-start px-6"
        />

        {showBuy ? (
          <BuyBookResponsive
            bookId={bookId}
            className="flex-1 h-12 gap-3.5 rounded-2xl border-border-subtle/50 bg-card/20 hover:bg-card/40 text-sm font-medium transition-all shadow-sm justify-start px-6"
          />
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowBuy(true)}
            className="flex-1 h-12 gap-3.5 rounded-2xl border-border-subtle/50 bg-card/20 hover:bg-card/40 text-sm font-medium transition-all shadow-sm justify-start px-6 group"
          >
            <ShoppingCart
              size={18}
              className="text-ink-muted opacity-70 group-hover:rotate-12 transition-transform"
            />
            <span>Buy</span>
          </Button>
        )}
      </div>
    </div>
  );
}
