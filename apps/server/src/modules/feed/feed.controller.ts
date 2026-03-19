import { Controller, Get, Query } from "@nestjs/common";
import { FeedService } from "./feed.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get("new")
  async getNewestFeed(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const posts = await this.feedService.getNewestFeed(pageNum, limitNum);
    return {
      posts,
      message: "Newest feed fetched successfully",
    };
  }

  @Get("trending")
  async getTrendingFeed(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const posts = await this.feedService.getTrendingFeed(pageNum, limitNum);
    return {
      posts,
      message: "Trending feed fetched successfully",
    };
  }
}
