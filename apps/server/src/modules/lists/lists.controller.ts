import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  AuthGuard,
  OptionalAuthGuard,
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

  @Get(":listId")
  async getListById(
    @Param("listId") listId: string,
  ): Promise<any> {
    const data = await this.listsService.getListById(listId);
    return {
      data,
      message: "List details fetched successfully",
    };
  }

  @Get("user/my-lists")
  @UseGuards(AuthGuard)
  async getMyLists(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query("bookId") bookId?: string,
  ): Promise<any> {
    const data = await this.listsService.getUserLists(user.id, bookId);
    return {
      data,
      message: "User lists fetched successfully",
    };
  }

  @Get("user/:userId")
  @UseGuards(OptionalAuthGuard)
  async getUserPublicLists(
    @CurrentUser() user: AuthenticatedRequestUser | null,
    @Param("userId") userId: string,
  ): Promise<any> {
    const isOwner = Boolean(user?.id && user.id === userId);
    const data = isOwner
      ? await this.listsService.getUserLists(userId)
      : await this.listsService.getPublicUserLists(userId);
    return {
      data,
      message: "User public lists fetched successfully",
    };
  }

  @Delete(":listId/books/:bookId")
  @UseGuards(AuthGuard)
  async removeBookFromList(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("listId") listId: string,
    @Param("bookId") bookId: string,
  ): Promise<any> {
    const data = await this.listsService.removeBookFromList(
      user.id,
      listId,
      bookId,
    );

    return {
      data,
      message: "Book removed from list successfully",
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

  @Post()
  @UseGuards(AuthGuard)
  async createList(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() body: { name: string; description?: string; is_public?: boolean },
  ): Promise<any> {
    if (!body.name?.trim()) {
      throw new BadRequestException("List name is required");
    }

    const data = await this.listsService.createList(
      user.id,
      body.name.trim(),
      body.description,
      body.is_public,
    );

    return {
      data,
      message: "List created successfully",
    };
  }
}
