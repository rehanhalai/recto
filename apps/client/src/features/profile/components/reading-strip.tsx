import Image from "next/image";
import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TrackerEntry } from "../types";

type ReadingStripProps = {
  title: string;
  books: TrackerEntry[];
  emptyMessage: string;
  isLoading: boolean;
};

export function ReadingStrip({
  title,
  books,
  emptyMessage,
  isLoading,
}: ReadingStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-2">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ink-muted/80">
          {title}
        </h3>
        {books.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              className="p-1 rounded-full hover:bg-card-surface transition-colors text-ink-muted hover:text-ink border border-border-subtle/40"
              aria-label="Scroll left"
            >
              <CaretLeft size={14} weight="bold" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1 rounded-full hover:bg-card-surface transition-colors text-ink-muted hover:text-ink border border-border-subtle/40"
              aria-label="Scroll right"
            >
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden pt-1">
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
          <Skeleton className="h-56 w-40 shrink-0 rounded-md" />
        </div>
      ) : books.length === 0 ? (
        <p className="text-sm text-ink-muted italic py-1">{emptyMessage}</p>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar select-none scroll-smooth"
        >
          {books.map((entry) => (
            <div key={entry.id} className="group shrink-0 w-40 space-y-2.5">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md border border-border-subtle bg-card-surface/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-gold/30">
                {entry.book.coverImage ? (
                  <Image
                    src={entry.book.coverImage}
                    alt={entry.book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="160px"
                  />
                ) : (
                  <div className="h-full w-full bg-border-subtle/10 flex items-center justify-center p-3">
                    <span className="text-[10px] text-ink-muted/40 uppercase tracking-widest text-center font-bold">
                      {entry.book.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-1 text-[0.7rem] font-bold text-ink group-hover:text-gold transition-colors">
                  {entry.book.title}
                </p>
                <p className="line-clamp-1 text-[0.6rem] text-ink-muted uppercase tracking-wider font-medium">
                  {entry.book.authors.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
