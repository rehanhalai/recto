import { StarIcon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui";

interface BookCardProps {
  book: {
    openLibraryId: string;
    title: string;
    authors: string[];
    coverImage: string;
    averageRating: number;
  };
  onBookClick: (book: any) => void;
}

export const BookCard = ({ book, onBookClick }: BookCardProps) => (
  <button
    onClick={() => onBookClick(book)}
    className="h-full block w-full text-left"
  >
    <Card className="bg-card-surface dark:bg-card-surface/50 py-3 shadow-xl dark:shadow-lg hover:shadow-2xl dark:hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group h-full">
      <CardContent className="p-0 h-full flex flex-col">
        {/* Book Cover */}
        <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-linear-to-br from-border-subtle to-border-subtle dark:from-border-subtle/60 dark:to-border-subtle/60 m-3 shrink-0">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        </div>

        {/* Book Info */}
        <div className="px-4 pb-4 grow flex flex-col space-y-2">
          <h3 className="font-bold text-xl text-ink dark:text-ink line-clamp-2 tracking-tight">
            {book.title}
          </h3>
          <p className="text-sm text-ink-muted dark:text-ink-muted">
            {book.authors.length > 3
              ? book.authors.slice(0, 3).join(", ") + ", ..."
              : book.authors.join(", ")}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-auto pt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(book.averageRating)
                      ? "fill-accent text-accent dark:fill-accent dark:text-accent"
                      : "text-border-black dark:text-border-white"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-ink-muted dark:text-ink-muted">
              {book.averageRating}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  </button>
);
