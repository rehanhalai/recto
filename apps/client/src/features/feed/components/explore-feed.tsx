"use client";

import { useRouter } from "next/navigation";
import type { PaginatedResponse, PostWithRelations } from "@recto/types";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { useExploreFeed } from "../hooks/use-explore-feed";
import { useFeedLike } from "../hooks/use-feed-like";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type ExploreFeedProps = {
  initialData: PaginatedResponse<PostWithRelations>;
};

export function ExploreFeed({ initialData }: ExploreFeedProps) {
  const router = useRouter();
  const { posts, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useExploreFeed(initialData);
  const likeMutation = useFeedLike(["feed", "posts", "explore"]);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "1200px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = (postId: string) => {
    const postToLike = posts.find((post) => post.id === postId);
    if (!postToLike) {
      return;
    }

    likeMutation.mutate({
      postId,
      isLikedByMe: Boolean(postToLike.isLikedByMe),
    });
  };

  const handleComment = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

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
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
        />
      ))}

      {hasNextPage && (
        <div ref={ref} className="flex flex-col gap-4 pt-4">
          <PostCardSkeleton />
        </div>
      )}
    </div>
  );
}
