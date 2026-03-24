import { Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { BookService } from "../book/services/book.service";
import { ListsService } from "../lists/lists.service";

@Injectable()
export class SearchService {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly listsService: ListsService,
  ) {}

  async searchAll(query: string) {
    const [usersResult, booksResult, listsResult] = await Promise.all([
      this.userService.searchUsers(query, 1, 5).catch(() => ({ users: [] })),
      this.bookService
        .search({ q: query, page: 1, limit: 6 })
        .catch(() => ({ books: [] })),
      this.listsService.searchLists(query, 1, 5).catch(() => ({ lists: [] })),
    ]);

    return {
      users: "users" in usersResult ? usersResult.users : [],
      books: "books" in booksResult ? booksResult.books : [],
      lists: "lists" in listsResult ? listsResult.lists : [],
    };
  }

  async searchUsers(query: string, page: number, limit: number) {
    return this.userService.searchUsers(query, page, limit);
  }

  async searchBooks(query: string, page: number, limit: number) {
    return this.bookService.search({ q: query, page, limit });
  }

  async searchLists(query: string, page: number, limit: number) {
    return this.listsService.searchLists(query, page, limit);
  }
}
