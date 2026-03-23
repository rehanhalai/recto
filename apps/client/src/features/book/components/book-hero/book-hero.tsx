"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Book } from "../../types";
import {
  getBookInitials,
  renderStars,
  getHighResCover,
} from "../../utils/book-utils";
import { BookActions } from "./book-actions";
import { getFirstAuthor } from "../../service/book-api";

export function BookHero({ book }: { book: Book }) {
  const [coverError, setCoverError] = useState(false);

  console.log(book);

  const firstAuthor = getFirstAuthor(book);
  const rating = Number(book.averageRating ?? 0);
  const ratingsCount = Number(book.ratingsCount ?? 0);
  const pages = book.pageCount ?? 0;
  const coverImage = getHighResCover(book.coverImage);

  return (
    <section className="space-y-4 rounded-2xl border border-border-subtle/70 bg-card/70 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-40 shrink-0">
          <div className="relative aspect-2/3 overflow-hidden rounded-[10px] bg-muted shadow-lg border border-border-subtle/60">
            {coverImage && !coverError ? (
              <Image
                src={coverImage}
                alt={book.title}
                fill
                className="object-cover"
                sizes="160px"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xl font-semibold text-center px-2">
                {getBookInitials(book.title)}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-3xl font-serif font-medium leading-tight text-foreground">
            {book.title}
          </h1>

          <p className="text-base text-muted-foreground">
            by{" "}
            <Link
              className="text-foreground hover:underline"
              href={`/search?q=${encodeURIComponent(firstAuthor || "")}`}
            >
              {firstAuthor || "Unknown"}
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            {rating > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                </div>
                <span>{rating.toFixed(1)}</span>
                <span>·</span>
                <span>{ratingsCount} reviews</span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
            <span>·</span>
            <span>{book.language || "Unknown"}</span>
            {pages > 0 && (
              <>
                <span>·</span>
                <span>{pages} pages</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(book.genres || []).slice(0, 6).map((genre: any) => {
              const genreId = typeof genre === "string" ? genre : genre.id;
              const genreName = typeof genre === "string" ? genre : genre.name;
              return (
                <Link
                  key={genreId}
                  href={`/books?genre=${encodeURIComponent(genreName)}`}
                >
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-border-subtle/70 bg-muted/50 text-xs text-muted-foreground hover:bg-muted"
                  >
                    {genreName}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <BookActions bookId={book.id} />
    </section>
  );
}
