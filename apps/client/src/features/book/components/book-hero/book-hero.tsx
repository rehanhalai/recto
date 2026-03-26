"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaretLeft } from "@phosphor-icons/react";
import type { Book } from "../../types";
import {
  getBookInitials,
  renderStars,
  getLanguageName,
} from "../../utils/book-utils";
import { BookActions } from "./book-actions";
import { getFirstAuthor } from "../../service/book-api";

import { useRouter } from "next/navigation";

export function BookHero({ book }: { book: Book }) {
  const router = useRouter();
  const [coverError, setCoverError] = useState(false);

  const firstAuthor = getFirstAuthor(book);
  const rating = Number(book.averageRating ?? 0);
  const pages = book.pageCount ?? 0;
  const publishedYear = book.releaseDate
    ? String(book.releaseDate).slice(0, 4)
    : "-";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border-subtle/60 bg-card/40 p-5 md:p-8 backdrop-blur-md">
      {/* Mobile Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-20 h-10 w-10 flex sm:hidden rounded-full border border-border-subtle/30 bg-background/40 p-0 text-foreground backdrop-blur-xl transition-all hover:bg-background/60 active:scale-95"
      >
        <CaretLeft size={20} weight="bold" />
      </Button>

      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        {/* Book Cover */}
        <div className="relative w-48 shrink-0 self-center sm:self-start">
          <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-muted/30 shadow-2xl ring-1 ring-white/10">
            {book.coverImage && !coverError ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
                priority
                sizes="192px"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground text-2xl font-serif font-semibold text-center px-4">
                {getBookInitials(book.title)}
              </div>
            )}
          </div>
        </div>

        {/* Book Details Column */}
        <div className="flex-1 space-y-7">
          <div className="space-y-3">
            <h1 className="text-3xl font-serif font-bold leading-tight tracking-tight text-foreground md:text-4xl">
              {book.title}
            </h1>

            <p className="text-lg font-cormorant italic text-ink-muted/95 sm:text-2xl">
              by{" "}
              <Link
                className="text-foreground transition-colors hover:text-ink/80"
                href={`/search?q=${encodeURIComponent(firstAuthor || "")}`}
              >
                {firstAuthor || "Unknown Author"}
              </Link>
            </p>
          </div>

          {/* Minimalist Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-3 text-sm font-medium tracking-wide text-ink-muted/90">
            <span className="flex items-center gap-1.5">{publishedYear}</span>
            <span className="h-1 w-1 rounded-full bg-border-subtle/40" />
            <span>{getLanguageName(book.language)}</span>
            {pages > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-border-subtle/40" />
                <span>{pages} pages</span>
              </>
            )}
            <span className="h-1 w-1 rounded-full bg-border-subtle/40" />
            <div className="flex items-center gap-1.5">
              <span className="font-serif italic mr-1">★</span>
              {rating > 0 ? rating.toFixed(1) : "-"}
            </div>
          </div>

          {/* Modern Genre Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(book.genres || []).slice(0, 5).map((genre: any) => {
              const genreName = typeof genre === "string" ? genre : genre.name;
              return (
                <Link
                  key={genreName}
                  href={`/books?genre=${encodeURIComponent(genreName)}`}
                >
                  <Badge
                    variant="outline"
                    className="h-7 rounded-full border-border-subtle/50 bg-black/5 dark:bg-white/5 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted transition-all hover:bg-muted/80 hover:text-foreground"
                  >
                    {genreName}
                  </Badge>
                </Link>
              );
            })}
          </div>

          {/* Book Actions Container */}
          <div className="pt-4 max-w-lg">
            <BookActions bookId={book.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
