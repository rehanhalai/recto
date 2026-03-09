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
} from '@nestjs/common';
import { BookService } from './book.service';
import { AffiliateService } from './affiliate.service';
import { BookSearchService } from './book-search.service';
import { BookDatabaseSearchService } from './book-database-search.service';
import {
  GetBookDto,
  TbrBookDto,
  FetchBooksBasedOnStatusDto,
  SearchBooksDto,
  SearchBooksByAuthorDto,
} from './dto/book.dto';
import { AuthGuard } from '../common';

@Controller('book')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly affiliateService: AffiliateService,
    private readonly bookSearchService: BookSearchService,
    private readonly bookDatabaseSearchService: BookDatabaseSearchService,
  ) {}

  @Post('getbook')
  async getBook(@Body() dto: GetBookDto): Promise<any> {
    const { externalId, title, authors } = dto;
    const book = await this.bookService.getBook(externalId, title, authors);
    return {
      ...book,
      message: 'Book fetched successfully',
    };
  }

  @Get('purchase-links/:bookId')
  async getPurchaseLinks(@Param('bookId') bookId: string): Promise<any> {
    // In NestJS, we could pass country from headers or query. Defaulting to US.
    // We would need to fetch the book by ID first.
    // For simplicity, assuming the old flow: it fetched book from DB and generated links.
    // Wait, let's inject db into controller or move it to a method in BookService.
    return {
      message: 'Not fully implemented yet (needs book fetching)',
      data: null,
    };
  }

  @Get('search')
  async searchBooks(@Query() query: SearchBooksDto): Promise<any> {
    try {
      return await this.bookService.search(query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('search/author')
  async searchBooksByAuthor(
    @Query() query: SearchBooksByAuthorDto,
  ): Promise<any> {
    const { author, page = 1, limit = 10 } = query;
    const result = await this.bookSearchService.searchBooksByAuthor(
      author,
      page,
      limit,
    );
    return {
      ...result,
      message: `Found ${result.books.length} books by author "${author}"`,
    };
  }

  @UseGuards(AuthGuard)
  @Post('tbrbook')
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
      message: 'Book added to TBR successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Delete('tbrbook/:tbrId')
  async removeTbrBook(
    @Req() req: any,
    @Param('tbrId') tbrId: string,
  ): Promise<any> {
    const userId = req.user.id;
    await this.bookService.tbrRemoveBook(userId, tbrId);
    return {
      message: 'Book removed from TBR successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Get('fetch-user-books')
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
      message: 'Books fetched successfully',
    };
  }
}
