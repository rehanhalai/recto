"use client";

import React, { useState, useEffect } from "react";
import type { PostWithRelations, PaginatedResponse } from "@recto/types";
import { TrendingBooksStrip } from "@/features/book/components/book-strips/TrendingBooksStrip";
import { GenreBooksStrip } from "@/features/book/components/book-strips/GenreBooksStrip";
import { FeedSection } from "./FeedSection";
import { useCurrentRead } from "../hooks/useCurrentRead";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkle } from "@phosphor-icons/react";
import { BOOK_GENRES, type GenreMetadata } from "@/constants/genres";
import { useRouter } from "next/navigation";
import { PostCard } from "./PostCard";

interface FeedHomeProps {
  initialPosts: PaginatedResponse<PostWithRelations>;
}

export function FeedHome({ initialPosts }: FeedHomeProps) {
  const router = useRouter();
  const { data: currentRead } = useCurrentRead();
  const [randomGenres, setRandomGenres] = useState<GenreMetadata[]>([]);

  // Take top 5 posts only for the home feed
  const topPosts = initialPosts?.data?.slice(0, 5) ?? [];

  useEffect(() => {
    // Pick 5 random genres from the constant
    const shuffled = [...BOOK_GENRES].sort(() => 0.5 - Math.random());
    setRandomGenres(shuffled.slice(0, 5));
  }, []);

  const handleLike = (postId: string) => {
    // Redrect to post page or show a toast if we don't want complex logic on home
    router.push(`/posts/${postId}`);
  };

  const handleComment = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Hero / Currently Reading Section */}
      <article className="relative overflow-hidden rounded-2xl bg-card-surface border border-border-subtle p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper border border-border-subtle text-ink-muted text-xs font-mono uppercase tracking-wider">
              <Sparkle size={14} weight="fill" className="text-amber-500" />
              Your Daily Read
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-ink font-bold tracking-tight">
              {currentRead
                ? "Continue your journey"
                : "Discover your next story"}
            </h1>
            <p className="text-ink-muted leading-relaxed max-w-md mx-auto md:mx-0">
              Pick up where you left off or find something entirely new from our
              curated collection.
            </p>
          </div>

          {currentRead &&
            currentRead.map((read: (typeof currentRead)[0]) => (
              <Link
                key={read.id}
                href={`/book/${read.book.id}/${read.book.title.replaceAll(" ", "-")}`}
                className="group relative shrink-0 transition-transform hover:scale-105 active:scale-95"
              >
                <div className="w-32 md:w-40 aspect-2/3 rounded shadow-xl overflow-hidden border-2 border-white/50 bg-card-surface">
                  {read.book.coverImage && (
                    <Image
                      src={read.book.coverImage}
                      alt={read.book.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-paper p-2 rounded-full shadow-lg border border-border-subtle group-hover:bg-card-surface transition-colors">
                  <BookOpen size={20} weight="bold" className="text-ink" />
                </div>
              </Link>
            ))}
        </div>
      </article>

      {/* Community Highlights - Top 5 Posts */}
      {topPosts.length > 0 && (
        <FeedSection title="Community Highlights" href="/posts">
          <div className="flex flex-col gap-6">
            {topPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}

            <Link
              href="/posts"
              className="group flex items-center justify-center gap-2 py-4 border border-dashed border-border-subtle rounded-xl hover:bg-card-surface transition-colors"
            >
              <span className="text-sm font-medium text-ink-muted group-hover:text-ink">
                See more discussions
              </span>
              <ArrowRight
                size={16}
                className="text-ink-muted group-hover:text-ink transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </FeedSection>
      )}

      <TrendingBooksStrip />

      {randomGenres.map((genre) => (
        <GenreBooksStrip
          key={genre.id}
          genre={genre.id}
          title={genre.title}
          subtitle={genre.subtitle}
        />
      ))}

      <FeedSection title="Popular Lists" href="/lists">
        <div className="w-full flex flex-col gap-4">
          <div className="w-full h-24 bg-card-surface/50 rounded-xl flex items-center justify-center border border-border-subtle p-6 group cursor-not-allowed">
            <span className="text-sm text-ink-muted italic group-hover:text-ink transition-colors">
              Coming soon: Curated collections of must-reads...
            </span>
          </div>
        </div>
      </FeedSection>
    </div>
  );
}
