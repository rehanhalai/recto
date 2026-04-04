import { useState } from "react";
import {
  StarIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { BookReview } from "../../hooks/use-book-reviews";

interface ReviewCardProps {
  review: BookReview;
  pinned: boolean;
  canEdit: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  pinned,
  canEdit,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const content = review.content || "";
  const needsExpand = content.length > 220;

  return (
    <article className="rounded-xl border border-border-subtle/70 bg-card/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserAvatar
            src={review.author?.avatarImage || null}
            fallbackName={review.author?.userName || "Reader"}
            className="h-8 w-8"
          />
          <div>
            <p className="text-sm font-medium">
              {review.author?.userName || "Reader"}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.updatedAt || review.createdAt).toDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pinned && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Your review
            </span>
          )}
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <PencilSimpleIcon size={16} className="mr-1" />
              Edit
            </Button>
          )}
          {canEdit && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <TrashSimpleIcon size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            size={14}
            weight={i < review.rating ? "fill" : "regular"}
          />
        ))}
      </div>

      <p
        className="mt-2 text-sm text-muted-foreground"
        style={
          expanded || !needsExpand
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {content || "No review text."}
      </p>

      {needsExpand && (
        <button
          type="button"
          className="mt-1 text-xs text-foreground underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}
