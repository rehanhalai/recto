import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { UserModule } from "../user/user.module";
import { BookModule } from "../book/book.module";
import { ListsModule } from "../lists/lists.module";

@Module({
  imports: [UserModule, BookModule, ListsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
