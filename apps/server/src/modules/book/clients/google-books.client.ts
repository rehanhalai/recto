import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom, catchError } from "rxjs";
import { AxiosError, AxiosRequestConfig } from "axios";
import * as https from "https";
import {
  GoogleBooksSearchResponse,
  GoogleBooksVolume,
  isGoogleBooksSearchResponse,
  isGoogleBooksVolume,
} from "../types/google-books.types";

/**
 * Google Books API Client for NestJS
 *
 * Provides a unified interface for Google Books API interactions with:
 * - Connection pooling for performance
 * - Consistent error handling
 * - API key management from environment
 * - Proper User-Agent header
 *
 * Docs: https://developers.google.com/books/docs/v1/using
 */
@Injectable()
export class GoogleBooksClient {
  private readonly BASE_URL = "https://www.googleapis.com/books/v1";
  private readonly apiKey: string;
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000,
    keepAliveMsecs: 30000,
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>("GOOGLE_BOOKS_API_KEY") || "";
    if (!this.apiKey) {
      throw new Error(
        "GOOGLE_BOOKS_API_KEY is not configured in environment variables",
      );
    }
  }

  /**
   * Builds base request config with auth and default headers
   */
  private getRequestConfig(config?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      baseURL: this.BASE_URL,
      httpsAgent: this.httpsAgent,
      headers: {
        "User-Agent": "Recto/1.0 (recto.help@gmail.com)",
        ...config?.headers,
      },
      ...config,
    };
  }

  /**
   * Searches for books by title
   *
   * @param query - Search term (will be prefixed with intitle:)
   * @param maxResults - Number of results to return (default: 20, max: 40)
   * @returns Search response with books array and pagination info
   * @throws InternalServerErrorException if API call fails
   *
   * @example
   * const results = await client.search('Harry Potter', 10);
   */
  async search(
    query: string,
    maxResults: number = 20,
  ): Promise<GoogleBooksSearchResponse> {
    try {
      if (!query || query.trim().length === 0) {
        throw new BadRequestException("Search query cannot be empty");
      }

      // Constrain maxResults to Google's limits
      const constrainedMaxResults = Math.min(Math.max(maxResults, 1), 40);

      const params = {
        q: `intitle:${query}`,
        printType: "books",
        maxResults: constrainedMaxResults,
        key: this.apiKey,
      };

      const { data } = await firstValueFrom(
        this.httpService
          .get<GoogleBooksSearchResponse>(
            "/volumes",
            this.getRequestConfig({ params }),
          )
          .pipe(
            catchError((error: AxiosError) => {
              throw this.handleError(error, "Failed to search books");
            }),
          ),
      );

      // Validate response shape
      if (!isGoogleBooksSearchResponse(data)) {
        throw new InternalServerErrorException(
          "Invalid response from Google Books API",
        );
      }

      return data;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to search books: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Fetches a single volume by its ID
   *
   * @param volumeId - Google Books volume ID (e.g., "OL45804W")
   * @returns Volume details with metadata, ratings, images, etc.
   * @throws InternalServerErrorException if API call fails or volume not found
   *
   * @example
   * const volume = await client.getVolume('OL45804W');
   */
  async getVolume(volumeId: string): Promise<GoogleBooksVolume> {
    try {
      if (!volumeId || volumeId.trim().length === 0) {
        throw new BadRequestException("Volume ID cannot be empty");
      }

      const params = {
        key: this.apiKey,
      };

      const { data } = await firstValueFrom(
        this.httpService
          .get<GoogleBooksVolume>(
            `/volumes/${volumeId.trim()}`,
            this.getRequestConfig({ params, timeout: 5000 }),
          )
          .pipe(
            catchError((error: AxiosError) => {
              if (error.response?.status === 404) {
                throw new NotFoundException(`Volume not found: ${volumeId}`);
              }
              throw this.handleError(
                error,
                `Failed to fetch volume ${volumeId}`,
              );
            }),
          ),
      );

      // Validate response shape
      if (!isGoogleBooksVolume(data)) {
        throw new InternalServerErrorException(
          "Invalid volume response from Google Books API",
        );
      }

      return data;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch volume: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Centralized error handler for HTTP requests
   */
  private handleError(error: AxiosError, context: string): Error {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, any> | undefined;

    if (status === 400) {
      return new BadRequestException(
        `${context}: ${data?.error?.message || "Bad request"}`,
      );
    }

    if (status === 403) {
      return new InternalServerErrorException(
        `${context}: API key is invalid or quota exceeded`,
      );
    }

    if (status === 404) {
      return new NotFoundException(`${context}: Resource not found`);
    }

    if (status && status >= 500) {
      return new InternalServerErrorException(
        `${context}: Google Books API server error (${status})`,
      );
    }

    if (error.code === "ECONNABORTED") {
      return new InternalServerErrorException(`${context}: Request timeout`);
    }

    return new InternalServerErrorException(
      `${context}: ${error.message || "Unknown error"}`,
    );
  }
}
