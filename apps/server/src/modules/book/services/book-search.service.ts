import { Injectable, NotFoundException } from "@nestjs/common";
import { GoogleBooksClient } from "../clients/google-books.client";
import { normalizeSearchResults } from "../utils/google-books.normalizer";
import { SearchResponse } from "../types/google-books.types";

@Injectable()
export class BookSearchService {
  constructor(private readonly googleBooksClient: GoogleBooksClient) {}

  async searchBooks(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResponse> {
    const startIndex = (page - 1) * limit;
    const requestWindow = Math.min(limit * 3, 40);

    try {
      const initialResponse = await this.googleBooksClient.search(
        query,
        requestWindow,
        startIndex,
      );

      let books = normalizeSearchResults(initialResponse);
      const sourceTotalItems = initialResponse.totalItems;

      if (books.length < limit && startIndex + requestWindow < sourceTotalItems) {
        try {
          const retryResponse = await this.googleBooksClient.search(
            query,
            requestWindow,
            startIndex + requestWindow,
          );
          const retryBooks = normalizeSearchResults(retryResponse);
          const deduped = new Map(
            [...books, ...retryBooks].map((book) => [book.sourceId, book]),
          );
          books = Array.from(deduped.values());
        } catch {
          // Retry failed, proceed with what we have
        }
      }

      const finalBooks = books.slice(0, limit);
      const hasMore = !!finalBooks.length && startIndex + requestWindow < sourceTotalItems;

      return {
        books: finalBooks,
        pagination: { currentPage: page, limit, hasMore },
      };
    } catch {
      // Google API failed (404 at high page, rate limit, etc.)
      return {
        books: [],
        pagination: { currentPage: page, limit, hasMore: false },
      };
    }
  }
}
