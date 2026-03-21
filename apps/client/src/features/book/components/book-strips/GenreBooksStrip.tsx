"use client";

import { useGenreBooks } from "../../hooks/useGenreBooks";
import { BookCarouselStrip } from "./book-carousel-strip";

interface GenreBooksStripProps {
  genre: string;
  title: string;
  subtitle: string;
}

export function GenreBooksStrip({
  genre,
  title,
  subtitle,
}: GenreBooksStripProps) {
  const { data: books, isLoading } = useGenreBooks(genre, 8);

  return (
    <BookCarouselStrip
      title={title}
      subtitle={subtitle}
      href={`/books?q=subject:${encodeURIComponent(genre)}`}
      books={books}
      isLoading={isLoading}
    />
  );
}
