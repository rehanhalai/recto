import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { BookService } from "./services/book.service";
import {
  TbrBookDto,
  FetchBooksBasedOnStatusDto,
  SearchBooksDto,
} from "./dto/book.dto";
import { AuthGuard } from "../common";

@Controller("book")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get("book/:volumeId")
  async getBook(@Param("volumeId") volumeId: string): Promise<any> {
    const book = await this.bookService.getBook(volumeId);
    return {
      ...book,
      message: "Book fetched successfully",
    };
  }

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
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @Post("tbrbook")
  async tbrBook(@Req() req: any, @Body() dto: TbrBookDto): Promise<any> {
    const userId = req.user.id;
    const { bookId, status, startedAt, finishedAt } = dto;
    const addedBook = await this.bookService.tbrBook(
      userId,
      bookId,
      status,
      startedAt,
      finishedAt,
    );
    return {
      ...addedBook,
      message: "Book added to TBR successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Delete("tbrbook/:tbrId")
  async removeTbrBook(
    @Req() req: any,
    @Param("tbrId") tbrId: string,
  ): Promise<any> {
    const userId = req.user.id;
    await this.bookService.tbrRemoveBook(userId, tbrId);
    return {
      message: "Book removed from TBR successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Get("fetch-user-books")
  async fetchBooksBasedOnStatus(
    @Req() req: any,
    @Query() query: FetchBooksBasedOnStatusDto,
  ): Promise<any> {
    const userId = req.user.id;
    const userBooks = await this.bookService.fetchBooksBasedOnStatus(
      userId,
      query.status,
    );
    return {
      books: userBooks,
      message: "Books fetched successfully",
    };
  }
}
