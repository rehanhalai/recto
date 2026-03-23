import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq, inArray } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../../../db/db.module";
import * as schema from "../../../../db/schema";
import { bookAuthors, bookGenres, books, genres } from "../../../../db/schema";
import { GoogleBooksClient } from "../clients/google-books.client";
import {
  extractIsbn13,
  normalizeVolume,
} from "../utils/google-books.normalizer";
import { BookResponse } from "../types/google-books.types";

@Injectable()
export class BookQueryService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly googleBooksClient: GoogleBooksClient,
  ) {}

  async resolveBook(volumeId: string): Promise<BookResponse> {
    const cachedBySourceId = await this.findBySourceId(volumeId);

    if (cachedBySourceId) {
      return this.mapToBookResponse(cachedBySourceId);
    }

    // STEP 2: Fetch from Google Books API
    let volume;

    try {
      volume = await this.googleBooksClient.getVolume(volumeId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          "Book not found in Google Books and no cached version available",
        );
      }

      throw error;
    }

    // STEP 3: Try ISBN cache (secondary lookup for duplicate detection)
    const isbn13 = extractIsbn13(volume);

    if (isbn13) {
      const cachedByIsbn = await this.findByIsbn13(isbn13);

      if (cachedByIsbn) {
        return this.mapToBookResponse(cachedByIsbn);
      }
    }

    // STEP 4: No cache hit - create new book record
    const normalizedBook = normalizeVolume(volume);
    const matchedGenreIds = await this.findMatchingGenreIds(
      normalizedBook.categories,
    );

    const createdBookId = await this.db.transaction(async (tx) => {
      const [createdBook] = await tx
        .insert(books)
        .values({
          sourceId: normalizedBook.sourceId,
          source: normalizedBook.source,
          title: normalizedBook.title,
          subtitle: normalizedBook.subtitle,
          description: normalizedBook.description,
          releaseDate: normalizedBook.releaseDate,
          pageCount: normalizedBook.pageCount,
          language: normalizedBook.language,
          isbn13: normalizedBook.isbn13,
          coverImage: normalizedBook.coverImage,
        })
        .returning({ id: books.id });

      if (normalizedBook.authors.length > 0) {
        await tx.insert(bookAuthors).values(
          normalizedBook.authors.map((authorName) => ({
            bookId: createdBook.id,
            authorName,
          })),
        );
      }

      if (matchedGenreIds.length > 0) {
        await tx.insert(bookGenres).values(
          matchedGenreIds.map((genreId) => ({
            bookId: createdBook.id,
            genreId,
          })),
        );
      }

      return createdBook.id;
    });

    const createdBook = await this.findById(createdBookId);

    if (!createdBook) {
      throw new NotFoundException("Book not found after creation");
    }

    return this.mapToBookResponse(createdBook);
  }

  private async findByIsbn13(isbn13: string) {
    return this.db.query.books.findFirst({
      where: eq(books.isbn13, isbn13),
      with: {
        authors: {
          columns: { authorName: true },
        },
        genres: {
          with: {
            genre: {
              columns: { name: true },
            },
          },
        },
      },
    });
  }

  private async findBySourceId(volumeId: string) {
    return this.db.query.books.findFirst({
      where: and(
        eq(books.sourceId, volumeId),
        eq(books.source, "google_books"),
      ),
      with: {
        authors: {
          columns: { authorName: true },
        },
        genres: {
          with: {
            genre: {
              columns: { name: true },
            },
          },
        },
      },
    });
  }

  private async findById(bookId: string) {
    return this.db.query.books.findFirst({
      where: eq(books.id, bookId),
      with: {
        authors: {
          columns: { authorName: true },
        },
        genres: {
          with: {
            genre: {
              columns: { name: true },
            },
          },
        },
      },
    });
  }

  private async findMatchingGenreIds(categories: string[]): Promise<string[]> {
    if (categories.length === 0) {
      return [];
    }

    const normalized = this.normalizeCategories(categories);
    if (normalized.length === 0) {
      return [];
    }

    const slugs = normalized.map((item) => item.slug);
    const existing = await this.db.query.genres.findMany({
      where: inArray(genres.slug, slugs),
      columns: {
        id: true,
        slug: true,
      },
    });

    const slugToId = new Map(existing.map((genre) => [genre.slug, genre.id]));

    for (const item of normalized) {
      if (slugToId.has(item.slug)) {
        continue;
      }

      const inserted = await this.db
        .insert(genres)
        .values({
          name: item.name,
          slug: item.slug,
        })
        .onConflictDoNothing({ target: genres.slug })
        .returning({
          id: genres.id,
          slug: genres.slug,
        });

      if (inserted[0]) {
        slugToId.set(inserted[0].slug, inserted[0].id);
        continue;
      }

      const conflicted = await this.db.query.genres.findFirst({
        where: eq(genres.slug, item.slug),
        columns: {
          id: true,
          slug: true,
        },
      });

      if (conflicted) {
        slugToId.set(conflicted.slug, conflicted.id);
      }
    }

    return [
      ...new Set(
        normalized
          .map((item) => slugToId.get(item.slug))
          .filter((genreId): genreId is string => Boolean(genreId)),
      ),
    ];
  }

  private normalizeCategories(categories: string[]) {
    const bySlug = new Map<string, { name: string; slug: string }>();

    for (const rawCategory of categories) {
      const parts = rawCategory
        .split(/[>/|]+/)
        .map((part) => this.normalizeCategoryText(part))
        .filter((part) => part.length > 0);

      for (const part of parts) {
        const slug = part.replace(/\s+/g, "-");
        if (!slug || bySlug.has(slug)) {
          continue;
        }

        bySlug.set(slug, {
          name: this.toTitleCase(part),
          slug,
        });
      }
    }

    return Array.from(bySlug.values());
  }

  private normalizeCategoryText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private toTitleCase(value: string): string {
    return value
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  private mapToBookResponse(dbBook: any): BookResponse {
    const genres = (dbBook.genres || [])
      .map((entry: any) => entry.genre?.name)
      .filter((name: string | undefined): name is string => Boolean(name));

    return {
      id: dbBook.id,
      sourceId: dbBook.sourceId,
      source: dbBook.source,
      title: dbBook.title,
      subtitle: dbBook.subtitle ?? undefined,
      description: dbBook.description ?? undefined,
      releaseDate: dbBook.releaseDate ?? undefined,
      pageCount: dbBook.pageCount ?? undefined,
      language: dbBook.language ?? undefined,
      isbn13: dbBook.isbn13 ?? undefined,
      coverImage: dbBook.coverImage ?? undefined,
      authors: (dbBook.authors || []).map((author: any) => author.authorName),
      categories: genres,
      averageRating: this.toNumber(dbBook.averageRating),
      ratingsCount: dbBook.ratingsCount ?? 0,
      genres,
      createdAt: dbBook.createdAt,
      updatedAt: dbBook.updatedAt,
    };
  }

  private toNumber(
    value: string | number | null | undefined,
  ): number | undefined {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.length > 0) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }

    return undefined;
  }
}
