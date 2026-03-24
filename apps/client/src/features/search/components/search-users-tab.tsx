"use client";

import { useInfiniteSearch } from "../api/search";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";

export function SearchUsersTab({ query }: { query: string }) {
  const { ref, inView } = useInView({ rootMargin: "400px" });
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch(query, "users", 15);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading)
    return <div className="animate-pulse h-64 bg-card-surface/50 rounded-xl" />;

  const users = data?.pages.flatMap((page: any) => page.users) || [];

  if (!users.length) {
    return (
      <div className="text-center py-20 text-ink-muted">
        No users found for "{query}".
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user: any, i: number) => (
          <Link href={`/user/${user.userName}`} key={`${user.id}-${i}`} className="group flex items-center gap-4 p-4 rounded-xl bg-card-surface border border-border-subtle hover:border-accent/50 transition-all hover:shadow-md">
            <Avatar className="w-14 h-14 ring-2 ring-transparent group-hover:ring-accent/30 transition-all">
              <AvatarImage src={user.avatarImage || ""} />
              <AvatarFallback className="bg-orange-100 text-orange-900 font-bold text-lg">{user.userName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-semibold text-ink truncate group-hover:text-accent transition-colors">{user.fullName || user.userName}</p>
              <p className="text-sm text-ink-muted truncate">@{user.userName}</p>
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
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
            <span className="text-xs text-ink-muted animate-pulse">Finding more readers...</span>
          </div>
        ) : !hasNextPage && users.length > 0 ? (
          <div className="text-center py-4 px-6 rounded-full bg-card-surface border border-border-subtle text-sm text-ink-muted flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
            <span>No more readers found.</span>
            <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
