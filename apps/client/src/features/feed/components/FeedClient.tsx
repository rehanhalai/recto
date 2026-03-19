"use client";

import { useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { PostWithRelations, PaginatedResponse } from "@recto/types";
import { apiInstance } from "@/lib/api";

import { useFeed } from "../hooks/useFeed";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";

type FeedClientProps = {
  initialData?: PaginatedResponse<PostWithRelations>;
};

export function FeedClient({ initialData }: FeedClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFeed(initialData);

  const { ref, inView } = useInView({
    rootMargin: "200px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const likeMutation = useMutation({
    mutationFn: async ({
      postId,
      isLikedByMe,
    }: {
      postId: string;
      isLikedByMe: boolean;
    }) => {
      if (isLikedByMe) {
        return apiInstance.delete<void>(`/posts/${postId}/like`);
      }
      return apiInstance.post<void>(`/posts/${postId}/like`);
    },
    onMutate: async ({ postId, isLikedByMe }) => {
      await queryClient.cancelQueries({ queryKey: ["feed", "posts"] });

      const previousFeed = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<PostWithRelations>>
      >(["feed", "posts"]);

      if (previousFeed) {
        queryClient.setQueryData<
          InfiniteData<PaginatedResponse<PostWithRelations>>
        >(["feed", "posts"], {
          ...previousFeed,
          pages: previousFeed.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  isLikedByMe: !isLikedByMe,
                  likeCount: isLikedByMe
                    ? Math.max(0, post.likeCount - 1)
                    : post.likeCount + 1,
                };
              }
              return post;
            }),
          })),
        });
      }

      return { previousFeed };
    },
    onError: (err, variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData<
          InfiniteData<PaginatedResponse<PostWithRelations>>
        >(["feed", "posts"], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed", "posts"] });
    },
  });

  const handleLike = (postId: string) => {
    const postToLike = posts.find((p) => p.id === postId);
    if (!postToLike) return;
    likeMutation.mutate({
      postId,
      isLikedByMe: Boolean(postToLike.isLikedByMe),
    });
  };

  const handleComment = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col gap-6 mb-10">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (isError && posts.length === 0) {
    return (
      <div className="p-6 text-center text-ink-muted bg-card-surface border border-border-subtle rounded-xl mb-10">
        <p>Something went wrong loading the feed. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mb-10">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onComment={handleComment}
        />
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={ref} className="h-4 w-full" />

      {isFetchingNextPage && (
        <Fragment>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </Fragment>
      )}
    </div>
  );
}
