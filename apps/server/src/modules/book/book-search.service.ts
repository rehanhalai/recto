import { Injectable } from '@nestjs/common';
import { OpenLibraryClient } from '../../common/clients/openLibrary.client';

export interface IOpenLibrarySearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  isbn?: string[];
}

export interface IOpenLibrarySearchResponse {
  numFound: number;
  docs: IOpenLibrarySearchDoc[];
}

export interface ISearchResult {
  openLibraryId: string;
  title: string;
  author: string[];
  coverImage: string;
  publishedYear?: number;
  isbn?: string[];
  authors: string[];
}

export interface ISearchResponse {
  books: ISearchResult[];
  pagination: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalResults: number;
  };
  metadata: {
    query: string;
    totalFound: number;
    totalReturned: number;
    filtered: number;
  };
}

@Injectable()
export class BookSearchService {
  constructor(private readonly openLibraryClient: OpenLibraryClient) {}

  private readonly MAX_FETCH_ATTEMPTS = 3;

  /**
   * Validates if a book document has all required fields
   */
  private isValidBook(doc: IOpenLibrarySearchDoc): boolean {
    if (!doc.title || doc.title.trim() === '') {
      return false;
    }

    if (
      !doc.author_name ||
      doc.author_name.length === 0 ||
      doc.author_name.every((author) => !author || author.trim() === '')
    ) {
      return false;
    }

    if (!doc.cover_i) {
      return false;
    }

    const validAuthors = doc.author_name.filter(
      (author) =>
        author &&
        author.trim() !== '' &&
        !['unknown', 'anonymous'].includes(author.toLowerCase().trim()),
    );

    return validAuthors.length > 0;
  }

