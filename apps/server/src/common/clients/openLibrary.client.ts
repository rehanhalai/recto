import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError, AxiosRequestConfig } from 'axios';
import * as https from 'https';

// Centralized OpenLibrary API Client for NestJS
//
// Provides a unified interface for all OpenLibrary API interactions with:
// - Connection pooling for performance
// - Consistent error handling
// - Request timeout management
// - Proper User-Agent header

@Injectable()
export class OpenLibraryClient {
  private readonly BASE_URL = 'https://openlibrary.org';
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50, // Connection pool size
    maxFreeSockets: 10,
    timeout: 60000,
    keepAliveMsecs: 30000,
  });

  constructor(private readonly httpService: HttpService) {}

  private getRequestConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      baseURL: this.BASE_URL,
      httpsAgent: this.httpsAgent,
      headers: {
        'User-Agent': 'Recto/1.0 (contact@recto.app)',
        ...config?.headers,
      },
      ...config,
    };
  }

  // Fetches a work by its ID
  async getWork(workId: string): Promise<any> {
    try {
      const normalizedId = workId.startsWith('/works/')
        ? workId
        : `/works/${workId}`;

      const { data } = await firstValueFrom(
        this.httpService
          .get(`${normalizedId}.json`, this.getRequestConfig({ timeout: 3000 }))
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, 'Failed to fetch work');
            }),
          ),
      );

      // Handle OpenLibrary's specific redirect object format
      if (data?.type?.key === '/type/redirect' && data.location) {
        return this.getWork(data.location);
      }

      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, 'Failed to fetch work');
    }
  }

  // Searches for books by title
  async searchByTitle(
    title: string,
    page: number = 1,
    limit: number = 10,
    fields?: string,
  ): Promise<any> {
    try {
      const params: any = { title, page, limit };
      if (fields) params.fields = fields;

      const { data } = await firstValueFrom(
        this.httpService
          .get('/search.json', this.getRequestConfig({ params }))
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, 'Failed to search books by title');
            }),
          ),
      );

      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, 'Failed to search books by title');
    }
  }

  // Searches for books by author
  async searchByAuthor(
    author: string,
    page: number = 1,
    limit: number = 10,
    fields?: string,
  ): Promise<any> {
    try {
      const params: any = { author, page, limit };
      if (fields) params.fields = fields;

      const { data } = await firstValueFrom(
        this.httpService
          .get('/search.json', this.getRequestConfig({ params }))
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, 'Failed to search books by author');
            }),
          ),
      );

      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, 'Failed to search books by author');
    }
  }

  // Generic search with custom parameters
  async search(params: Record<string, any>): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get('/search.json', this.getRequestConfig({ params }))
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, 'Failed to search books');
            }),
          ),
      );

      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, 'Failed to search books');
    }
  }

  // Fetches an author by their ID
  async getAuthor(authorId: string): Promise<any> {
    try {
      const normalizedId = authorId.startsWith('/authors/')
        ? authorId
        : `/authors/${authorId}`;

      const { data } = await firstValueFrom(
        this.httpService
          .get(`${normalizedId}.json`, this.getRequestConfig())
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, 'Failed to fetch author');
            }),
          ),
      );

      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, 'Failed to fetch author');
    }
  }

  /**
   * Fetches an edition by its ID
   * @param editionId - The OpenLibrary edition ID
   * @returns The edition data from OpenLibrary
   */
  async getEdition(editionId: string): Promise<any> {
    try {
      const normalizedId = editionId.startsWith('/books/')
        ? editionId
        : `/books/${editionId}`;

      const { data } = await firstValueFrom(
        this.httpService
          .get(`${normalizedId}.json`, this.getRequestConfig())
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, 'Failed to fetch edition');
            }),
          ),
      );

      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, 'Failed to fetch edition');
    }
  }

  /**
   * Makes a custom GET request to OpenLibrary API
   * @param endpoint - The API endpoint (e.g., "/works/OL45804W.json")
   * @param config - Additional axios config
   * @returns The response data
   */
  async get(endpoint: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(endpoint, this.getRequestConfig(config)).pipe(
          catchError((error: AxiosError) => {
            throw this.handleError(error, `Failed to fetch ${endpoint}`);
          }),
        ),
      );
      return data;
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException ||
        error instanceof RequestTimeoutException
      ) {
        throw error;
      }
      this.handleError(error, `Failed to fetch ${endpoint}`);
    }
  }

  /**
   * Centralized error handling for OpenLibrary API calls
   */
  private handleError(error: any, defaultMessage: string): never {
    if (
      error instanceof InternalServerErrorException ||
      error instanceof NotFoundException ||
      error instanceof ServiceUnavailableException ||
      error instanceof RequestTimeoutException
    ) {
      throw error;
    }
    // Unknown error
    throw new InternalServerErrorException(defaultMessage);
  }
}

export const openLibraryClient = new OpenLibraryClient({} as any); // fallback instance, though normally injected

export default OpenLibraryClient;
