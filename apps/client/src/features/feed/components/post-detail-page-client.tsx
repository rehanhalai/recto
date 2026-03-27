"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PostWithRelations } from "@recto/types";
import { ArrowLeftIcon, HeartIcon } from "@phosphor-icons/react";

import { StandardLayout } from "@/components/layout";
import { Button } from "@/components/ui";
import { PostCard } from "@/features/feed/components/PostCard";
import { useAuthStore } from "@/features/auth";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { apiInstance } from "@/lib/api";

type ApiEnvelope<T> = {
  data: T;
  message: string;
};

type PostComment = {
  id: string;
  parentId: string | null;
  content: string;
  likesCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
  user: {
    id: string;
    userName: string;
    fullName: string | null;
    avatarImage: string | null;
  };
};

type PostDetailPageClientProps = {
  postId: string;
};

async function fetchPost(postId: string): Promise<PostWithRelations> {
  const response = await apiInstance.get<ApiEnvelope<PostWithRelations>>(
    `/posts/${postId}`,
  );

  return response.data;
}

async function fetchComments(postId: string): Promise<PostComment[]> {
  const response = await apiInstance.get<ApiEnvelope<PostComment[]>>(
    `/posts/${postId}/comments`,
    { page: 1, limit: 20 },
  );

  return response.data;
}

