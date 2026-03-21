"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import {
  BookReview,
  useBookReviews,
  useCreateReview,
  useUpdateReview,
} from "../../hooks/use-book-reviews";
import { ReviewCard } from "./review-card";
import { ReviewFormSheet } from "./review-form-sheet";

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
              review.author?.userName === user?.userName;
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

      <ReviewFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        isEditing={!!editingReview}
        draft={draft}
        setDraft={setDraft}
        rating={rating}
        setRating={setRating}
        onSubmit={submitReview}
        isPending={createReview.isPending || updateReview.isPending}
      />
    </div>
  );
}
