"use client";

import { useInfiniteSearch } from "../api/search";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

export function SearchListsTab({ query }: { query: string }) {
  const { ref, inView } = useInView({ rootMargin: "400px" });
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch(query, "lists", 9);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading)
    return <div className="animate-pulse h-64 bg-card-surface/50 rounded-xl" />;

  const lists = data?.pages.flatMap((page: any) => page.lists) || [];

  if (!lists.length) {
    return (
      <div className="text-center py-20 text-ink-muted">
        No lists found for "{query}".
      </div>
    );
  }

  return (
    <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map((list: any, i: number) => (
          <Link
            href={`/lists/${list.id}`}
            key={`${list.id}-${i}`}
            className="group p-5 rounded-xl bg-card-surface border border-border-subtle hover:border-green-500/50 transition-all hover:shadow-md flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
                  {list.name}
                </h3>
                <p className="text-sm text-ink-muted mt-1 line-clamp-2 min-h-10">
                  {list.description}
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-border-subtle/50 text-ink-muted whitespace-nowrap ml-2">
                {list.book_count || 0} books
              </span>
            </div>
            {list.covers?.length > 0 ? (
              <div className="flex -space-x-3 mt-4 h-20">
                {list.covers.map((c: string, i: number) => (
                  <div
                    key={i}
                    className="w-14 h-20 relative rounded-md overflow-hidden border-2 border-card ring-1 ring-border-subtle shadow-sm z-10 transition-transform group-hover:-translate-y-1"
                    style={{ zIndex: 10 - i, transitionDelay: `${i * 50}ms` }}
                  >
                    <Image src={c} alt="Cover" fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex mt-4 h-20 items-center text-sm text-ink-muted italic">
                Empty list
              </div>
            )}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle/50">
              <Avatar className="w-6 h-6">
                <AvatarImage src={list.user?.avatarImage || ""} />
                <AvatarFallback className="text-[10px] bg-border-subtle text-ink">
                  {list.user?.userName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-ink-muted font-medium">
                @{list.user?.userName}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Infinite scrolling sentinel & Dead End */}
      <div 
        ref={ref} 
        className="h-24 flex flex-col items-center justify-center mt-12 border-t border-border-subtle/50"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            <span className="text-xs text-ink-muted animate-pulse">Loading more lists...</span>
          </div>
        ) : !hasNextPage && lists.length > 0 ? (
          <div className="text-center py-4 px-6 rounded-full bg-card-surface border border-border-subtle text-sm text-ink-muted flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
            <span>End of search results.</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
