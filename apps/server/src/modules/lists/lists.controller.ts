import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  AuthGuard,
  CurrentUser,
  type AuthenticatedRequestUser,
} from "../common";
import { ListsService } from "./lists.service.js";

@Controller("lists")
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  async getCommunityLists(
    @Query("bookId") bookId?: string,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 12,
  ): Promise<any> {
    const data = await this.listsService.getCommunityListsByBook({
      bookId,
      page,
      limit,
    });

    return {
      ...data,
      message: "Lists fetched successfully",
    };
  }

  @Get("user/my-lists")
  @UseGuards(AuthGuard)
  async getMyLists(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<any> {
    const data = await this.listsService.getUserLists(user.id);
    return {
      data,
      message: "User lists fetched successfully",
    };
  }

  @Post(":listId/books")
  @UseGuards(AuthGuard)
  async addBookToList(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("listId") listId: string,
    @Body() body: { book_id: string },
  ): Promise<any> {
    const data = await this.listsService.addBookToList(
      user.id,
      listId,
      body.book_id,
    );

    return {
      data,
      message: "Book added to list successfully",
    };
  }
}
