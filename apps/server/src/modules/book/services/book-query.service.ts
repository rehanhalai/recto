import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../../../db/db.module";
import * as schema from "../../../../db/schema";
import { bookAuthors, bookGenres, books } from "../../../../db/schema";
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
    let volume;

    try {
      volume = await this.googleBooksClient.getVolume(volumeId);
    } catch {
      const cachedBook = await this.findBySourceId(volumeId);

      if (cachedBook) {
        return this.mapToBookResponse(cachedBook);
      }

      throw new NotFoundException("Book not found");
    }

    const isbn13 = extractIsbn13(volume);

    if (isbn13) {
      const cachedByIsbn = await this.findByIsbn13(isbn13);

      if (cachedByIsbn) {
        return this.mapToBookResponse(cachedByIsbn);
      }
    }

    const cachedBySource = await this.findBySourceId(volumeId);

    if (cachedBySource) {
      return this.mapToBookResponse(cachedBySource);
    }

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
          googleRating: this.toNumericString(normalizedBook.googleRating),
          googleRatingsCount: normalizedBook.googleRatingsCount ?? 0,
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

    const allGenres = await this.db.query.genres.findMany({
      columns: {
        id: true,
        name: true,
      },
    });

    const genreLookup = new Map(
      allGenres.map((genre) => [genre.name.trim().toLowerCase(), genre.id]),
    );

    return [
      ...new Set(
        categories
          .map((category) => genreLookup.get(category.trim().toLowerCase()))
          .filter((genreId): genreId is string => Boolean(genreId)),
      ),
    ];
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
      googleRating: this.toNumber(dbBook.googleRating),
      googleRatingsCount: dbBook.googleRatingsCount ?? 0,
      authors: (dbBook.authors || []).map((author: any) => author.authorName),
      categories: genres,
      averageRating: this.toNumber(dbBook.averageRating),
      ratingsCount: dbBook.ratingsCount ?? 0,
      genres,
      createdAt: dbBook.createdAt,
      updatedAt: dbBook.updatedAt,
    };
  }

  private toNumericString(value: number | undefined): string | undefined {
    return typeof value === "number" ? value.toFixed(2) : undefined;
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
