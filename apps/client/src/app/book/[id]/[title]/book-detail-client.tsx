"use client";

import { BookDetail } from "@/features/book";
import type { Book } from "@/features/book/types";

export default function BookDetailClient({
  volumeId,
  title,
  authors,
  initialBook,
}: {
  volumeId: string;
  title: string;
  authors?: string[];
  initialBook?: Book | null;
}) {
  return (
    <BookDetail
      volumeId={volumeId}
      title={title}
      authors={authors}
      initialBook={initialBook}
    />
  );
}
