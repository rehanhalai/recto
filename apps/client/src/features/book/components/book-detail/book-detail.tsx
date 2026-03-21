"use client";

import { BookDetailSkeleton } from "./book-detail-skeleton";
import { useBookByCard } from "../../hooks/useBook";
import { BookHero } from "../book-hero/book-hero";
import { BookTabs } from "./book-tabs";
import type { Book } from "../../types";

interface BookDetailProps {
  volumeId: string;
  title: string;
  authors?: string[];
  initialBook?: Book | null;
}

export function BookDetail({
  volumeId,
  authors,
  initialBook,
}: BookDetailProps) {
  const {
    data: currentBook,
    isLoading,
    isError,
    error,
  } = useBookByCard({ volumeId, initialData: initialBook ?? undefined });

  if (isLoading && !currentBook) {
    return <BookDetailSkeleton />;
  }

  if (isError && !currentBook) {
    return (
      <div className="rounded-xl border border-border-subtle bg-card/60 p-10 text-center">
        <p className="text-lg font-semibold text-foreground">
          Unable to load book
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!currentBook) {
    return (
      <div className="rounded-xl border border-border-subtle bg-card/60 p-10 text-center text-muted-foreground">
        Book not found
      </div>
    );
  }

  const fallbackAuthor = authors?.[0];

  return (
    <div className="space-y-5 pb-8">
      <BookHero book={currentBook} fallbackAuthor={fallbackAuthor} />
      <BookTabs book={currentBook} />
    </div>
  );
}
