import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PostsService } from "./posts.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { GetFeedDto } from "./dto/get-feed.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { AuthGuard, OptionalAuthGuard } from "../common";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async create(
    @Req() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const post = await this.postsService.create(
      req.user.id,
      createPostDto,
      file,
    );
    return {
      data: post,
      message: "Post created successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Get("feed")
  async getFeed(@Req() req: any, @Query() query: GetFeedDto) {
    const result = await this.postsService.getFeed(
      req.user.id,
      query.cursor,
      query.limit ?? 10,
    );

    return {
      data: result,
      message: "Feed fetched successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    const posts = await this.postsService.findAll(req.user?.id);
    return {
      data: posts,
      message: "Posts fetched successfully",
    };
  }

  @UseGuards(OptionalAuthGuard)
  @Get(":id")
  async findOne(@Req() req: any, @Param("id") id: string) {
    const post = await this.postsService.findOneById(id, req.user?.id);
    return {
      data: post,
      message: "Post fetched successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  @UseInterceptors(FileInterceptor("image"))
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const post = await this.postsService.update(
      id,
      req.user.id,
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
  async like(@Req() req: any, @Param("id") id: string) {
    const result = await this.postsService.like(id, req.user.id);
    return {
      data: result,
      message: "Post liked successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Delete(":id/like")
  async unlike(@Req() req: any, @Param("id") id: string) {
    const result = await this.postsService.unlike(id, req.user.id);
    return {
      data: result,
      message: "Post unliked successfully",
    };
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    await this.postsService.remove(id, req.user.id);
    return {
      message: "Post removed successfully",
    };
  }
}
