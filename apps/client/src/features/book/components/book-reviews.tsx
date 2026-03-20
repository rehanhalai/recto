"use client";

import { useMemo, useState } from "react";
import { StarIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth";
import {
  BookReview,
  useBookReviews,
  useCreateReview,
  useUpdateReview,
} from "../hooks/use-book-reviews";

export function BookReviews({ bookId }: { bookId: string }) {
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useBookReviews(bookId, 6);

  const createReview = useCreateReview(bookId);
  const updateReview = useUpdateReview(bookId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [rating, setRating] = useState(0);
  const [editingReview, setEditingReview] = useState<BookReview | null>(null);

  const allReviews = useMemo(
    () => data?.pages.flatMap((page) => page.reviews) ?? [],
    [data],
  );

  const userHasReviewed = Boolean(data?.pages[0]?.userHasReviewed);

  const startWrite = () => {
    setEditingReview(null);
    setDraft("");
    setRating(0);
    setSheetOpen(true);
  };

  const startEdit = (review: BookReview) => {
    setEditingReview(review);
    setDraft(review.content || "");
    setRating(review.rating || 0);
    setSheetOpen(true);
  };

  const submitReview = async () => {
    if (rating < 1) return;

    if (editingReview) {
      await updateReview.mutateAsync({
        reviewId: editingReview.id,
        rating,
        content: draft,
      });
    } else {
      await createReview.mutateAsync({
        rating,
        content: draft,
      });
    }

    setSheetOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Reviews</h3>
        {isAuthenticated && !userHasReviewed && (
          <Button onClick={startWrite}>Write a review</Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews...</p>
      ) : allReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to review this book.
        </p>
      ) : (
        <div className="space-y-3">
          {allReviews.map((review, idx) => {
            const isMine =
              Boolean(user?.userName) &&
              review.user?.userName === user?.userName;
            const isPinnedMine =
              Boolean(data?.pages[0]?.userHasReviewed) && idx === 0;

            return (
              <ReviewCard
                key={review.id}
                review={review}
                pinned={isPinnedMine}
                canEdit={isMine}
                onEdit={() => startEdit(review)}
              />
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <Button
          variant="outline"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full"
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <span className="hidden" />
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingReview ? "Edit your review" : "Write a review"}
            </SheetTitle>
            <SheetDescription>
              Rate this book and share your thoughts.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="p-1"
                    aria-label={`Rate ${val} star${val > 1 ? "s" : ""}`}
                  >
                    <StarIcon
                      size={24}
                      weight={val <= rating ? "fill" : "regular"}
                      className={
                        val <= rating
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      }
                    />
                  </button>
                );
              })}
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What did you think of this book?"
              className="min-h-28 w-full rounded-md border border-border-subtle bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <Button
              onClick={submitReview}
              disabled={
                createReview.isPending || updateReview.isPending || rating < 1
              }
            >
              {editingReview ? "Save changes" : "Publish review"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ReviewCard({
  review,
  pinned,
  canEdit,
  onEdit,
}: {
  review: BookReview;
  pinned: boolean;
  canEdit: boolean;
  onEdit: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const content = review.content || "";
  const needsExpand = content.length > 220;

  return (
    <article className="rounded-xl border border-border-subtle/70 bg-card/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.user?.avatarImage || undefined} />
            <AvatarFallback>
              {(review.user?.userName || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {review.user?.userName || "Reader"}
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
