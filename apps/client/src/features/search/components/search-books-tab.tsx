"use client";

import { useInfiniteSearch } from "../api/search";
import { BookCard } from "@/features/book/components/book-strips/book-card";
import { deduplicateByKey } from "@/lib/deduplicate";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

export function SearchBooksTab({ query }: { query: string }) {
  const { ref, inView } = useInView({ rootMargin: "600px" });
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch(query, "books", 12);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-card-surface/50 rounded-xl" />
      </div>
    );

  const allBooks = data?.pages.flatMap((page: any) => page.books) || [];
  const books = deduplicateByKey(allBooks, (b: any) => b.sourceId || b.id);

  if (!books.length) {
    return (
      <div className="text-center py-20 text-ink-muted">
        No books found for "{query}".
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Result count */}
      <p className="text-sm text-ink-muted mb-6">
        Showing <span className="font-semibold text-ink">{books.length}</span> results for "<span className="text-ink">{query}</span>"
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {books.map((book: any, i: number) => (
          <BookCard key={`${book.id}-${i}`} book={book} featured={i === 0} />
        ))}
      </div>

      {/* Infinite scrolling sentinel & Dead End */}
      <div 
        ref={ref} 
        className="h-24 flex flex-col items-center justify-center mt-12 border-t border-border-subtle/50"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
            <span className="text-xs text-ink-muted animate-pulse">Fetching more books...</span>
          </div>
        ) : !hasNextPage && books.length > 0 ? (
          <div className="text-center py-4 px-6 rounded-full bg-card-surface border border-border-subtle text-sm text-ink-muted flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
            <span>You've reached the end of the results.</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
