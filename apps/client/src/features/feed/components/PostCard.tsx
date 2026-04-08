"use client";

import { useState } from "react";
import type { PostWithRelations } from "@recto/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ChatCircle,
  DotsThree,
  ShareFat,
  BookmarkSimple,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { apiInstance } from "@/lib/api";
import { useAuthStore, selectUser } from "@/features/auth";
import { useDeletePost } from "../hooks/use-delete-post";
import { PostEditDialog } from "./PostEditDialog";
import { toast } from "@/lib/toast";
import { getBookUrl } from "@/lib/book-urls";

type PostCardProps = {
  post: PostWithRelations;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
};

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  const router = useRouter();
  const {
    id,
    content,
    image,
    likesCount,
    commentsCount,
    createdAt,
    author,
    book,
    isLikedByMe,
  } = post;

  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(Boolean(isLikedByMe));
  const [localLikeCount, setLocalLikeCount] = useState(likesCount ?? 0);
  const [imageAspectRatio, setImageAspectRatio] = useState<string>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const currentUser = useAuthStore(selectUser);
  const deletePostMutation = useDeletePost();

  const isOwner = currentUser?.id === author?.id;
  // const [saved, setSaved] = useState(false);

  const timeAgo = formatRelativeTime(createdAt);
  const authorUserName = author?.userName ?? "unknown";
  const authorDisplayName =
    author?.fullName ?? author?.userName ?? "Deleted user";
  const authorAvatarImage = author?.avatarImage ?? null;
  const hasExternalLikeHandler = typeof onLike === "function";

  const resolvedLiked = hasExternalLikeHandler ? Boolean(isLikedByMe) : liked;
  const resolvedLikeCount = hasExternalLikeHandler
    ? (likesCount ?? 0)
    : localLikeCount;

  const handleLike = async () => {
    if (hasExternalLikeHandler) {
      onLike?.(id);
      return;
    }

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLocalLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    try {
      if (wasLiked) {
        await apiInstance.delete(`/posts/${id}/like`);
      } else {
        await apiInstance.post(`/posts/${id}/like`);
      }
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLocalLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(id);
      return;
    }

    router.push(`/posts/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(id);
    } catch {
      // toast is already handled in the hook
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const shouldTruncate = content.length > 200;

  return (
    <article className="flex flex-col bg-card-surface border border-border-subtle rounded-xl p-4 gap-4 w-full transition-colors hover:border-border-subtle/80">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link href={`/${authorUserName}`} className="flex items-center gap-3">
          <UserAvatar
            src={authorAvatarImage}
            fallbackName={authorDisplayName}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold text-ink line-clamp-1 max-w-37.5">
                {authorDisplayName}
              </span>
              <span className="text-ink-muted">·</span>
              <span className="text-ink-muted font-mono text-xs whitespace-nowrap">
                {timeAgo}
              </span>
            </div>
            <span className="text-ink-muted text-xs">@{authorUserName}</span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-border-subtle/30 focus:outline-none transition-colors">
            <DotsThree size={28} weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 bg-paper border-border-subtle"
          >
            {isOwner ? (
              <>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleEdit}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                  onClick={handleDelete}
                  disabled={deletePostMutation.isPending}
                >
                  {deletePostMutation.isPending ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Optional Book Mention */}
      {book && (
        <Link
          href={getBookUrl(book.sourceId, book.title)}
          className="flex items-start gap-4 p-3 rounded-lg border border-border-subtle bg-paper/50 hover:bg-paper/80 transition-colors"
        >
          <div className="shrink-0 relative w-12 h-18 rounded-md overflow-hidden bg-paper flex items-center justify-center border border-border-subtle shadow-sm">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex flex-col gap-1 w-full px-2 py-4 h-full items-center justify-center opacity-30">
                <div className="w-full h-0.5 bg-ink-muted rounded-full" />
                <div className="w-full h-0.5 bg-ink-muted rounded-full" />
                <div className="w-2/3 h-0.5 bg-ink-muted rounded-full" />
              </div>
            )}
          </div>
          <div className="flex flex-col py-1 overflow-hidden min-w-0 flex-1">
            <h3 className="font-serif text-base font-semibold text-ink leading-tight truncate">
              {book.title}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5 font-mono uppercase tracking-wider">
              Book mention
            </p>
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="text-ink font-sans text-sm leading-relaxed whitespace-pre-wrap">
        <p className={!isExpanded && shouldTruncate ? "line-clamp-3" : ""}>
          {content}
        </p>
        {shouldTruncate && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-ink-muted text-sm font-medium hover:text-ink hover:underline transition-colors mt-1"
          >
            read more
          </button>
        )}
      </div>

      {/* Optional Post Image */}
      {image && (
        <div
          className="relative w-full rounded-lg overflow-hidden border border-border-subtle bg-paper/20"
          style={{ aspectRatio: imageAspectRatio ?? "1 / 1" }}
        >
          <Image
            src={image}
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 560px"
            onLoad={(event) =>
              setImageAspectRatio(
                `${event.currentTarget.naturalWidth} / ${event.currentTarget.naturalHeight}`,
              )
            }
          />
        </div>
      )}

      {/* Actions Footer */}
      <footer className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-5">
          <button
            onClick={handleLike}
            aria-label={`Like post by ${authorUserName}`}
            aria-pressed={resolvedLiked}
            className="flex items-center gap-1.5 text-ink-muted hover:text-gold transition-colors focus:outline-none"
          >
            <Heart
              size={20}
              weight={resolvedLiked ? "fill" : "regular"}
              className={resolvedLiked ? "text-gold" : ""}
            />
            <span className="text-sm font-medium">{resolvedLikeCount}</span>
          </button>

          <button
            onClick={handleComment}
            aria-label={`Comment on post by ${authorUserName}`}
            className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors focus:outline-none"
          >
            <ChatCircle size={20} weight="regular" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </button>

          <button
            aria-label="Share post"
            className="flex items-center text-ink-muted hover:text-ink transition-colors focus:outline-none"
          >
            <ShareFat size={20} weight="regular" />
          </button>
        </div>

        {/* <button
          onClick={handleSave}
          aria-label={saved ? "Unsave post" : "Save post"}
          aria-pressed={saved}
          className="flex items-center text-ink-muted hover:text-gold transition-colors focus:outline-none"
        >
          <BookmarkSimple
            size={20}
            weight={saved ? "fill" : "regular"}
            className={saved ? "text-gold" : ""}
          />
        </button> */}
      </footer>

      <PostEditDialog
        post={post}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </article>
  );
}
