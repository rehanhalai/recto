"use client";

import { BookDetail } from "@/features/book";

export default function BookDetailClient({
  workId,
  title,
  authors,
}: {
  workId: string;
  title: string;
  authors?: string[];
}) {
  return <BookDetail workId={workId} title={title} authors={authors} />;
}
