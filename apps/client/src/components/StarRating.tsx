import { Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type StarRatingProps = {
  rating: number;
  max?: number;
  className?: string;
};

export function StarRating({ rating, max = 5, className }: StarRatingProps) {
  return (
    <div className={cn("flex flex-row items-center", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          weight="fill"
          className={cn(
            "w-3.5 h-3.5",
            i < rating ? "text-gold" : "text-ink-muted/30",
          )}
        />
      ))}
    </div>
  );
}
