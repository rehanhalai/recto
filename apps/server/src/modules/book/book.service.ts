import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../../db/schema';
import { addedBooks } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { BookQueryService } from './book-query.service';
import { BookSearchService } from './book-search.service';
import { BookDatabaseSearchService } from './book-database-search.service';
import { TbrStatus } from './dto/book.dto';

@Injectable()
export class BookService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly bookQueryService: BookQueryService,
    private readonly bookSearchService: BookSearchService,
    private readonly bookDatabaseSearchService: BookDatabaseSearchService,
  ) {}

  /**
   * Get Book (OPTIMIZED - Primary Entry Point)
   */
  async getBook(externalId: string, title?: string, authors?: string[]) {
    // FAST PATH: Resolve book using optimized query service
    const book = await this.bookQueryService.resolveBook(
      externalId,
      title,
      authors,
    );
    return book;
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

  async search(query: any) {
    const { title, genre, sort, order, page = 1, limit = 10 } = query;

    if (genre && !sort) {
      const result = await this.bookSearchService.searchByGenre(
        genre,
        page,
        limit,
      );
      return {
        results: result.books,
        pagination: result.pagination,
        message: `Found ${result.books.length} books in genre "${genre}"`,
      };
    }

    if (sort) {
      const result = await this.bookDatabaseSearchService.searchBooks({
        genre,
        sort,
        order,
        limit,
        skip: (page - 1) * limit,
      });
      return {
        results: result.results,
        pagination: result.pagination,
        message: `Found ${result.results.length} books`,
      };
    }

    if (title) {
      const result = await this.bookSearchService.searchBooksByTitle(
        title,
        page,
        limit,
      );
      return {
        ...result,
        message: `Found ${result.books.length} books matching "${title}"`,
      };
    }

    throw new Error('Either title or genre parameter is required');
  }

  async fetchBooksBasedOnStatus(userId: string, status: string) {
    const userBooks = await this.db.query.addedBooks.findMany({
      where: and(eq(addedBooks.userId, userId), eq(addedBooks.status, status)),
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            coverImage: true,
            externalId: true,
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
            _id: ub.book.id,
            title: ub.book.title,
            authors: ub.book.authors.map((a) => a.authorName),
            coverImage: ub.book.coverImage,
            externalId: ub.book.externalId,
          }
        : ub.bookId,
      book: undefined, // remove nested relation
    }));
  }
}
