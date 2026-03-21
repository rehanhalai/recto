"use client";

import { useTrendingBooks } from "../../hooks/useTrendingBooks";
import { BookCarouselStrip } from "./book-carousel-strip";

export function TrendingBooksStrip() {
  const { data: books, isLoading } = useTrendingBooks(8);

  return (
    <BookCarouselStrip
      title="Trending Books"
      subtitle="Currently popular"
      href="/books"
      books={books}
      isLoading={isLoading}
    />
  );
}
