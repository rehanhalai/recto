"use client";

import { useSearch } from "../api/search";
import { BookCard } from "@/features/book/components/book-strips/book-card";
import { deduplicateByKey } from "@/lib/deduplicate";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  BookBookmark,
  ListBullets,
  Books,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  query: string;
  onTabChange: (tab: string) => void;
}

export function SearchOverview({ query, onTabChange }: Props) {
  const { data, isLoading } = useSearch(query, "all");

  if (isLoading)
    return (
      <div className="animate-pulse space-y-12">
        <div className="h-40 bg-card-surface/50 rounded-xl" />
        <div className="h-40 bg-card-surface/50 rounded-xl" />
        <div className="h-40 bg-card-surface/50 rounded-xl" />
      </div>
    );

  if (!data) return null;

  const { lists } = data;
  const books = deduplicateByKey(
    data.books || [],
    (b: any) => b.sourceId || b.id,
  );
  // Force even count for balanced grid (4 or 6, never 5)
  const rawUsers: any[] = data.users || [];
  const users =
    rawUsers.length % 2 !== 0 ? rawUsers.slice(0, rawUsers.length - 1) : rawUsers;

  const noResults = !users?.length && !books?.length && !lists?.length;

  if (noResults) {
    return (
      <div className="text-center py-20 bg-card-surface/30 rounded-2xl border border-border-subtle backdrop-blur-sm">
        <h3 className="text-xl font-serif text-ink mb-2">No results found</h3>
        <p className="text-ink-muted">
          We couldn't find anything matching "{query}".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Books Section */}
      {books?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
              <BookBookmark className="text-gold" weight="duotone" />
              Books
            </h2>
            <Button
              variant="ghost"
              onClick={() => onTabChange("books")}
              className="text-ink-muted hover:text-ink"
            >
              View All Books
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10">
            {books.map((book: any, i: number) => (
              <BookCard
                key={book.id || book.volumeId}
                book={book}
                featured={i === 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* Users Section */}
      {users?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
              <UserIcon className="text-accent" weight="duotone" />
              Readers
            </h2>
            <Button
              variant="ghost"
              onClick={() => onTabChange("users")}
              className="text-ink-muted hover:text-ink"
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user: any) => (
              <Link
                href={`/${user.userName}`}
                key={user.id}
                className="group flex items-center gap-4 p-4 rounded-xl bg-card-surface border border-border-subtle hover:border-accent/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-accent/30 transition-all shrink-0">
                  <AvatarImage src={user.avatarImage || ""} />
                  <AvatarFallback className="bg-accent/10 text-accent font-bold text-lg">
                    {user.userName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-ink truncate group-hover:text-accent transition-colors">
                    {user.fullName || user.userName}
                  </p>
                  <p className="text-sm text-ink-muted truncate">
                    @{user.userName}
                  </p>
                  {(user.bio || user.booksCount != null) && (
                    <div className="flex items-center gap-2 mt-1">
                      {user.booksCount != null && (
                        <span className="text-xs text-ink-muted/70 flex items-center gap-1">
                          <Books weight="fill" className="w-3 h-3" />
                          {user.booksCount} books
                        </span>
                      )}
                      {user.bio && (
                        <span className="text-xs text-ink-muted/50 truncate">
                          {user.bio}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lists Section */}
      {lists?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-ink flex items-center gap-2">
              <ListBullets className="text-green-500" weight="duotone" />
              Lists
            </h2>
            <Button
              variant="ghost"
              onClick={() => onTabChange("lists")}
              className="text-ink-muted hover:text-ink"
            >
              View All Lists
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {lists.map((list: any) => (
              <Link
                href={`/lists/${list.id}`}
                key={list.id}
                className="group p-5 rounded-xl bg-card-surface border border-border-subtle hover:border-green-500/40 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-1">
                      {list.name}
                    </h3>
                    <p className="text-sm text-ink-muted mt-1 line-clamp-2">
                      {list.description}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 whitespace-nowrap shrink-0">
                    {list.book_count || 0} books
                  </span>
                </div>

                {/* Bigger cover thumbnails */}
                {list.covers?.length > 0 && (
                  <div className="flex -space-x-2 mt-1">
                    {list.covers.slice(0, 4).map((c: string, i: number) => (
                      <div
                        key={i}
                        className="w-12 h-17 relative rounded-md overflow-hidden border-2 border-card ring-1 ring-border-subtle shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5"
                        style={{
                          zIndex: 10 - i,
                          transitionDelay: `${i * 40}ms`,
                        }}
                      >
                        <Image
                          src={c}
                          alt="Cover"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1 pt-3 border-t border-border-subtle/50">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={list.user?.avatarImage || ""} />
                    <AvatarFallback className="text-[9px] bg-border-subtle text-ink">
                      {list.user?.userName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-ink-muted">
                    Curated by @{list.user?.userName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
