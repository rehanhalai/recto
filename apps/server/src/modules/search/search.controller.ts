import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query("q") q: string,
    @Query("type") type?: "all" | "users" | "books" | "lists",
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ) {
    if (!type || type === "all") {
      return this.searchService.searchAll(q);
    }

    switch (type) {
      case "users":
        return this.searchService.searchUsers(q, page, limit);
      case "books":
        return this.searchService.searchBooks(q, page, limit);
      case "lists":
        return this.searchService.searchLists(q, page, limit);
      default:
        return this.searchService.searchAll(q);
    }
  }
}
