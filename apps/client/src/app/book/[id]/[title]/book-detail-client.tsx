"use client";

import { BookDetail } from "@/features/book";

export default function BookDetailClient({
  volumeId,
  title,
  authors,
}: {
  volumeId: string;
  title: string;
  authors?: string[];
}) {
  return <BookDetail volumeId={volumeId} title={title} authors={authors} />;
}
