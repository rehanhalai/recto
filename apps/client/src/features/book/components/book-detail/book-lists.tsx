"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

interface CommunityList {
  id: string;
  title: string;
  curator: {
    userName: string;
  };
  bookCount: number;
  covers: string[];
}

interface BookListsResponse {
  data: CommunityList[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export function BookLists({ bookId }: { bookId: string }) {
  const { data, isLoading } = useQuery<BookListsResponse>({
    queryKey: ["book-community-lists", bookId],
    queryFn: async () =>
      apiInstance.get<BookListsResponse>("/lists", {
        bookId,
        page: 1,
        limit: 12,
      }),
    enabled: Boolean(bookId),
  });

  const lists = data?.data ?? [];

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading lists...</p>;
  }

  if (lists.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This book hasn&apos;t been added to any lists yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {lists.map((list) => (
        <Link
          key={list.id}
          href={`/lists/${list.id}`}
          className="block rounded-xl border border-border-subtle/70 bg-card/40 p-3 transition-colors hover:bg-card/70"
        >
          <p className="text-sm font-semibold text-foreground">{list.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            @{list.curator.userName} · {list.bookCount} books
          </p>

          <div className="mt-3 flex -space-x-2">
            {list.covers.slice(0, 4).map((cover, i) => (
              <div
                key={`${list.id}-${i}`}
                className="relative h-10 w-7 overflow-hidden rounded border border-background bg-muted"
                style={{ zIndex: 5 - i }}
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
}
