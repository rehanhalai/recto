import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../../db/schema";
import { addedBooks, books } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { BookQueryService } from "./book-query.service";
import { BookSearchService } from "./book-search.service";
import { BookDatabaseSearchService } from "./book-database-search.service";
import { SearchBooksDto, TbrStatus } from "../dto/book.dto";
import { AffiliateService } from "./affiliate.service";

@Injectable()
export class BookService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly bookQueryService: BookQueryService,
    private readonly bookSearchService: BookSearchService,
    private readonly bookDatabaseSearchService: BookDatabaseSearchService,
    private readonly affiliateService: AffiliateService,
  ) {}

  /**
   * Get Book (OPTIMIZED - Primary Entry Point)
   */
  async getBook(volumeId: string) {
    return this.bookQueryService.resolveBook(volumeId);
  }

  async tbrBook(
    userId: string,
    bookId: string,
    status: TbrStatus,
    startedAt?: string,
    finishedAt?: string,
  ) {
    const updates: any = { status, updatedAt: new Date() };

    if (status === TbrStatus.WISHLIST) {
      updates.startedAt = null;
      updates.finishedAt = null;
    } else if (status === TbrStatus.READING) {
      updates.startedAt = startedAt ? new Date(startedAt) : new Date();
      updates.finishedAt = null;
    } else if (status === TbrStatus.FINISHED) {
      if (startedAt) updates.startedAt = new Date(startedAt);
      updates.finishedAt = finishedAt ? new Date(finishedAt) : new Date();
    }

    const existingUserBook = await this.db.query.addedBooks.findFirst({
      where: and(eq(addedBooks.userId, userId), eq(addedBooks.bookId, bookId)),
    });

    if (existingUserBook) {
      const [updatedUserBook] = await this.db
        .update(addedBooks)
        .set(updates)
        .where(eq(addedBooks.id, existingUserBook.id))
        .returning();
      return updatedUserBook;
    } else {
      const [newUserBook] = await this.db
        .insert(addedBooks)
        .values({
          userId,
          bookId,
          ...updates,
        })
        .returning();
      return newUserBook;
    }
  }

  async tbrRemoveBook(userId: string, tbrId: string) {
    const [deletedData] = await this.db
      .delete(addedBooks)
      .where(and(eq(addedBooks.id, tbrId), eq(addedBooks.userId, userId)))
      .returning();

    return deletedData;
  }

  async search(query: SearchBooksDto) {
    const { q, page = 1, limit = 10 } = query;
    const result = await this.bookSearchService.searchBooks(q, page, limit);

    return {
      ...result,
      message: `Showing ${result.books.length} books for "${q}" on page ${page}`,
    };
  }

  async fetchBooksBasedOnStatus(userId: string, status: TbrStatus) {
    const userBooks = await this.db.query.addedBooks.findMany({
      where: and(eq(addedBooks.userId, userId), eq(addedBooks.status, status)),
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            coverImage: true,
            sourceId: true,
          },
          with: {
            authors: {
              columns: { authorName: true },
            },
          },
        },
      },
      orderBy: (addedBooks, { desc }) => [desc(addedBooks.updatedAt)],
    });

    // Formatting it nicely to emulate mongoose populate("bookId", "title authors coverImage externalId")
    return userBooks.map((ub) => ({
      ...ub,
      bookId: ub.book
        ? {
            id: ub.book.id,
            title: ub.book.title,
            authors: ub.book.authors.map((a) => a.authorName),
            coverImage: ub.book.coverImage,
            sourceId: ub.book.sourceId,
          }
        : ub.bookId,
      book: undefined, // remove nested relation
    }));
  }

  async getAffiliateLinks(bookId: string, userCountry?: string) {
    const book = await this.db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        isbn13: true,
      },
    });

    if (!book) {
      throw new NotFoundException("Book not found");
    }

    if (!book.isbn13) {
      return {
        links: {},
        message: "ISBN not found for this book",
      };
    }

    const countryCode = this.affiliateService.getCountryCode(userCountry);

    try {
      const links = this.affiliateService.generateAffiliateLinksFromIsbn13(
        book.isbn13,
        countryCode,
      );

      return {
        links,
        message: "Affiliate links fetched successfully",
      };
    } catch (error) {
      return {
        links: {},
        message:
          error instanceof Error ? error.message : "Failed to generate links",
      };
    }
  }
}