export function PostDetailPageClient({ postId }: PostDetailPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);
  const [commentText, setCommentText] = useState("");
  const [activeReplyToId, setActiveReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplyThreads, setExpandedReplyThreads] = useState<
    Record<string, boolean>
  >({});

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });

  const commentsQuery = useQuery({
    queryKey: ["post", postId, "comments"],
    queryFn: () => fetchComments(postId),
    enabled: postQuery.isSuccess,
  });

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post", postId] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "posts", "explore"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "posts", "following"] }),
      ]);
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      return apiInstance.post<ApiEnvelope<PostComment>>(`/posts/${postId}/comments`, {
        content,
        parentId,
      });
    },
    onMutate: async ({ content, parentId }) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId, "comments"] });

      const previousComments = queryClient.getQueryData<PostComment[]>([
        "post",
        postId,
        "comments",
      ]);

      const tempComment: PostComment = {
        id: `temp-${Date.now()}`,
        parentId: parentId ?? null,
        content,
        likesCount: 0,
        isLikedByMe: false,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser?.id ?? "",
          userName: currentUser?.userName ?? "you",
          fullName: currentUser?.fullName ?? null,
          avatarImage: currentUser?.avatarImage ?? null,
        },
      };

      queryClient.setQueryData<PostComment[]>(["post", postId, "comments"], (old) => {
        const current = old ?? [];

        if (!parentId) {
          return [tempComment, ...current];
        }

        const parentIndex = current.findIndex((comment) => comment.id === parentId);
        if (parentIndex === -1) {
          return [tempComment, ...current];
        }

        const insertAt = parentIndex + 1;
        return [
          ...current.slice(0, insertAt),
          tempComment,
          ...current.slice(insertAt),
        ];
      });

      return { previousComments };
    },
    onError: (_error, _content, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData<PostComment[]>(
          ["post", postId, "comments"],
          context.previousComments,
        );
      }
    },
    onSuccess: async () => {
      setCommentText("");
      setReplyText("");
      setActiveReplyToId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post", postId] }),
        queryClient.invalidateQueries({ queryKey: ["post", postId, "comments"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "posts", "explore"] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "posts", "following"] }),
      ]);
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, isLikedByMe }: { commentId: string; isLikedByMe: boolean }) => {
      if (isLikedByMe) {
        return apiInstance.delete<void>(`/posts/comments/${commentId}/like`);
      }

      return apiInstance.post<void>(`/posts/comments/${commentId}/like`);
    },
    onMutate: async ({ commentId, isLikedByMe }) => {
      await queryClient.cancelQueries({ queryKey: ["post", postId, "comments"] });

      const previousComments = queryClient.getQueryData<PostComment[]>([
        "post",
        postId,
        "comments",
      ]);

      queryClient.setQueryData<PostComment[]>(["post", postId, "comments"], (old) =>
        (old ?? []).map((comment) => {
          if (comment.id !== commentId) {
            return comment;
          }

          return {
            ...comment,
            isLikedByMe: !isLikedByMe,
            likesCount: isLikedByMe
              ? Math.max(0, comment.likesCount - 1)
              : comment.likesCount + 1,
          };
        }),
      );

      return { previousComments };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData<PostComment[]>(
          ["post", postId, "comments"],
          context.previousComments,
        );
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["post", postId, "comments"] });
    },
  });

  const comments = commentsQuery.data ?? [];
  const commentsByParentId = comments.reduce<Record<string, PostComment[]>>(
    (acc, comment) => {
      const key = comment.parentId ?? "root";
      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(comment);
      return acc;
    },
    {},
  );

  const rootComments = commentsByParentId.root ?? [];

  const handleCommentLike = (comment: PostComment) => {
    likeCommentMutation.mutate({
      commentId: comment.id,
      isLikedByMe: Boolean(comment.isLikedByMe),
    });
  };

  const submitReply = () => {
    if (!activeReplyToId || replyText.trim().length === 0) {
      return;
    }

    createCommentMutation.mutate({
      content: replyText.trim(),
      parentId: activeReplyToId,
    });
  };

  const renderCommentItem = (comment: PostComment, depth: number = 0) => {
    const childComments = commentsByParentId[comment.id] ?? [];
    const isReplyThreadExpanded = Boolean(expandedReplyThreads[comment.id]);

    return (
      <li
        key={comment.id}
        className={`rounded-lg border border-border-subtle px-3 py-2 ${
          depth === 0 ? "bg-paper/60" : "bg-card-surface"
        }`}
      >
        <Link href={`/${comment.user.userName}`} className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-ink">
            {comment.user.fullName ?? comment.user.userName}
          </p>
        </Link>
        <p className="mt-1 text-sm text-ink">{comment.content}</p>

        <div className="mt-2 flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => handleCommentLike(comment)}
            className={`inline-flex items-center gap-1 transition-colors ${
              comment.isLikedByMe ? "text-gold" : "text-ink-muted hover:text-ink"
            }`}
          >
            <HeartIcon size={12} weight={comment.isLikedByMe ? "fill" : "regular"} />
            {comment.likesCount}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                setActiveReplyToId((current) =>
                  current === comment.id ? null : comment.id,
                );
                setReplyText("");
              }}
              className="text-ink-muted hover:text-ink transition-colors"
            >
              Reply
            </button>
          )}
        </div>

        {activeReplyToId === comment.id && isAuthenticated && (
          <div className="mt-3 space-y-2 rounded-md border border-border-subtle bg-paper p-2">
            <textarea
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
              maxLength={300}
              placeholder="Write a reply..."
              className="min-h-20 w-full resize-y rounded-md border border-border-subtle bg-card-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveReplyToId(null);
                  setReplyText("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={replyText.trim().length === 0 || createCommentMutation.isPending}
                onClick={submitReply}
              >
                {createCommentMutation.isPending ? "Replying..." : "Reply"}
              </Button>
            </div>
          </div>
        )}

        {childComments.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setExpandedReplyThreads((current) => ({
                ...current,
                [comment.id]: !current[comment.id],
              }))
            }
            className="mt-3 text-xs text-ink-muted hover:text-ink transition-colors"
          >
            {isReplyThreadExpanded
              ? "Hide replies"
              : `View replies (${childComments.length})`}
          </button>
        )}

        {childComments.length > 0 && isReplyThreadExpanded && (
          <ul className="mt-3 space-y-2 border-l border-border-subtle pl-3">
            {childComments.map((child) => renderCommentItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (postQuery.isLoading) {
    return (
      <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
        <div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-sm text-ink-muted">
          Loading post...
        </div>
      </StandardLayout>
    );
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
        <div className="rounded-xl border border-border-subtle bg-card-surface p-6 text-center">
          <h1 className="text-xl font-semibold text-ink">Post not found</h1>
          <p className="mt-2 text-sm text-ink-muted">
            We could not load this post.
          </p>
          <Button className="mt-4" onClick={() => router.push("/feed")}>Back to feed</Button>
        </div>
      </StandardLayout>
    );
  }

  const post = postQuery.data;

  return (
    <StandardLayout leftSidebar={<SidebarLeft />} rightSidebar={<SidebarRight />}>
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            <ArrowLeftIcon size={16} className="mr-1" />
            Back
          </Button>
        </div>

        <PostCard
          post={post}
          onLike={(targetPostId) => {
            likeMutation.mutate({
              postId: targetPostId,
              isLikedByMe: Boolean(post.isLikedByMe),
            });
          }}
        />

        <section className="rounded-xl border border-border-subtle bg-card-surface p-4">
          <h2 className="text-lg font-semibold text-ink">Comments</h2>

          {isAuthenticated ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                maxLength={300}
                placeholder="Write a comment..."
                className="min-h-24 w-full resize-y rounded-lg border border-border-subtle bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-ink-muted">{commentText.length}/300</p>
                <Button
                  type="button"
                  size="sm"
                  disabled={commentText.trim().length === 0 || createCommentMutation.isPending}
                  onClick={() => createCommentMutation.mutate({ content: commentText.trim() })}
                >
                  {createCommentMutation.isPending ? "Posting..." : "Post comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border border-border-subtle bg-paper/60 p-4 text-center">
              <p className="text-sm text-ink-muted">
                You are not signed in. Login to join the conversation.
              </p>
              <Link href="/login" className="mt-3 inline-flex">
                <Button size="sm">Login</Button>
              </Link>
            </div>
          )}

          {commentsQuery.isLoading ? (
            <p className="mt-3 text-sm text-ink-muted">Loading comments...</p>
          ) : comments.length > 0 ? (
            <ul className="mt-4 space-y-3">{rootComments.map((comment) => renderCommentItem(comment))}</ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
        </section>
      </div>
    </StandardLayout>
  );
}
