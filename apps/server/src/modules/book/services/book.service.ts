import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { DRIZZLE } from "../../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../../db/schema";
import { books } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { BookQueryService } from "./book-query.service";
import { BookSearchService } from "./book-search.service";
import { SearchBooksDto } from "../dto/book.dto";
import { AffiliateService } from "./affiliate.service";

@Injectable()
export class BookService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly bookQueryService: BookQueryService,
    private readonly bookSearchService: BookSearchService,
    private readonly affiliateService: AffiliateService,
  ) {}

  /**
   * Get Book (OPTIMIZED - Primary Entry Point)
   */
  async getBook(volumeId: string) {
    return this.bookQueryService.resolveBook(volumeId);
  }

  async search(query: SearchBooksDto) {
    const { q, page = 1, limit = 10 } = query;
    const result = await this.bookSearchService.searchBooks(q, page, limit);

    return {
      ...result,
      message: `Showing ${result.books.length} books for "${q}" on page ${page}`,
    };
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
