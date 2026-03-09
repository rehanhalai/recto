import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui";
import { BookResponse } from "@/features/home/service/home.service";
import { BookCard } from "./book-card";
import { BookCardSkeleton } from "./skeletons";

interface GenreSectionProps {
  genre: string;
  books: BookResponse[];
  isLoading: boolean;
  onBookClick: (book: any) => void;
}

export const GenreSection = ({
  genre,
  books,
  isLoading,
  onBookClick,
}: GenreSectionProps) => {
  if (isLoading) {
    return (
      <section className="mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div className="h-10 bg-border-subtle dark:bg-border-subtle/40 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <section className="mb-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
        <h2 className="italic-serif text-3xl md:text-4xl text-ink dark:text-ink">
          {genre}
        </h2>
        <Link
          href={`/explore/genre/${genre.toLowerCase()}`}
          className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-accent-dark dark:text-accent hover:text-accent-dark/80 dark:hover:text-accent/80 transition-colors whitespace-nowrap"
        >
          Explore All
          <CaretRightIcon className="w-4 h-4" />
        </Link>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 sm:-ml-4 md:-ml-6 -my-2">
          {books.map((book) => (
            <CarouselItem
              key={book.openLibraryId}
              className="pl-2 sm:pl-4 md:pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
            >
              <BookCard book={book} onBookClick={onBookClick} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-6 bg-card-surface dark:bg-card-surface border-0 shadow-lg text-ink dark:text-ink hover:bg-card-surface/80 dark:hover:bg-card-surface/80" />
        <CarouselNext className="hidden md:flex -right-6 bg-card-surface dark:bg-card-surface border-0 shadow-lg text-ink dark:text-ink hover:bg-card-surface/80 dark:hover:bg-card-surface/80" />
      </Carousel>
    </section>
  );
};
