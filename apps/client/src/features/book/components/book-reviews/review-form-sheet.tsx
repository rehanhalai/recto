import { StarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ReviewFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  draft: string;
  setDraft: (value: string) => void;
  rating: number;
  setRating: (value: number) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function ReviewFormSheet({
  open,
  onOpenChange,
  isEditing,
  draft,
  setDraft,
  rating,
  setRating,
  onSubmit,
  isPending,
}: ReviewFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Edit your review" : "Write a review"}
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
            onClick={onSubmit}
            disabled={isPending || rating < 1}
          >
            {isEditing ? "Save changes" : "Publish review"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
