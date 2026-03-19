"use client";

import { FeedSection } from "@/features/feed/components/FeedSection";
import { useTrendingBooks } from "../hooks/useTrendingBooks";
import { TrendingBookCard } from "./TrendingBookCard";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendingBooksStrip() {
  const { data: books, isLoading } = useTrendingBooks(6);

  return (
    <FeedSection
      title="Trending Books"
      href="/books"
      isLoading={isLoading}
      skeleton={
        <div className="h-32 w-full bg-border-subtle/10 rounded-lg animate-pulse" />
      }
    >
      {books?.map((book) => (
        <TrendingBookCard key={book.id} book={book} />
      ))}
    </FeedSection>
  );
}
