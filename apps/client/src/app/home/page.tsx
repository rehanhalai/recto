"use client";

import { useRouter } from "next/navigation";
import { BookResponse } from "@/features/home/service/home.service";
import { useBookStore } from "@/features/book/store/book-store";
import { useHomeStore } from "@/features/home/store/home-store";
import { useHomeData } from "@/features/home/hooks";
import {
  GenreSection,
  CuratedListsSection,
  TrendingArticlesSection,
  CTASection,
  ErrorAlert,
} from "@/features/home/components";

export default function HomePage() {
  const router = useRouter();

  // Fetch home data using React Query hook
  const { isLoading, error } = useHomeData();

  // Get data from Zustand store
  const genres = useHomeStore((state) => state.genres);
  const booksRecommendations = useHomeStore(
    (state) => state.booksRecommendations,
  );
  const bookLists = useHomeStore((state) => state.bookLists);
  const blogs = useHomeStore((state) => state.blogs);
  const setFetchBookPayload = useBookStore(
    (state) => state.setFetchBookPayload,
  );

  // Handle book card click
  const handleBookClick = (book: BookResponse) => {
    setFetchBookPayload({
      externalId: book.openLibraryId,
      title: book.title,
      authors: book.authors,
    });
    router.push(
      `/book/${book.openLibraryId}/${book.title.replaceAll(" ", "-")}`,
    );
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-paper">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-7 lg:py-10">
        {/* ===== ERROR ALERT ===== */}
        {error && <ErrorAlert error={error.message} />}

        {/* ===== GENRE-BASED RECOMMENDATIONS ===== */}
        {isLoading ? (
          genres.map((genre) => (
            <GenreSection
              key={genre}
              genre={genre}
              books={[]}
              isLoading={true}
              onBookClick={handleBookClick}
            />
          ))
        ) : Object.entries(booksRecommendations).length > 0 ? (
          Object.entries(booksRecommendations).map((genreEntry) => {
            const [genre, books] = genreEntry;
            if (!books || books.length === 0) return null;

            return (
              <GenreSection
                key={genre}
                genre={genre}
                books={books}
                isLoading={false}
                onBookClick={handleBookClick}
              />
            );
          })
        ) : (
          <section className="mb-20 text-center py-12">
            <p className="text-ink-muted dark:text-ink-muted">
              No book recommendations available at this time.
            </p>
          </section>
        )}

        {/* ===== PUBLIC BOOK LISTS ===== */}
        <CuratedListsSection lists={bookLists} isLoading={isLoading} />

        {/* ===== FEATURED BLOGS ===== */}
        <TrendingArticlesSection blogs={blogs} isLoading={isLoading} />

        {/* ===== CTA SECTION ===== */}
        <CTASection />
      </main>
    </div>
  );
}
