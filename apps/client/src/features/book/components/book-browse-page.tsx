"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { StandardLayout } from "@/components/layout";
import { SidebarLeft, SidebarRight } from "@/features/sidebar";
import { BOOK_GENRES } from "@/constants/genres";
import { apiInstance } from "@/lib/api";
import { useTrendingBooks } from "@/features/book/hooks/useTrendingBooks";
import { useGenreBooks } from "@/features/book/hooks/useGenreBooks";
import { searchBooks } from "@/features/book/service/search-books";
import { BookCarouselStrip } from "@/features/book/components/book-strips/book-carousel-strip";
import type { Book } from "@/features/book/types";

type CommunityList = {
  id: string;
  title: string;
  curator: {
    userName: string;
  };
  bookCount: number;
  covers: string[];
};

type CommunityListsResponse = {
  data: CommunityList[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  message: string;
};

function CommunityListCard({ list }: { list: CommunityList }) {
  return (
    <Link
      href={`/list/${list.id}`}
      className="group rounded-xl border border-border-subtle bg-card-surface p-4 transition-colors hover:border-border-subtle/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-sm font-semibold text-ink group-hover:text-accent transition-colors">
            {list.title}
          </h3>
          <p className="mt-1 text-xs text-ink-muted">
            @{list.curator.userName}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-paper px-2 py-1 text-[11px] text-ink-muted border border-border-subtle">
          {list.bookCount} books
        </span>
      </div>

      <div className="mt-4 flex -space-x-2">
        {Array.from({ length: 4 }).map((_, i) => {
          const cover = list.covers[i];
          return (
            <div
              key={`${list.id}-${i}`}
              className="relative h-16 w-11 overflow-hidden rounded-sm border border-border-subtle bg-paper"
              style={{ zIndex: 10 - i }}
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={list.title}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

function BrowseGenreStrip({
  genre,
  title,
  subtitle,
}: {
  genre: string;
  title: string;
  subtitle: string;
}) {
  const { data: books, isLoading } = useGenreBooks(genre, 8);

  return (
    <BookCarouselStrip
      title={title}
      subtitle={subtitle}
      href="/browse"
      books={books}
      isLoading={isLoading}
      compact
    />
  );
}

export function BookBrowsePage() {
  const featuredGenres = BOOK_GENRES.slice(0, 3);
  const trendingBooksQuery = useTrendingBooks(8);

  const suggestedBooksQuery = useQuery<Book[]>({
    queryKey: ["books", "browse", "suggested"],
    queryFn: () => searchBooks("subject:classics", 8, 1),
    staleTime: 1000 * 60 * 30,
  });

  const communityListsQuery = useQuery<CommunityList[]>({
    queryKey: ["books", "browse", "community-lists"],
    queryFn: async () => {
      const response = await apiInstance.get<CommunityListsResponse>("/lists", {
        page: 1,
        limit: 6,
      });

      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  return (
    <StandardLayout
      leftSidebar={<SidebarLeft />}
      rightSidebar={<SidebarRight />}
    >
      <div className="space-y-10">
        <section className="rounded-2xl border border-border-subtle bg-card-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            Discover
          </p>
          <h1 className="mt-2 text-3xl font-serif italic font-semibold text-ink">
            Browse Books and Lists
          </h1>
          <p className="mt-2 text-sm text-ink-muted max-w-2xl">
            Explore trending reads, curated genres, and community-created book
            lists.
          </p>
        </section>

        <BookCarouselStrip
          title="Trending Books"
          subtitle="Currently popular"
          href="/browse"
          books={trendingBooksQuery.data}
          isLoading={trendingBooksQuery.isLoading}
          compact
        />

        <BookCarouselStrip
          title="Suggested For You"
          subtitle="Editor picks to start with"
          href="/browse"
          books={suggestedBooksQuery.data}
          isLoading={suggestedBooksQuery.isLoading}
          compact
        />

        {featuredGenres.map((genre) => (
          <BrowseGenreStrip
            key={genre.id}
            genre={genre.id}
            title={genre.title}
            subtitle={genre.subtitle}
          />
        ))}

        <section className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif italic text-ink">
                Community Lists
              </h2>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-muted mt-1">
                Curated by readers
              </p>
            </div>
            <div
              // href="/lists"
              className="text-sm text-ink-muted hover:text-ink transition-colors"
            >
              See all lists
            </div>
          </div>

          {communityListsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`list-skeleton-${i}`}
                  className="h-32 rounded-xl border border-border-subtle bg-card-surface animate-pulse"
                />
              ))}
            </div>
          ) : (communityListsQuery.data ?? []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(communityListsQuery.data ?? []).map((list) => (
                <CommunityListCard key={list.id} list={list} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border-subtle bg-card-surface p-4 text-sm text-ink-muted">
              No public lists available yet.
            </div>
          )}
        </section>
      </div>
    </StandardLayout>
  );
}
