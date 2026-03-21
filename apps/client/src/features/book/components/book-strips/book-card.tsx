import Image from "next/image";
import Link from "next/link";
import type { Book } from "../../types";
import { getHighResCover } from "../../utils/book-utils";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const authorName = book.authors?.[0]?.authorName ?? "Unknown Author";
  const coverImage = getHighResCover(book.coverImage);

  return (
    <Link
      href={`/book/${book.id}/${book.title.replaceAll(" ", "-")}`}
      className="group flex flex-col gap-3 w-full h-full focus:outline-none"
    >
      <div className="relative w-full aspect-2/3 rounded-md overflow-hidden bg-card-surface border border-border-subtle shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] group-hover:-translate-y-1 after:absolute after:inset-0 after:bg-linear-to-tr after:from-black/10 after:to-transparent after:opacity-0 group-hover:after:opacity-100 after:transition-opacity">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`Cover of ${book.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
          />
        ) : (
          <div className="flex flex-col gap-2 w-full px-4 py-8 h-full items-center justify-center opacity-40">
            <div className="w-full h-0.5 bg-ink-muted rounded-full" />
            <div className="w-full h-0.5 bg-ink-muted rounded-full" />
            <div className="w-2/3 h-0.5 bg-ink-muted rounded-full" />
          </div>
        )}

        <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-linear-to-r from-white/30 to-transparent mix-blend-overlay z-10" />
      </div>

      <div className="flex flex-col px-1">
        <h3 className="font-serif text-[15px] md:text-base font-medium text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors">
          {book.title}
        </h3>
        <p className="text-[11px] md:text-xs text-ink-muted truncate mt-1.5 font-sans tracking-wide">
          {authorName}
        </p>
      </div>
    </Link>
  );
}
