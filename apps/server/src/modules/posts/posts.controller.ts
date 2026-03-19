import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { GetFeedDto } from "./dto/get-feed.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { AuthGuard, OptionalAuthGuard, CurrentUser } from "../common";
import type { AuthenticatedRequestUser } from "../common/guards/auth.guard";
import { FileValidatorPipe } from "../common/pipes/file-validator.pipeline";
import { UploadAssetType } from "../storage/enums/upload-asset-type.enum";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(new FileValidatorPipe(UploadAssetType.POST_IMAGE))
    file?: Express.Multer.File,
  ) {
    const post = await this.postsService.create(user.id, createPostDto, file);
    return {
      data: post,
      message: "Post created successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get("feed")
  async getFeed(
    @CurrentUser() user: AuthenticatedRequestUser | null,
    @Query() query: GetFeedDto,
  ) {
    const result = await this.postsService.getFeed(
      user?.id,
      query.cursor,
      query.limit ?? 10,
    );

    return {
      data: result,
      message: "Feed fetched successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Get("following")
  async getFollowingFeed(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: GetFeedDto,
  ) {
    const result = await this.postsService.getFollowingFeed(
      user.id,
      query.cursor,
      query.limit ?? 10,
    );

    return {
      data: result,
      message: "Following feed fetched successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async getMyPosts(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query() query: GetFeedDto,
  ) {
    const result = await this.postsService.getUserPosts(
      user.id,
      user.id,
      query.cursor,
      query.limit ?? 10,
    );

    return {
      data: result,
      message: "Your posts fetched successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get("user/:authorId")
  async getUserPosts(
    @CurrentUser() user: AuthenticatedRequestUser | null,
    @Param("authorId") authorId: string,
    @Query() query: GetFeedDto,
  ) {
    const result = await this.postsService.getUserPosts(
      authorId,
      user?.id,
      query.cursor,
      query.limit ?? 10,
    );

    return {
      data: result,
      message: "User's posts fetched successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get("trending")
  async getTrendingFeed(
    @CurrentUser() user: AuthenticatedRequestUser | null,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const result = await this.postsService.getTrendingFeed(
      user?.id,
      page,
      limit,
    );

    return {
      data: result,
      message: "Trending feed fetched successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedRequestUser | null) {
    const posts = await this.postsService.findAll(user?.id);
    return {
      data: posts,
      message: "Posts fetched successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get(":id")
  async findOne(
    @CurrentUser() user: AuthenticatedRequestUser | null,
    @Param("id") id: string,
  ) {
    const post = await this.postsService.findOneById(id, user?.id);
    return {
      data: post,
      message: "Post fetched successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile(new FileValidatorPipe(UploadAssetType.POST_IMAGE))
    file?: Express.Multer.File,
  ) {
    const post = await this.postsService.update(
      id,
      user.id,
      updatePostDto,
      file,
    );
    return {
      data: post,
      message: "Post updated successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Post(":id/like")
  async like(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
  ) {
    const result = await this.postsService.like(id, user.id);
    return {
      data: result,
      message: "Post liked successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Delete(":id/like")
  async unlike(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
  ) {
    const result = await this.postsService.unlike(id, user.id);
    return {
      data: result,
      message: "Post unliked successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  async remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param("id") id: string,
  ) {
    await this.postsService.remove(id, user.id);
    return {
      message: "Post removed successfully",
    };
  }

  @Get(":id/likes")
  async getPostLikes(
    @Param("id") id: string,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const result = await this.postsService.getPostLikes(id, page, limit);
    return {
      data: result,
      message: "Likes fetched successfully",
    };
  }

  @Get(":id/comments")
  async getPostComments(
    @Param("id") id: string,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    const result = await this.postsService.getPostComments(id, page, limit);
    return {
      data: result,
      message: "Comments fetched successfully",
    };
  }
}
