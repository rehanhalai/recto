import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from '../common';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req: any, @Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(req.user.sub, createPostDto);
    return {
      ...post,
      message: 'Post created successfully',
    };
  }

  @Get()
  async findAll() {
    const posts = await this.postsService.findAll();
    return {
      posts,
      message: 'Posts fetched successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOneById(id);
    return {
      ...post,
      message: 'Post fetched successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.postsService.remove(id, req.user.sub);
    return {
      message: 'Post removed successfully',
    };
  }
}
