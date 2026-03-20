"use client";

import type { PaginatedResponse, PostWithRelations } from "@recto/types";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { useExploreFeed } from "../hooks/use-explore-feed";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type ExploreFeedProps = {
  initialData: PaginatedResponse<PostWithRelations>;
};

export function ExploreFeed({ initialData }: ExploreFeedProps) {
  const { posts, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useExploreFeed(initialData);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-ink-muted text-sm">
          No posts yet. Be the first to share something!
        </p>
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
