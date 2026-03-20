"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  BookmarkSimple,
  Export,
  ListPlus,
  StarIcon,
  StarHalfIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useAuth } from "@/features/auth";
import { addBookToList, getUserLists } from "../service/list-api";
import type { Book } from "../types";

type TrackerStatus = "wishlist" | "reading" | "finished";

interface TrackerEntry {
  id: string;
  bookId: string;
  status: TrackerStatus;
}

export function BookHero({
  book,
  fallbackAuthor,
}: {
  book: Book;
  fallbackAuthor?: string;
}) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [coverError, setCoverError] = useState(false);
  const [optimisticStatus, setOptimisticStatus] =
    useState<TrackerStatus | null>(null);

  const firstAuthor = useMemo(() => {
    const author = book.authors?.[0];
    if (!author) return fallbackAuthor;
    if (typeof author === "string") return author;
    return author.authorName;
  }, [book.authors, fallbackAuthor]);

  const trackersQuery = useQuery<{ data: TrackerEntry[] } | TrackerEntry[]>({
    queryKey: ["book-tracker-status", book.id],
    queryFn: async () => {
      const [wishlist, reading, finished] = await Promise.all([
        apiInstance.get<{ data: TrackerEntry[] } | TrackerEntry[]>("/tracker", {
          status: "wishlist",
        }),
        apiInstance.get<{ data: TrackerEntry[] } | TrackerEntry[]>("/tracker", {
          status: "reading",
        }),
        apiInstance.get<{ data: TrackerEntry[] } | TrackerEntry[]>("/tracker", {
          status: "finished",
        }),
      ]);

      const normalize = (res: { data: TrackerEntry[] } | TrackerEntry[]) =>
        Array.isArray(res) ? res : (res.data ?? []);

      return {
        data: [
          ...normalize(wishlist),
          ...normalize(reading),
          ...normalize(finished),
        ],
      };
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const entry = (
    Array.isArray(trackersQuery.data)
      ? trackersQuery.data
      : (trackersQuery.data?.data ?? [])
  ).find((item) => item.bookId === book.id);

  const currentStatus = optimisticStatus ?? entry?.status ?? null;

  const upsertTracker = useMutation({
    mutationFn: async (status: TrackerStatus) => {
      return apiInstance.post("/tracker/tbrbook", {
        bookId: book.id,
        status,
      });
    },
    onMutate: async (status) => {
      setOptimisticStatus(status);
      return { previousStatus: currentStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["book-tracker-status", book.id],
      });
      toast.success("Shelf updated");
    },
    onError: (_error, _status, context) => {
      setOptimisticStatus(context?.previousStatus ?? null);
      toast.error("Could not update shelf");
    },
    onSettled: () => {
      setOptimisticStatus(null);
    },
  });

  const userListsQuery = useQuery({
    queryKey: ["user-lists"],
    queryFn: getUserLists,
    enabled: isAuthenticated,
  });

  const addToListMutation = useMutation({
    mutationFn: async (listId: string) =>
      addBookToList({ listId, book_id: book.id }),
    onSuccess: () => toast.success("Added to list"),
    onError: () => toast.error("Could not add to list"),
  });

  const userLists = userListsQuery.data?.data ?? [];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Copied!");
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const rating = Number(book.averageRating ?? 0);
  const ratingsCount = Number(book.ratingsCount ?? 0);
  const pages = book.pageCount ?? 0;

  return (
    <section className="space-y-4 rounded-2xl border border-border-subtle/70 bg-card/70 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative w-[160px] shrink-0">
          <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] bg-muted shadow-lg border border-border-subtle/60">
            {book.coverImage && !coverError ? (
              <Image
                src={book.coverImage.replace("L", "M")}
                alt={book.title}
                fill
                className="object-cover"
                sizes="160px"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xl font-semibold">
                {getBookInitials(book.title)}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-3xl font-serif font-medium leading-tight text-foreground">
            {book.title}
          </h1>

          <p className="text-base text-muted-foreground">
            by{" "}
            <Link
              className="text-foreground hover:underline"
              href={`/search?q=${encodeURIComponent(firstAuthor || "")}`}
            >
              {firstAuthor || "Unknown"}
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            {rating > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  {renderStars(rating)}
                </div>
                <span>{rating.toFixed(1)}</span>
                <span>·</span>
                <span>{ratingsCount} reviews</span>
              </>
            ) : (
              <span>No ratings yet</span>
            )}
            <span>·</span>
            <span>{book.language || "Unknown"}</span>
            {pages > 0 && (
              <>
                <span>·</span>
                <span>{pages} pages</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {(book.genres || []).slice(0, 6).map((genre) => (
              <Link
                key={genre}
                href={`/books?genre=${encodeURIComponent(genre)}`}
              >
                <Badge
                  variant="secondary"
                  className="rounded-full border border-border-subtle/70 bg-muted/50 text-xs text-muted-foreground hover:bg-muted"
                >
                  {genre}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button
          className={
            currentStatus === "reading"
              ? "bg-muted text-foreground hover:bg-muted"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          }
          onClick={() => upsertTracker.mutate("reading")}
          disabled={!isAuthenticated || upsertTracker.isPending}
        >
          <BookOpen size={18} className="mr-2" />
          {currentStatus === "reading"
            ? "Currently reading ✓"
            : "Mark as reading"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={!isAuthenticated || upsertTracker.isPending}
            >
              <BookmarkSimple size={18} className="mr-2" />
              Add to shelf
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuItem onClick={() => upsertTracker.mutate("wishlist")}>
              Want to Read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => upsertTracker.mutate("reading")}>
              Currently Reading
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => upsertTracker.mutate("finished")}>
              Read
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" disabled={!isAuthenticated}>
              <ListPlus size={18} className="mr-2" />
              Add to list
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Choose a list</SheetTitle>
              <SheetDescription>
                Add this book to one of your lists.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {userLists.map((list: any) => (
                <Button
                  key={list.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => addToListMutation.mutate(list.id)}
                  disabled={addToListMutation.isPending}
                >
                  <span className="truncate">{list.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {list.book_count || 0} books
                  </span>
                </Button>
              ))}
              {!userListsQuery.isLoading && userLists.length === 0 && (
                <p className="text-sm text-muted-foreground">No lists yet.</p>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="outline"
          onClick={handleShare}
          className="sm:justify-center"
        >
          <Export size={18} />
          <span className="ml-2 sm:sr-only">Share</span>
        </Button>
      </div>
    </section>
  );
}

function getBookInitials(title: string) {
  const words = title.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w.charAt(0).toUpperCase()).join("") || "BK";
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, i) => {
    const star = i + 1;
    if (rating >= star) {
      return (
        <StarIcon key={i} size={14} weight="fill" className="text-amber-400" />
      );
    }
    if (rating >= star - 0.5) {
      return (
        <StarHalfIcon
          key={i}
          size={14}
          weight="fill"
          className="text-amber-400"
        />
      );
    }
    return <StarIcon key={i} size={14} className="text-amber-400/40" />;
  });
}
