"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Book } from "../../types";
import { Export, Share } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { BookOverview } from "./book-overview";
import { BookReviews } from "../book-reviews/book-reviews";
import { toast } from "@/lib/toast";

export function BookTabs({ book }: { book: Book }) {
  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `Check out ${book.title} on Recto`,
      url: window.location.href,
    };

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Copied to clipboard!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Could not share");
      }
    }
  };

  return (
    <section className="mt-8 border-t border-border-subtle/30 pt-0">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between border-b border-border-subtle/30 px-2 sm:px-0">
          <TabsList className="h-auto bg-transparent p-0 gap-4">
            <TabsTrigger
              value="overview"
              className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-2 font-serif text-lg font-medium text-ink-muted data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none transition-all hover:text-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="relative h-14 rounded-none border-b-2 border-transparent bg-transparent px-2 font-serif text-lg font-medium text-ink-muted data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none transition-all hover:text-foreground"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="mt-2 h-9 w-max gap-2 text-ink-muted hover:text-foreground hover:bg-transparent px-0 transition-colors"
          >
            <Export size={16} />
            <span className="hidden sm:block text-sm font-serif italic">
              Share this book
            </span>
          </Button>
        </div>

        <div className="mt-8 px-2 sm:px-0">
          <TabsContent value="overview">
            <BookOverview book={book} />
          </TabsContent>

          <TabsContent value="reviews">
            <BookReviews bookId={book.id} />
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
