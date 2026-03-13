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
    const initialResponse = await this.googleBooksClient.search(
      query,
      limit * 2,
    );
    let books = normalizeSearchResults(initialResponse);

    if (books.length < limit) {
      const retryResponse = await this.googleBooksClient.search(
        query,
        limit * 3,
      );
      books = normalizeSearchResults(retryResponse);
    }

    const finalBooks = books.slice(0, limit);

    if (finalBooks.length === 0) {
      throw new NotFoundException("No valid books found for the given query");
    }

    return {
      books: finalBooks,
      pagination: {
        currentPage: page,
        totalItems: books.length,
        limit,
      },
    };
  }
}
