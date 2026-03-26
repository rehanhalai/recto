"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpenText,
  MagnifyingGlass,
  Image as ImageIcon,
  X,
} from "@phosphor-icons/react";

import { apiInstance } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components/ui";
import { searchBooks } from "@/features/book/service/search-books";
import type { Book } from "@/features/book/types";

type BookSearchResult = {
  id?: string;
  sourceId: string;
  title: string;
  authors: string[];
  coverImage?: string;
};

type CreatePostDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function SidebarCreatePostDialog({
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [bookQuery, setBookQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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
    queryKey: ["sidebar", "create-post", "books", bookQuery],
    queryFn: async () => {
      const books = await searchBooks(bookQuery, 8, 1);
      return books.map(toBookSearchResult);
    },
    enabled: open && bookQuery.trim().length >= MIN_SEARCH_LENGTH,
    staleTime: 1000 * 60,
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("content", content.trim());

      if (selectedBook) {
        const resolvedBook = await apiInstance.get<{ id?: string; data?: { id?: string } }>(
          `/book/${encodeURIComponent(selectedBook.sourceId)}`,
        );

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
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] max-h-[90vh] overflow-y-auto rounded-2xl border border-border-subtle bg-paper p-0 sm:w-full sm:max-w-2xl">
        <DialogHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
          <DialogTitle className="text-xl text-ink">Create post</DialogTitle>
          <DialogDescription className="text-ink-muted">
            Mention a book, write your thoughts, and optionally add one image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
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
                onChange={(event) => setBookQuery(event.target.value)}
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
                            <BookOpenText size={14} className="text-ink-muted" />
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
                htmlFor="post-media-input"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-subtle bg-card-surface px-3 py-2 text-sm text-ink-muted transition hover:text-ink"
              >
                <ImageIcon size={16} />
                Add image
              </label>
              <input
                id="post-media-input"
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
                  sizes="(max-width: 640px) 95vw, 640px"
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
        </div>

        <DialogFooter className="border-t border-border-subtle px-5 py-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
