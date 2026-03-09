import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { DRIZZLE } from '../../../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../../db/schema';
import { books, bookAuthors, bookGenres } from '../../../db/schema';
import { eq, or, ilike, sql, inArray } from 'drizzle-orm';
import { OpenLibraryFactory } from '../../common/utils/openLibraryDataCleaner';
import { OpenLibraryClient } from '../../common/clients/openLibrary.client';
import { IBook } from './types/book.type';

@Injectable()
export class BookQueryService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly openLibraryClient: OpenLibraryClient,
  ) {}

  /**
   * PRIMARY METHOD: Fast Book Resolution with Smart Enrichment
   */
  async resolveBook(
    externalId: string,
    title?: string,
    authors?: string[],
  ): Promise<IBook> {
    const STALE_THRESHOLD = 7 * 24 * 60 * 60 * 1000;

    // STEP 1: Efficient ID Lookup
    let targetBookId: string | undefined;

    // First try by exact externalId
    let targetBook = await this.db.query.books.findFirst({
      where: eq(books.externalId, externalId),
      with: { authors: true, genres: true },
    });

    // If not found, try alternativeIds using sql
    if (!targetBook) {
      targetBook = await this.db.query.books.findFirst({
        where: sql`${externalId} = ANY(${books.alternativeIds})`,
        with: { authors: true, genres: true },
      });
    }

    const bookFoundByIdLookup = !!targetBook;

    // STEP 2: Fallback to Title+Authors matching
    if (!targetBook && title && authors && authors.length > 0) {
      targetBook = await this.findByTitleAndAuthors(title, authors);
    }

    // STEP 3: Staleness Check
    let shouldFetch = true;
    if (targetBook) {
      targetBookId = targetBook.id;
      const isAlternativeWorkId =
        bookFoundByIdLookup &&
        targetBook.externalId !== externalId &&
        !(targetBook.alternativeIds || []).includes(externalId);

      const isStale =
        targetBook.updatedAt &&
        targetBook.updatedAt.getTime() < Date.now() - STALE_THRESHOLD;

      if (!isStale && !isAlternativeWorkId) {
        return this.mapToIBook(targetBook);
      }
      shouldFetch = true;
    }

    // STEP 4: Fetch from API
    let apiData;
    let enrichmentNeeded = false;

    if (shouldFetch) {
      try {
        apiData = await this.openLibraryClient.getWork(externalId);
        enrichmentNeeded = true;
      } catch (error: any) {
        if (targetBook) {
          return this.mapToIBook(targetBook);
        }
        throw new InternalServerErrorException('Failed to fetch book from API');
      }
    }

    if (!apiData) {
      throw new InternalServerErrorException(
        'Failed to fetch book data from OpenLibrary',
      );
    }

    const newBook = OpenLibraryFactory.normalizeWorkData(apiData, {
      title,
      authors,
    });

    // STEP 5: Enrichment
    if (targetBook && targetBookId && enrichmentNeeded) {
      const updateData: any = { updatedAt: new Date() };
      let isUpdated = false;

      const newDesc = newBook.description || '';
      const currentDesc = targetBook.description || '';
      if (
        newDesc &&
        newDesc !== currentDesc &&
        newDesc.length > currentDesc.length
      ) {
        updateData.description = newDesc;
        isUpdated = true;
      }

      if (!targetBook.coverImage && newBook.coverImage) {
        updateData.coverImage = newBook.coverImage;
        updateData.coverI = newBook.coverI;
        isUpdated = true;
      }

      if (!targetBook.subtitle && newBook.subtitle) {
        updateData.subtitle = newBook.subtitle;
        isUpdated = true;
      }

      const isIdLinked =
        targetBook.externalId === externalId ||
        (targetBook.alternativeIds || []).includes(externalId);

      if (!isIdLinked) {
        updateData.alternativeIds = [
          ...(targetBook.alternativeIds || []),
          externalId,
        ];
        isUpdated = true;
      }

      // Update base book fields
      if (isUpdated) {
        await this.db
          .update(books)
          .set(updateData)
          .where(eq(books.id, targetBookId));
      } else {
        await this.db
          .update(books)
          .set({ updatedAt: new Date() })
          .where(eq(books.id, targetBookId));
      }

      // Merge Authors
      if (newBook.authors && newBook.authors.length > 0) {
        const currentAuthors = targetBook.authors.map((a) => a.authorName);
        const mergedAuthors = this.mergeLists(currentAuthors, newBook.authors);
        if (mergedAuthors.length > currentAuthors.length) {
          await this.db
            .delete(bookAuthors)
            .where(eq(bookAuthors.bookId, targetBookId));
          await this.db.insert(bookAuthors).values(
            mergedAuthors.map((author) => ({
              bookId: targetBookId,
              authorName: author,
            })),
          );
        }
      }

      // Merge Genres
      if (newBook.genres && newBook.genres.length > 0) {
        const currentGenres = targetBook.genres.map((g) => g.genreName);
        const mergedGenres = this.mergeLists(currentGenres, newBook.genres);
        if (mergedGenres.length > currentGenres.length) {
          await this.db
            .delete(bookGenres)
            .where(eq(bookGenres.bookId, targetBookId));
          await this.db.insert(bookGenres).values(
            mergedGenres.map((genre) => ({
              bookId: targetBookId,
              genreName: genre,
            })),
          );
        }
      }

      const updated = await this.db.query.books.findFirst({
        where: eq(books.id, targetBookId),
        with: { authors: true, genres: true },
      });
      return this.mapToIBook(updated!);
    }

    // STEP 6: Create New Document
    const alternativeIds =
      newBook.externalId !== externalId ? [externalId] : [];

    // Insert base book
    const [createdBook] = await this.db
      .insert(books)
      .values({
        externalId: newBook.externalId!,
        title: newBook.title!,
        subtitle: newBook.subtitle,
        releaseDate: newBook.releaseDate,
        description: newBook.description,
        coverImage: newBook.coverImage,
        coverI: newBook.coverI,
        alternativeIds,
      })
      .returning();

    // Insert authors
    if (newBook.authors && newBook.authors.length > 0) {
      await this.db.insert(bookAuthors).values(
        newBook.authors.map((author) => ({
          bookId: createdBook.id,
          authorName: author,
        })),
      );
    }

    // Insert genres
    if (newBook.genres && newBook.genres.length > 0) {
      await this.db.insert(bookGenres).values(
        newBook.genres.map((genre) => ({
          bookId: createdBook.id,
          genreName: genre,
        })),
      );
    }

    // Non-blocking backfill ISBN
    this.backfillIsbn13(createdBook.id, newBook.externalId || externalId);

    const fullCreated = await this.db.query.books.findFirst({
      where: eq(books.id, createdBook.id),
      with: { authors: true, genres: true },
    });

    return this.mapToIBook(fullCreated!);
  }

  private async findByTitleAndAuthors(title: string, authors: string[]) {
    if (!authors || authors.length === 0) return undefined;

    const exactRegexStr = `^${this.escapeRegex(title)}$`;

    // Find candidate books with exact title match
    const candidates = await this.db.query.books.findMany({
      where: sql`${books.title} ~* ${exactRegexStr}`,
      with: { authors: true, genres: true },
    });

    // Check if authors overlap
    for (const cand of candidates) {
      const candAuthors = cand.authors.map((a) => a.authorName);
      if (this.hasCommonItems(candAuthors, authors)) return cand;
    }

    // Fuzzy finding
    const normalizedTitle = this.normalizeTitle(title);

    // Find books that have ANY of the requested authors
    // We must join authors table
    const candWithAuthors = await this.db
      .selectDistinct({ bookId: bookAuthors.bookId })
      .from(bookAuthors)
      .where(
        sql`lower(${bookAuthors.authorName}) = ANY(array[${sql.join(
          authors.map((a) => sql`lower(${a})`),
          sql`, `,
        )}])`,
      );

    if (candWithAuthors.length > 0) {
      const candBookIds = candWithAuthors.map((c) => c.bookId);
      const fuzzyCandidates = await this.db.query.books.findMany({
        where: inArray(books.id, candBookIds),
        with: { authors: true, genres: true },
      });

      for (const cand of fuzzyCandidates) {
        const candNorm = this.normalizeTitle(cand.title);
        if (
          candNorm.includes(normalizedTitle) ||
          normalizedTitle.includes(candNorm)
        ) {
          return cand;
        }
      }
    }

    return undefined;
  }

  private async backfillIsbn13(bookId: string, workId: string) {
    if (!workId) return;

    try {
      const existing = await this.db.query.books.findFirst({
        where: eq(books.id, bookId),
        columns: { isbn13: true },
      });
      if (existing?.isbn13) return;

      const response = await this.openLibraryClient.get(
        `/works/${workId}/editions.json`,
        {
          params: { limit: 5 },
        },
      );

      const entries = (response.entries || response.editions || []) as any[];
      let isbn13: string | null = null;

      for (const edition of entries) {
        const candidate = Array.isArray(edition?.isbn_13)
          ? edition.isbn_13.find(
              (i: string) => typeof i === 'string' && i.trim().length > 0,
            )
          : null;
        if (candidate) {
          isbn13 = candidate.trim();
          break;
        }
      }

      if (isbn13) {
        await this.db.update(books).set({ isbn13 }).where(eq(books.id, bookId));
      }
    } catch (err) {
      // Non-blocking catch
    }
  }

  private hasCommonItems(list1: string[], list2: string[]): boolean {
    if (!list1 || !list2 || list1.length === 0 || list2.length === 0)
      return false;
    const norm1 = list1.map(this.normalizeString);
    const norm2 = list2.map(this.normalizeString);
    return norm1.some((a1) =>
      norm2.some((a2) => a1.includes(a2) || a2.includes(a1)),
    );
  }

  private mergeLists(existing: string[], newItems: string[]): string[] {
    const merged = [...existing];
    const normalizedExisting = existing.map(this.normalizeString);

    for (const item of newItems) {
      const norm = this.normalizeString(item);
      const isDupe = normalizedExisting.some(
        (e) => e === norm || e.includes(norm) || norm.includes(e),
      );
      if (!isDupe) {
        merged.push(item);
        normalizedExisting.push(norm);
      }
    }
    return merged;
  }

  private normalizeString = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+(jr\.?|sr\.?|ii|iii|iv)$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  private normalizeTitle = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/[:\-|–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  private escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  private mapToIBook(dbBook: any): IBook {
    return {
      id: dbBook.id,
      externalId: dbBook.externalId,
      title: dbBook.title,
      subtitle: dbBook.subtitle,
      releaseDate: dbBook.releaseDate,
      description: dbBook.description,
      averageRating: dbBook.averageRating,
      ratingsCount: dbBook.ratingsCount,
      coverImage: dbBook.coverImage,
      coverI: dbBook.coverI,
      isbn13: dbBook.isbn13,
      isStale: dbBook.isStale,
      createdAt: dbBook.createdAt,
      updatedAt: dbBook.updatedAt,
      authors: dbBook.authors?.map((a: any) => a.authorName) || [],
      genres: dbBook.genres?.map((g: any) => g.genreName) || [],
    };
  }
}
