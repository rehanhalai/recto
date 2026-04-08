import Image from "next/image";
import Link from "next/link";
import type { Book } from "../../types";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { getBookUrl } from "@/lib/book-urls";

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

function extractYear(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const match = dateStr.match(/\d{4}/);
  return match ? match[0] : undefined;
}

function getInitials(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function BookCard({ book, featured = false }: BookCardProps) {
  const firstAuthor = book.authors?.[0];
  const authorName =
    typeof firstAuthor === "string"
      ? firstAuthor
      : (firstAuthor?.authorName ?? "Unknown Author");
  const coverImage = book.coverImage;
  const rating = Number(book.averageRating ?? 0);
  const hasRating = rating > 0;
  const year = extractYear(book.releaseDate ?? undefined);

  const cardClassName = `group flex flex-col w-full h-full focus:outline-none ${
    featured ? "col-span-2 row-span-1 md:col-span-1" : ""
  }`;

  return (
    <Link
      href={getBookUrl(book.sourceId, book.title)}
      className={cardClassName}
    >
      {/* Cover */}
      <div
        className={`relative w-full aspect-2/3 rounded-xl overflow-hidden border border-border-subtle shadow-sm
          transition-all duration-300 ease-out
          group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.13)] dark:group-hover:shadow-[0_16px_48px_rgba(255,255,255,0.06)]
          ${featured ? "ring-1 ring-gold/30" : ""}
        `}
      >
        {coverImage ? (
          <Image
            src={book?.coverImage || ""}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-linear-to-br from-card-surface to-border-subtle/30">
            <span className="text-3xl font-serif font-bold text-ink/20 tracking-wider">
              {getInitials(book.title)}
            </span>
            <span className="text-[10px] text-ink-muted/40 mt-2 px-4 text-center line-clamp-2 font-sans">
              {book.title}
            </span>
          </div>
        )}

        {/* Spine highlight */}
        <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-r from-white/25 to-transparent mix-blend-overlay z-10" />

        {/* Hover overlay with gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2 right-2 z-20 bg-gold/90 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
            Best Match
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col mt-3 px-0.5 gap-1">
        <h3 className="font-serif text-[15px] md:text-base font-semibold text-ink leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-accent transition-colors duration-200">
          {book.title}
        </h3>
        <p className="text-xs text-ink-muted/80 font-sans truncate">
          {authorName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-ink-muted/70">
          {hasRating && (
            <>
              <Star weight="fill" className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="font-semibold text-ink/80">
                {rating.toFixed(1)}
              </span>
            </>
          )}
          {hasRating && year && <span className="text-ink-muted/30">·</span>}
          {year && <span>{year}</span>}
          {!hasRating && !year && (
            <span className="italic text-ink-muted/50">No info</span>
          )}
        </div>
      </div>
    </Link>
  );
}
