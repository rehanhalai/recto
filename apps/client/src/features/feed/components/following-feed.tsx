"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { FeedPostsSkeleton } from "./feed-skeletons";
import { useFollowingFeed } from "../hooks/use-following-feed";
import { useAuthStore } from "@/features/auth";
import { useFeedLike } from "../hooks/use-feed-like";

import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type FollowingFeedProps = {
  enabled: boolean;
};

export function FollowingFeed({ enabled }: FollowingFeedProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { posts, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowingFeed(enabled && isAuthenticated);
  const likeMutation = useFeedLike(["feed", "posts", "following"]);

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

  if (enabled && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-card-surface border border-border-subtle flex items-center justify-center">
          <MagnifyingGlass size={28} className="text-ink-muted" />
        </div>
        <div className="space-y-2">
          <p className="text-ink font-medium text-base">
            You are not signed in
          </p>
          <p className="text-ink-muted text-sm max-w-xs mx-auto">
            Login to view your Following feed and continue browsing posts from
            people you follow.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent text-paper text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  if (isLoading && enabled) {
    return <FeedPostsSkeleton count={3} />;
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
          href="/browse"
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
