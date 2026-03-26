"use client";

import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { useFollowingFeed } from "../hooks/use-following-feed";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type FollowingFeedProps = {
  enabled: boolean;
};

export function FollowingFeed({ enabled }: FollowingFeedProps) {
  const { posts, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowingFeed(enabled);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "1200px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading && enabled) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (enabled && posts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-card-surface border border-border-subtle flex items-center justify-center">
          <MagnifyingGlass size={28} className="text-ink-muted" />
        </div>
        <div className="space-y-2">
          <p className="text-ink font-medium text-base">
            Follow some readers to see their posts
          </p>
          <p className="text-ink-muted text-sm max-w-xs mx-auto">
            Discover readers who share your taste in books and follow them to
            build your feed.
          </p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-paper text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          Find readers →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="flex flex-col gap-4 pt-4">
          <PostCardSkeleton />
        </div>
      )}
    </div>
  );
}
