"use client";

import { useState } from "react";
import type { PostWithRelations } from "@recto/types";
import Image from "next/image";
import { Heart, ChatCircle, DotsThree } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";

type PostCardProps = {
  post: PostWithRelations;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
};

function formatRelativeTime(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "now";
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    id,
    content,
    image,
    likeCount,
    commentCount,
    createdAt,
    author,
    book,
    isLikedByMe,
  } = post;

  const timeAgo = formatRelativeTime(createdAt);
  const authorUserName = author?.userName ?? "unknown";
  const authorDisplayName =
    author?.fullName ?? author?.userName ?? "Deleted user";
  const authorAvatarImage = author?.avatarImage ?? null;
  const likedByMe = Boolean(isLikedByMe);

  const handleLike = () => onLike(id);
  const handleComment = () => onComment(id);

  return (
    <article className="flex flex-col bg-card-surface border border-border-subtle rounded-xl p-4 gap-4 w-full">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={authorAvatarImage}
            fallbackName={authorDisplayName}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold text-ink line-clamp-1 max-w-[150px]">
                {authorDisplayName}
              </span>
              <span className="text-ink-muted">·</span>
              <span className="text-ink-muted font-mono text-xs whitespace-nowrap">
                {timeAgo}
              </span>
            </div>
            <span className="text-ink-muted text-xs">@{authorUserName}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-border-subtle/30 focus:outline-none transition-colors">
            <DotsThree size={24} weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 bg-paper border-border-subtle"
          >
            <DropdownMenuItem className="cursor-pointer">
              View post
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30">
              Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Optional Book Block */}
      {book && (
        <div className="flex items-start gap-4 p-3 rounded-lg border border-border-subtle bg-paper/50">
          <div className="flex-shrink-0 relative w-16 h-24 rounded-md overflow-hidden bg-paper flex items-center justify-center border border-border-subtle shadow-sm">
            {book.coverImage ? (
              // Important: Ensure you add 'books.google.com' to your target 'remotePatterns' in 'next.config.ts'
              <Image
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                fill
                className="object-cover"
                sizes="64px"
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
            <h3 className="font-serif text-lg font-semibold text-ink leading-tight truncate">
              {book.title}
            </h3>
            <p className="text-sm text-ink-muted truncate mt-0.5">
              Book mention
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="text-ink font-sans text-sm leading-relaxed whitespace-pre-wrap">
        <p className={!isExpanded ? "line-clamp-3" : ""}>{content}</p>
        {content.length > 150 && !isExpanded && (
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
        <div className="relative w-full max-h-72 rounded-lg overflow-hidden border border-border-subtle">
          {/* If images come from external URLs, update next.config.ts remotePatterns accordingly */}
          <Image
            src={image}
            alt="Post image"
            width={600}
            height={400}
            className="object-cover w-full h-full max-h-72 scale-100 transition-transform"
          />
        </div>
      )}

      {/* Actions Footer */}
      <footer className="flex items-center gap-5 pt-1">
        <button
          onClick={handleLike}
          aria-label={`Like post by ${authorUserName}`}
          aria-pressed={likedByMe}
          className="flex items-center gap-1.5 text-ink-muted hover:text-gold transition-colors focus:outline-none"
        >
          <Heart
            size={20}
            weight={likedByMe ? "fill" : "regular"}
            className={likedByMe ? "text-gold" : ""}
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>

        <button
          onClick={handleComment}
          aria-label={`Comment on post by ${authorUserName}`}
          className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors focus:outline-none"
        >
          <ChatCircle size={20} weight="regular" />
          <span className="text-sm font-medium">{commentCount}</span>
        </button>
      </footer>
    </article>
  );
}
