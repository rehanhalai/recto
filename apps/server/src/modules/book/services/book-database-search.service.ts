import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from "@nestjs/common";
import { DRIZZLE } from "../../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../../db/schema";
import { books, bookGenres, genres } from "../../../../db/schema";
import { eq, ilike, inArray, count, desc, asc, sql } from "drizzle-orm";

interface SearchOptions {
  genre?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  skip?: number;
}

interface BookSearchResponse {
  results: any[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    page: number;
  };
}

@Injectable()
export class BookDatabaseSearchService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * Search books in the database with filtering and sorting
   */
  async searchBooks(options: SearchOptions): Promise<BookSearchResponse> {
    try {
      const { genre, sort, order = "desc", limit = 6, skip = 0 } = options;

      // Because genres are in a separate table, if genre is provided we need to find bookIds
      let bookIdsWithGenre: string[] | null = null;
      if (genre) {
        const matchedGenres = await this.db.query.genres.findMany({
          where: ilike(genres.name, `%${genre}%`),
          columns: { id: true },
        });
        const genreIds = matchedGenres.map((g) => g.id);
        const matchingGenres = genreIds.length
          ? await this.db.query.bookGenres.findMany({
              where: inArray(bookGenres.genreId, genreIds),
              columns: { bookId: true },
            })
          : [];
        bookIdsWithGenre = matchingGenres.map((g) => g.bookId);
        // If no books match the genre, return empty early
        if (bookIdsWithGenre.length === 0) {
          return {
            results: [],
            pagination: {
              total: 0,
              limit,
              skip,
              page: Math.floor(skip / limit) + 1,
            },
          };
        }
      }

      const whereCondition = bookIdsWithGenre
        ? inArray(books.id, bookIdsWithGenre)
        : undefined;

      // Build sort object
      let orderByCondition: any;
      if (sort === "averageRating") {
        orderByCondition =
          order === "asc"
            ? asc(books.averageRating)
            : desc(books.averageRating);
      } else if (sort === "releaseDate") {
        orderByCondition =
          order === "asc" ? asc(books.releaseDate) : desc(books.releaseDate);
      } else if (sort === "createdAt") {
        orderByCondition =
          order === "asc" ? asc(books.createdAt) : desc(books.createdAt);
      } else {
        orderByCondition = desc(books.createdAt);
      }

      // Get total count for pagination
      const totalResult = await this.db
        .select({ count: count() })
        .from(books)
        .where(whereCondition);
      const total = Number(totalResult[0]?.count || 0);

      // Fetch books with applied filters and sorting
      const dbBooks = await this.db.query.books.findMany({
        where: whereCondition,
        orderBy: orderByCondition,
        limit,
        offset: skip,
        columns: {
          id: true,
          title: true,
          coverImage: true,
          averageRating: true,
          description: true,
          releaseDate: true,
        },
        with: {
          authors: { columns: { authorName: true } },
          genres: { with: { genre: { columns: { name: true } } } },
        },
      });

      // Format response to match frontend expectations
      const results = dbBooks.map((book) => ({
        _id: book.id,
        title: book.title,
        authors: book.authors.map((a) => a.authorName),
        coverImage: book.coverImage,
        averageRating: book.averageRating ? parseFloat(book.averageRating) : 0,
        genres: book.genres.map((g) => g.genre?.name).filter(Boolean),
        description: book.description,
        releaseDate: book.releaseDate,
      }));

      return {
        results,
        pagination: {
          total,
          limit,
          skip,
          page: Math.floor(skip / limit) + 1,
        },
      };
    } catch (error) {
      console.error("Error searching books in database:", error);
      throw new InternalServerErrorException(
        "Failed to search books in database",
      );
    }
  }

  /**
   * Get books by genre
   */
  async getByGenre(genre: string, limit: number = 6): Promise<any[]> {
    try {
      const dbBooks = await this.searchBooks({ genre, limit, skip: 0 });
      return dbBooks.results;
    } catch (error) {
      console.error("Error fetching books by genre:", error);
      return [];
    }
  }

  /**
   * Get top-rated books
   */
  async getTopRated(limit: number = 6): Promise<any[]> {
    try {
      const dbBooks = await this.db.query.books.findMany({
        where: sql`${books.averageRating} > 0`,
        orderBy: desc(books.averageRating),
        limit,
        columns: {
          id: true,
          title: true,
          coverImage: true,
          averageRating: true,
          description: true,
        },
        with: {
          authors: { columns: { authorName: true } },
          genres: { with: { genre: { columns: { name: true } } } },
        },
      });

      return dbBooks.map((book) => ({
        _id: book.id,
        title: book.title,
        authors: book.authors.map((a) => a.authorName),
        coverImage: book.coverImage,
        averageRating: book.averageRating ? parseFloat(book.averageRating) : 0,
        genres: book.genres.map((g) => g.genre?.name).filter(Boolean),
        description: book.description,
      }));
    } catch (error) {
      console.error("Error fetching top-rated books:", error);
      return [];
    }
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit: number = 6): Promise<any[]> {
    try {
      const dbBooks = await this.db.query.books.findMany({
        where: sql`${books.releaseDate} IS NOT NULL`,
        orderBy: [desc(books.releaseDate), desc(books.createdAt)],
        limit,
        columns: {
          id: true,
          title: true,
          coverImage: true,
          averageRating: true,
          description: true,
          releaseDate: true,
        },
        with: {
          authors: { columns: { authorName: true } },
          genres: { with: { genre: { columns: { name: true } } } },
        },
      });

      return dbBooks.map((book) => ({
        _id: book.id,
        title: book.title,
        authors: book.authors.map((a) => a.authorName),
        coverImage: book.coverImage,
        averageRating: book.averageRating ? parseFloat(book.averageRating) : 0,
        genres: book.genres.map((g) => g.genre?.name).filter(Boolean),
        description: book.description,
        releaseDate: book.releaseDate,
      }));
    } catch (error) {
      console.error("Error fetching new releases:", error);
      return [];
    }
  }
}
