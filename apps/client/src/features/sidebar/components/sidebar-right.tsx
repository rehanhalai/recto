"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/UserAvatar";
import { useTrendingBooks } from "@/features/book/hooks/useTrendingBooks";
import { useSuggestedUsers } from "../hooks/use-suggested-users";
import { useFeaturedList } from "../hooks/use-featured-list";
import { cn } from "@/lib/utils";

export function SidebarRight() {
  return (
    <div className="py-2 space-y-5 overflow-y-auto h-full">
      <TrendingSection />
      <Separator className="bg-border-subtle/60" />
      <ReadersToFollowSection />
      <Separator className="bg-border-subtle/60" />
      <FeaturedListSection />
    </div>
  );
}

/* ── Trending Books ───────────────────────────────────────────── */

function TrendingSection() {
  const { data: books, isLoading } = useTrendingBooks();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted font-medium">
          Trending this week
        </h3>
        <Link
          href="/books?sort=trending"
          className="text-[10px] font-mono text-ink-muted hover:text-ink transition-colors flex items-center gap-0.5"
        >
          See all <ArrowRight size={10} weight="bold" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="aspect-2/3 w-full rounded" />
              <Skeleton className="h-2.5 w-full" />
            </div>
          ))}
        </div>
      ) : books && books.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {books.slice(0, 6).map((book, index) => (
            <Link
              key={book.id}
              href={`/book/${book.id}/${book.title.replaceAll(" ", "-")}`}
              className="group flex flex-col gap-1.5"
            >
              <div className="relative aspect-2/3 w-full rounded overflow-hidden bg-card-surface border border-border-subtle">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="60px"
                  />
                ) : (
                  <div className="w-full h-full bg-border-subtle/30 flex items-center justify-center">
                    <span className="text-[8px] text-ink-muted font-mono">
                      No cover
                    </span>
                  </div>
                )}
                {/* Rank badge */}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full bg-paper/90 dark:bg-card/90 backdrop-blur-sm text-[9px] font-mono font-bold text-ink border border-border-subtle/50">
                  #{index + 1}
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-tight line-clamp-2 group-hover:text-ink transition-colors">
                {book.title}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted italic">
          No trending books right now.
        </p>
      )}
    </section>
  );
}

/* ── Readers to Follow ────────────────────────────────────────── */

function ReadersToFollowSection() {
  const { data: users, isLoading } = useSuggestedUsers();

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted font-medium">
          Readers to follow
        </h3>
        <Link
          href="/search?tab=people"
          className="text-[10px] font-mono text-ink-muted hover:text-ink transition-colors flex items-center gap-0.5"
        >
          More <ArrowRight size={10} weight="bold" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <div className="space-y-3">
          {users.slice(0, 5).map((user) => (
            <UserSuggestionCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted italic">
          No suggestions available.
        </p>
      )}
    </section>
  );
}

function UserSuggestionCard({
  user,
}: {
  user: {
    id: string;
    userName: string;
    fullName: string | null;
    avatarImage: string | null;
  };
}) {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <Link href={`/user/${user.userName}`} className="shrink-0">
        <UserAvatar
          src={user.avatarImage}
          fallbackName={user.fullName ?? user.userName}
          className="w-9 h-9"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/user/${user.userName}`}
          className="text-sm font-medium text-ink truncate block hover:underline leading-tight"
        >
          {user.fullName ?? user.userName}
        </Link>
        <p className="text-xs text-ink-muted truncate">@{user.userName}</p>
      </div>
      <button
        onClick={() => setIsFollowing((f) => !f)}
        className={cn(
          "shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border",
          isFollowing
            ? "bg-card-surface border-border-subtle text-ink-muted"
            : "bg-transparent border-border-subtle text-ink hover:bg-card-surface",
        )}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}

/* ── Featured List ────────────────────────────────────────────── */

function FeaturedListSection() {
  const { data: list, isLoading } = useFeaturedList();

  return (
    <section>
      <h3 className="text-xs font-mono uppercase tracking-wider text-ink-muted font-medium mb-3">
        Featured list
      </h3>

      {isLoading ? (
        <div className="rounded-xl border border-border-subtle p-3 space-y-3">
          <div className="flex -space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-7 h-10 rounded border-2 border-paper"
              />
            ))}
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : list ? (
        <Link
          href={`/lists/${list.id}`}
          className="group block rounded-xl border border-border-subtle p-3 hover:bg-card-surface/50 transition-colors"
        >
          {/* Overlapping book covers */}
          <div className="flex -space-x-2 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="relative w-7 h-10 rounded overflow-hidden border-2 border-paper bg-card-surface shrink-0"
                style={{ zIndex: 5 - i }}
              >
                {list.covers[i] ? (
                  <Image
                    src={list.covers[i]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: `hsl(${30 + i * 25}, 30%, ${75 - i * 5}%)`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-sm font-medium text-ink leading-tight group-hover:text-accent-dark transition-colors">
            {list.title}
          </p>
          <p className="text-xs text-ink-muted mt-0.5">
            {list.bookCount} books · by @{list.curatorUsername}
          </p>
        </Link>
      ) : null}
    </section>
  );
}
