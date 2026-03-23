import { BookDetailSkeleton } from "./book-detail-skeleton";
import { BookHero } from "../book-hero/book-hero";
import { BookTabs } from "./book-tabs";
import type { Book } from "../../types";
import { BookDetailResponse, BookResponse } from "@recto/types";

export function BookDetail({ Book }: { Book: Book }) {
  return (
    <div className="space-y-5 pb-8">
      <BookHero book={Book} />
      <BookTabs book={Book} />
    </div>
  );
}
