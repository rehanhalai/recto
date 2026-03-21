"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Book } from "../../types";
import { BookOverview } from "./book-overview";
import { BookReviews } from "../book-reviews/book-reviews";
import { BookLists } from "./book-lists";

export function BookTabs({ book }: { book: Book }) {
  return (
    <section className="rounded-2xl border border-border-subtle/70 bg-card/70 p-4 md:p-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-3 rounded-lg bg-muted/40">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BookOverview book={book} />
        </TabsContent>

        <TabsContent value="reviews">
          <BookReviews bookId={book.id} />
        </TabsContent>

        <TabsContent value="lists">
          <BookLists bookId={book.id} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
