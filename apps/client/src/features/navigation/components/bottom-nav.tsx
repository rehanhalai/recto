"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  House,
  MagnifyingGlass,
  PencilSimple,
  Bell,
  UserCircle,
  BookOpenText,
  Image as ImageIcon,
  X,
} from "@phosphor-icons/react";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuthStore } from "@/features/auth";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { searchBooks } from "@/features/book/service/search-books";
import type { Book } from "@/features/book/types";
import { Button, Input, Label } from "@/components/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type BookSearchResult = {
  id?: string;
  sourceId: string;
  title: string;
  authors: string[];
  coverImage?: string;
};

const MIN_SEARCH_LENGTH = 2;

const toBookSearchResult = (book: Book): BookSearchResult => {
  const authors = (book.authors ?? [])
    .map((author) => {
      if (typeof author === "string") {
        return author;
      }

      if (
        author &&
        typeof author === "object" &&
        "authorName" in author &&
        typeof (author as { authorName?: unknown }).authorName === "string"
      ) {
        return (author as { authorName: string }).authorName;
      }

      return "";
    })
    .filter((value) => value.length > 0);

  return {
    id: book.id,
    sourceId: book.sourceId,
    title: book.title,
    authors,
    coverImage: book.coverImage ?? undefined,
  };
};

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { unreadCount } = useNotifications();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [content, setContent] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const previewUrl = useMemo(() => {
    if (!selectedImage) {
      return null;
    }
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const booksQuery = useQuery({
    queryKey: ["bottom-nav", "create-post", "books", bookQuery],
    queryFn: async () => {
      const books = await searchBooks(bookQuery, 8, 1);
      return books.map(toBookSearchResult);
    },
    enabled: isComposeOpen && bookQuery.trim().length >= MIN_SEARCH_LENGTH,
    staleTime: 1000 * 60,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", content.trim());

      if (selectedBook) {
        const resolvedBook = await apiInstance.get<{
          id?: string;
          data?: { id?: string };
        }>(`/book/${encodeURIComponent(selectedBook.sourceId)}`);

        const resolvedBookId = resolvedBook.id ?? resolvedBook.data?.id;
        if (resolvedBookId) {
          formData.append("bookId", resolvedBookId);
        }
      }

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      return apiInstance.post("/posts", formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed", "posts"] });
      toast.success("Post created successfully.");
      setContent("");
      setBookQuery("");
      setSelectedBook(null);
      setSelectedImage(null);
      setIsComposeOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "Unable to create post right now.";
      toast.error(message);
    },
  });

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    event.target.value = "";
  };

  const canSubmit = content.trim().length > 0 && !createPostMutation.isPending;

  const isActive = (href: string) => {
    if (href === "/feed") return pathname === "/feed";
    if (href === "/search") return pathname === "/search";
    if (href === "/notifications") return pathname === "/notifications";
    if (href === "/profile")
      return user ? pathname.startsWith(`/user/${user.userName}`) : false;
    return false;
  };

  const feedActive = isActive("/feed");
  const searchActive = isActive("/search");
  const notificationsActive = isActive("/notifications");
  const profileActive = isActive("/profile");

  const profileHref = user ? `/user/${user.userName}` : "/profile";

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 block lg:hidden z-40",
          "bg-card/95 dark:bg-card/95 backdrop-blur-md border-t border-border-subtle",
          "h-16",
        )}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="h-16 flex items-center justify-around px-2 max-w-full overflow-hidden">
          {/* Feed */}
          <NavItem
            href="/feed"
            icon={House}
            label="Feed"
            active={feedActive}
            iconSize={24}
          />

          {/* Search */}
          <NavItem
            href="/search"
            icon={MagnifyingGlass}
            label="Search"
            active={searchActive}
            iconSize={24}
          />

          {/* Compose Button (Center, Primary Action) */}
          <button
            onClick={() => setIsComposeOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center",
              "relative -mt-3", // Elevate above the navbar
              "w-12 h-12 rounded-2xl", // 48px × 48px, rounded square
              "bg-accent hover:bg-accent/90 transition-all duration-150",
              "active:scale-95",
              "ring ring-paper dark:ring-card",
              "flex-shrink-0",
              "shadow-lg",
            )}
            aria-label="Compose post"
            type="button"
          >
            <PencilSimple size={22} weight="bold" className="text-black" />
          </button>

          {/* Notifications */}
          <NavItem
            href="/notifications"
            icon={Bell}
            label="Notifications"
            active={notificationsActive}
            iconSize={24}
            badge={unreadCount > 0 ? unreadCount : undefined}
          />

          {/* Profile */}
          <ProfileNavItem
            href={profileHref}
            user={user}
            active={profileActive}
          />
        </div>
      </nav>

      {/* Compose Sheet Modal */}
      <Sheet open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-2xl bg-[#17130f] text-[#f4eee5] border-[#2c241c]"
        >
          <SheetHeader>
            <SheetTitle>Create a Post</SheetTitle>
          </SheetHeader>

          {!isAuthenticated ? (
            <div className="space-y-4 py-6 text-center">
              <p className="text-sm text-[#d1c5b5]">
                You are not logged in. Login or signup to create a post.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link href="/login" onClick={() => setIsComposeOpen(false)}>
                  <Button type="button" variant="ghost">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsComposeOpen(false)}>
                  <Button type="button">Signup</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
                Mention book
              </Label>
              <div className="relative">
                <MagnifyingGlass
                  size={18}
                  className="pointer-events-none absolute left-3 top-3 text-ink-muted"
                />
                <Input
                  value={bookQuery}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setBookQuery(event.target.value)
                  }
                  placeholder="Search by title"
                  className="h-11 rounded-lg border-border-subtle bg-card-surface pl-10 text-ink"
                />
              </div>

              {selectedBook && (
                <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-card-surface px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {selectedBook.title}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {(selectedBook.authors || []).join(", ") || "Unknown"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedBook(null)}
                    className="text-ink-muted hover:text-ink"
                  >
                    Remove
                  </Button>
                </div>
              )}

              {!selectedBook && bookQuery.trim().length >= MIN_SEARCH_LENGTH && (
                <div className="max-h-56 overflow-y-auto rounded-lg border border-border-subtle bg-card-surface/60">
                  {booksQuery.isLoading ? (
                    <p className="px-3 py-2 text-sm text-ink-muted">
                      Searching books...
                    </p>
                  ) : booksQuery.data && booksQuery.data.length > 0 ? (
                    booksQuery.data.map((book) => (
                      <button
                        key={book.sourceId}
                        type="button"
                        onClick={() => {
                          setSelectedBook(book);
                          setBookQuery(book.title);
                        }}
                        className="flex w-full items-center gap-3 border-b border-border-subtle px-3 py-2 text-left transition hover:bg-card-surface"
                      >
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded border border-border-subtle bg-card">
                          {book.coverImage ? (
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <BookOpenText
                                size={14}
                                className="text-ink-muted"
                              />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {book.title}
                          </p>
                          <p className="truncate text-xs text-ink-muted">
                            {(book.authors || []).join(", ") || "Unknown"}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-ink-muted">
                      No books found.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
                Your post
              </Label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={500}
                placeholder="What do you think about this book?"
                className="min-h-28 w-full rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm text-ink outline-none ring-0 transition focus:border-accent"
              />
              <p className="text-right text-xs text-ink-muted">
                {content.length}/500
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">
                Media
              </Label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="post-media-input-mobile"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm text-ink-muted transition hover:text-ink"
                >
                  <ImageIcon size={16} />
                  Add image
                </label>
                <input
                  id="post-media-input-mobile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelection}
                  className="sr-only"
                />
                <p className="text-xs text-ink-muted">Max 1 image</p>
              </div>

              {previewUrl && (
                <div className="relative mt-2 h-40 w-full overflow-hidden rounded-lg border border-border-subtle bg-card-surface">
                  <Image
                    src={previewUrl}
                    alt="Selected media preview"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label="Remove selected image"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border-subtle pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsComposeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canSubmit}
                onClick={() => createPostMutation.mutate()}
              >
                {createPostMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  iconSize: number;
  badge?: number;
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  iconSize,
  badge,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center",
        "relative w-16 h-16",
        "transition-colors duration-150",
        "min-h-11 min-w-11", // Ensure 44px minimum tap target
        "group",
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill above icon */}
      {active && (
        <div className="absolute top-0 w-1 h-1 rounded-full bg-accent mb-1" />
      )}

      {/* Icon container with badge */}
      <div className="relative flex items-center justify-center mb-1">
        <Icon
          size={iconSize}
          weight={active ? "fill" : "regular"}
          className={cn(
            "transition-colors duration-150",
            active ? "text-accent" : "text-ink-muted group-hover:text-ink",
          )}
        />

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent border-1.5 border-card dark:border-card-surface" />
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          "transition-colors duration-150",
          "whitespace-nowrap",
          active ? "text-accent" : "text-ink-muted group-hover:text-ink",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

interface ProfileNavItemProps {
  href: string;
  user: {
    avatarImage?: string | null;
    fullName?: string | null;
    userName: string;
  } | null;
  active: boolean;
}

function ProfileNavItem({ href, user, active }: ProfileNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center",
        "relative w-16 h-16",
        "transition-colors duration-150",
        "min-h-11 min-w-11",
        "group",
      )}
      aria-current={active ? "page" : undefined}
    >
      {/* Active indicator pill above icon */}
      {active && (
        <div className="absolute top-0 w-1 h-1 rounded-full bg-accent mb-1" />
      )}

      {/* Avatar Icon */}
      <div className="mb-1">
        {user ? (
          <UserAvatar
            src={user.avatarImage || null}
            fallbackName={user.fullName ?? user.userName}
            className={cn(
              "w-6 h-6 transition-opacity duration-150",
              active ? "opacity-100" : "opacity-75 group-hover:opacity-100",
            )}
          />
        ) : (
          <div
            className={cn(
              "transition-colors duration-150",
              active ? "text-accent" : "text-ink-muted group-hover:text-ink",
            )}
          >
            <UserCircle size={24} weight={active ? "fill" : "regular"} />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          "transition-colors duration-150",
          "whitespace-nowrap",
          active ? "text-accent" : "text-ink-muted group-hover:text-ink",
        )}
      >
        Profile
      </span>
    </Link>
  );
}
