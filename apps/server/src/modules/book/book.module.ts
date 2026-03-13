import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { BookController } from "./book.controller";
import { BookService } from "./services/book.service";
import { BookSearchService } from "./services/book-search.service";
import { BookDatabaseSearchService } from "./services/book-database-search.service";
import { AffiliateService } from "./services/affiliate.service";
import { BookQueryService } from "./services/book-query.service";
import { GoogleBooksClient } from "./clients/google-books.client";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BookController],
  providers: [
    GoogleBooksClient,
    BookQueryService,
    BookService,
    BookSearchService,
    BookDatabaseSearchService,
    AffiliateService,
  ],
})
export class BookModule {}