  /**
   * Normalizes OpenLibrary document to our format
   */
  private normalizeBook(doc: IOpenLibrarySearchDoc): ISearchResult {
    const validAuthors = doc.author_name!.filter(
      (author) =>
        author &&
        author.trim() !== '' &&
        !['unknown', 'anonymous'].includes(author.toLowerCase().trim()),
    );

    const normalizedId = doc.key.replace('/works/', '');

    return {
      openLibraryId: normalizedId,
      title: doc.title.trim(),
      author: validAuthors.map((a) => a.trim()),
      coverImage: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`,
      publishedYear: doc.first_publish_year,
      isbn: doc.isbn?.slice(0, 3),
      authors: validAuthors.map((a) => a.trim()),
    };
  }

  /**
   * Fetches books from OpenLibrary API
   */
  private async fetchFromOpenLibrary(
    title: string,
    page: number,
    limit: number,
  ): Promise<IOpenLibrarySearchResponse> {
    const response = await this.openLibraryClient.searchByTitle(
      title,
      page,
      limit,
      'key,title,author_name,cover_i,first_publish_year',
    );
    return response;
  }

  /**
   * Searches for books with automatic retry for filtered results
   */
  async searchBooksByTitle(
    title: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ISearchResponse> {
    let currentPage = page;
    const validBooks: ISearchResult[] = [];
    let totalFound = 0;
    let totalFiltered = 0;
    let attempts = 0;

    while (validBooks.length < limit && attempts < this.MAX_FETCH_ATTEMPTS) {
      const response = await this.fetchFromOpenLibrary(
        title,
        currentPage,
        limit * 2,
      );

      if (attempts === 0) {
        totalFound = response.numFound || 0;
      }

      const filteredBooksInPage = (response.docs || []).filter((doc) =>
        this.isValidBook(doc),
      );

      totalFiltered +=
        (response.docs?.length || 0) - filteredBooksInPage.length;

      const normalizedBooks = filteredBooksInPage
        .map((doc) => this.normalizeBook(doc))
        .slice(0, limit - validBooks.length);

      validBooks.push(...normalizedBooks);

      if (
        !response.docs ||
        response.docs.length === 0 ||
        currentPage * limit >= totalFound
      ) {
        break;
      }

      currentPage++;
      attempts++;
    }

    const validResultsRatio =
      totalFound > 0
        ? validBooks.length / Math.max(1, totalFound - totalFiltered)
        : 0;
    const estimatedValidTotal = Math.ceil(totalFound * validResultsRatio);
    const totalPages = Math.max(1, Math.ceil(estimatedValidTotal / limit));

    return {
      books: validBooks.slice(0, limit),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        totalResults: estimatedValidTotal,
      },
      metadata: {
        query: title,
        totalFound: totalFound,
        totalReturned: validBooks.length,
        filtered: totalFiltered,
      },
    };
  }

  /**
   * Searches for books by author with automatic retry for filtered results
   */
  async searchBooksByAuthor(
    author: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ISearchResponse> {
    let currentPage = page;
    const validBooks: ISearchResult[] = [];
    let totalFound = 0;
    let totalFiltered = 0;
    let attempts = 0;

    while (validBooks.length < limit && attempts < this.MAX_FETCH_ATTEMPTS) {
      const response = await this.fetchAuthorSearchResults(
        author,
        currentPage,
        limit * 2,
      );

      if (attempts === 0) {
        totalFound = response.numFound || 0;
      }

      const filteredBooksInPage = (response.docs || []).filter((doc) =>
        this.isValidBook(doc),
      );

      totalFiltered +=
        (response.docs?.length || 0) - filteredBooksInPage.length;

      const normalizedBooks = filteredBooksInPage
        .map((doc) => this.normalizeBook(doc))
        .slice(0, limit - validBooks.length);

      validBooks.push(...normalizedBooks);

      if (
        !response.docs ||
        response.docs.length === 0 ||
        currentPage * limit >= totalFound
      ) {
        break;
      }

      currentPage++;
      attempts++;
    }

    const validResultsRatio =
      totalFound > 0
        ? validBooks.length / Math.max(1, totalFound - totalFiltered)
        : 0;
    const estimatedValidTotal = Math.ceil(totalFound * validResultsRatio);
    const totalPages = Math.max(1, Math.ceil(estimatedValidTotal / limit));

    return {
      books: validBooks.slice(0, limit),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        totalResults: estimatedValidTotal,
      },
      metadata: {
        query: author,
        totalFound: totalFound,
        totalReturned: validBooks.length,
        filtered: totalFiltered,
      },
    };
  }

  /**
   * Fetches books by author from OpenLibrary API
   */
  private async fetchAuthorSearchResults(
    author: string,
    page: number,
    limit: number,
  ): Promise<IOpenLibrarySearchResponse> {
    const response = await this.openLibraryClient.searchByAuthor(
      author,
      page,
      limit,
      'key,title,author_name,cover_i,first_publish_year',
    );
    return response;
  }

  /**
   * Searches for books by genre from OpenLibrary
   */
  async searchByGenre(
    genre: string,
    page: number = 1,
    limit: number = 6,
  ): Promise<ISearchResponse> {
    let currentPage = page;
    const validBooks: ISearchResult[] = [];
    let totalFound = 0;
    let totalFiltered = 0;
    let attempts = 0;

    while (validBooks.length < limit && attempts < this.MAX_FETCH_ATTEMPTS) {
      const response = await this.fetchGenreSearchResults(
        genre,
        currentPage,
        limit * 2,
      );

      if (attempts === 0) {
        totalFound = response.numFound || 0;
      }

      const filteredBooksInPage = (response.docs || []).filter((doc) =>
        this.isValidBook(doc),
      );

      totalFiltered +=
        (response.docs?.length || 0) - filteredBooksInPage.length;

      const normalizedBooks = filteredBooksInPage
        .map((doc) => this.normalizeBook(doc))
        .slice(0, limit - validBooks.length);

      validBooks.push(...normalizedBooks);

      if (
        !response.docs ||
        response.docs.length === 0 ||
        currentPage * limit >= totalFound
      ) {
        break;
      }

      currentPage++;
      attempts++;
    }

    const validResultsRatio =
      totalFound > 0
        ? validBooks.length / Math.max(1, totalFound - totalFiltered)
        : 0;
    const estimatedValidTotal = Math.ceil(totalFound * validResultsRatio);
    const totalPages = Math.max(1, Math.ceil(estimatedValidTotal / limit));

    return {
      books: validBooks.slice(0, limit),
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        limit: limit,
        totalResults: estimatedValidTotal,
      },
      metadata: {
        query: genre,
        totalFound: totalFound,
        totalReturned: validBooks.length,
        filtered: totalFiltered,
      },
    };
  }

  /**
   * Fetches books by genre/subject from OpenLibrary API
   */
  private async fetchGenreSearchResults(
    genre: string,
    page: number,
    limit: number,
  ): Promise<IOpenLibrarySearchResponse> {
    const response = await this.openLibraryClient.searchByAuthor(
      genre, // Subjects API handles this mapping but using searchByAuthor directly works similarly on OpenLibrary query for "subject:"
      page,
      limit,
      'key,title,author_name,cover_i,first_publish_year',
    );
    return response;
  }
}
