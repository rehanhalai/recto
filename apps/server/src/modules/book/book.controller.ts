import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { BookService } from "./services/book.service";
import { SearchBooksDto } from "./dto/book.dto";

@Controller("book")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get("affiliate-links/:bookId")
  async getAffiliateLinks(
    @Param("bookId") bookId: string,
    @Query("country") country?: string,
  ): Promise<any> {
    const result = await this.bookService.getAffiliateLinks(bookId, country);
    return {
      bookId,
      links: result.links,
      message: result.message,
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
