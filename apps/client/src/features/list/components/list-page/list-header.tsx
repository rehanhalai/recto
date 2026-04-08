"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";

interface ListHeaderProps {
  list: any;
  formatDate: (date: string) => string;
}

export function ListHeader({ list, formatDate }: ListHeaderProps) {
  return (
    <section className="relative w-full pt-16 pb-8 px-6 sm:px-8 flex flex-col sm:flex-row gap-6 items-end bg-linear-to-b from-indigo-900/30 via-background/95 to-background border-b border-border-subtle/10">
      <div className="absolute inset-0 bg-linear-to-t from-background to-transparent pointer-events-none" />

      <div className="relative z-10 shrink-0 group mx-auto sm:mx-0">
        <div className="relative w-48 h-70 sm:w-52 sm:h-80 rounded-lg overflow-hidden shadow-2xl bg-muted/30 border border-white/5 transition-transform duration-300 group-hover:scale-[1.02]">
          {list.items?.[0]?.book?.coverImage ? (
            <Image
              src={list.items[0].book.coverImage}
              alt={list.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-ink/20 font-serif">
              {list.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1 w-full pb-1">
        <h1 className="text-4xl sm:text-5xl font-serif font-black mb-3 text-foreground tracking-tight line-clamp-2 leading-tight">
          {list.name}
        </h1>
        {list.description && (
          <p className="text-ink-muted text-base mb-4 max-w-2xl line-clamp-2">
            {list.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-2 text-sm font-medium">
          <div className="flex items-center gap-2 group cursor-pointer">
            <UserAvatar
              src={list.user?.avatarImage}
              fallbackName={list.user?.userName || "Unknown"}
              className="w-5 h-5 border-white/5"
            />
            <span className="text-foreground hover:underline transition">
              {list.user?.userName || "unknown"}
            </span>
          </div>
          <span className="text-ink-muted/30">•</span>
          <span className="text-foreground font-semibold">
            {list.bookCount || list.items?.length || 0} books
          </span>
          <span className="text-ink-muted/30">•</span>
          <span className="text-ink-muted">
            updated {formatDate(list.updatedAt || list.createdAt)}
          </span>
        </div>
      </div>
    </section>
  );
}
