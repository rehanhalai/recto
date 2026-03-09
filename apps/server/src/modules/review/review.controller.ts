import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  AddReviewDto,
  UpdateReviewDto,
  GetAllReviewsForBookDto,
} from './dto/review.dto';
import { AuthGuard, OptionalAuthGuard } from '../common';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(OptionalAuthGuard)
  @Get(':bookId')
  async getAllReviewsForBook(
    @Param('bookId') bookId: string,
    @Query() query: GetAllReviewsForBookDto,
    @Req() req: any,
  ): Promise<any> {
    const userId = req.user?.id || null;
    const { page = 1, limit = 10 } = query;

    const result = await this.reviewService.getAllReviewsForBook(
      bookId,
      userId,
      page,
      limit,
    );

    return {
      ...result,
      message: 'Reviews fetched successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Post('add')
  async addReview(@Body() dto: AddReviewDto, @Req() req: any): Promise<any> {
    const userId = req.user.id;
    const { bookId, content, rating } = dto;

    const review = await this.reviewService.createReview(
      userId,
      bookId,
      content,
      rating,
    );

    return {
      ...review,
      message: 'Review added successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Patch(':reviewId')
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: any,
  ): Promise<any> {
    const userId = req.user.id;
    const { content, rating } = dto;

    const review = await this.reviewService.updateReview(
      userId,
      reviewId,
      content,
      rating,
    );

    return {
      ...review,
      message: 'Review updated successfully',
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':reviewId')
  async removeReview(
    @Param('reviewId') reviewId: string,
    @Req() req: any,
  ): Promise<any> {
    const userId = req.user.id;
    const userRole = req.user.role || 'user';

    await this.reviewService.removeReview(userId, reviewId, userRole);

    return {
      message: 'Review removed successfully',
    };
  }
}
