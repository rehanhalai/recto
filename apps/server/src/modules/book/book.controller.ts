import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Headers,
} from "@nestjs/common";
import { BookService } from "./services/book.service";
import { SearchBooksDto } from "./dto/book.dto";
import { ConfigService } from "@nestjs/config";

@Controller("book")
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

  @Get("trending")
  async getTrending(@Query("limit") limit?: number): Promise<any> {
    const books = await this.bookService.getTrending(limit ?? 10);
    return {
      data: books,
      message: "Trending books fetched successfully",
    };
  }

  @Get("affiliate-links/:bookId")
  async getAffiliateLinks(
    @Param("bookId") bookId: string,
    @Query("country") countryQuery?: string,
    @Headers("cf-ipcountry") cfCountry?: string,
    @Headers("x-vercel-ip-country") vercelCountry?: string,
  ): Promise<any> {
    // Detect country: priority to manual query > cloudflare header > vercel header > env default
    const detectedCountry =
      countryQuery ||
      cfCountry ||
      vercelCountry ||
      this.configService.get("DEFAULT_COUNTRY") ||
      "US";

    const result = await this.bookService.getAffiliateLinks(
      bookId,
      detectedCountry,
    );

    return {
      data: {
        bookId,
        links: result.links,
      },
      message: result.message,
    };
  }

  @Get("stats/:bookId")
  async getStats(@Param("bookId") bookId: string): Promise<any> {
    const data = await this.bookService.getStats(bookId);
    return {
      ...data,
      message: "Book stats fetched successfully",
    };
  }

  @Get("search")
  async searchBooks(@Query() query: SearchBooksDto): Promise<any> {
    try {
      return await this.bookService.search(query);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Search failed",
      );
    }
  }

  @Get(":volumeId")
  async getBook(@Param("volumeId") volumeId: string): Promise<any> {
    const book = await this.bookService.getBook(volumeId);
    return {
      ...book,
      message: "Book fetched successfully",
    };
  }
}
