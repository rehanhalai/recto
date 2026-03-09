import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { BookSearchService } from './book-search.service';
import { BookDatabaseSearchService } from './book-database-search.service';
import { OpenLibraryClient } from '../../common/clients/openLibrary.client';
import { AffiliateService } from './affiliate.service';
import { BookQueryService } from './book-query.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [BookController],
  providers: [
    BookQueryService,
    BookService,
    BookSearchService,
    BookDatabaseSearchService,
    OpenLibraryClient,
    AffiliateService,
  ],
})
export class BookModule {}
