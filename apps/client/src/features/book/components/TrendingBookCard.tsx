"use client";

import Image from "next/image";
import Link from "next/link";
import type { Book } from "../types";

interface TrendingBookCardProps {
  book: Book;
}

export function TrendingBookCard({ book }: TrendingBookCardProps) {
  const authorName = book.authors?.[0]?.authorName ?? "Unknown Author";

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex items-center gap-4 p-3 rounded-lg border border-border-subtle bg-paper/50 hover:bg-card-surface transition-colors w-full h-full"
    >
      <div className="shrink-0 relative w-16 h-24 rounded-md overflow-hidden bg-paper flex items-center justify-center border border-border-subtle shadow-sm group-hover:shadow-md transition-shadow">
        {book.coverImage ? (
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
        <h3 className="font-serif text-base font-semibold text-ink leading-tight truncate group-hover:text-accent-dark transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-ink-muted truncate mt-1">by {authorName}</p>
      </div>
    </Link>
  );
}
