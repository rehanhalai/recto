"use client";

import Link from "next/link";
import Image from "next/image";
import { ReadingStatusBadge } from "@/components/ReadingStatusBadge";

type HeroStripProps = {
  currentRead: {
    book: {
      id: string;
      title: string;
      coverImage: string | null;
      authors: { authorName: string }[];
    };
  } | null;
};

export function HeroStrip({ currentRead }: HeroStripProps) {
  if (!currentRead) {
    return (
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-card-surface border border-border-subtle rounded-xl mb-10 text-center md:text-left gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-ink font-semibold">
            You&apos;re not reading anything right now.
          </p>
          <p className="text-ink-muted text-sm">
            Update your reading log to keep your followers in the loop.
          </p>
        </div>
        <Link
          href="/books"
          className="inline-flex items-center justify-center px-4 py-2 bg-ink text-paper rounded-md text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          Find your next book →
        </Link>
      </div>
    );
  }

  const { book } = currentRead;

  return (
    <div className="flex p-4 md:p-5 bg-card-surface border border-border-subtle rounded-xl mb-10 w-full relative overflow-hidden group items-stretch gap-4 md:gap-5">
      {/* Book Cover */}
      <div className="flex-shrink-0 w-16 h-24 md:w-20 md:h-32 relative rounded-md overflow-hidden bg-paper flex items-center justify-center border border-border-subtle shadow-sm z-10">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 64px, 80px"
          />
        ) : (
          <div className="w-full h-full flex flex-col gap-1.5 px-3 py-4 items-center justify-center opacity-30">
            <div className="w-full h-0.5 bg-ink-muted rounded-full" />
            <div className="w-full h-0.5 bg-ink-muted rounded-full" />
            <div className="w-2/3 h-0.5 bg-ink-muted rounded-full" />
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="flex flex-col flex-1 py-1 z-10 min-w-0 justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-ink-muted uppercase tracking-wider">
            Currently Reading
          </span>
          <ReadingStatusBadge status="currently_reading" />
        </div>
        <h3 className="font-serif text-lg md:text-xl font-bold text-ink leading-tight truncate">
          {book.title}
        </h3>
        <p className="text-sm md:text-base text-ink-muted truncate mt-0.5">
          by {book.authors.map((a) => a.authorName).join(", ")}
        </p>
      </div>
    </div>
  );
}
