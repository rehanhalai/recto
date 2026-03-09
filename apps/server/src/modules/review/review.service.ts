import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DRIZZLE } from '../../../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../../db/schema';
import { bookReviews, books } from '../../../db/schema';
import { eq, and, ne, count, sql } from 'drizzle-orm';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async createReview(
    userId: string,
    bookId: string,
    content: string | undefined,
    rating: number,
  ) {
    return await this.db.transaction(async (tx) => {
      // Check if review already exists
      const existingReview = await tx.query.bookReviews.findFirst({
        where: and(
          eq(bookReviews.userId, userId),
          eq(bookReviews.bookId, bookId),
        ),
      });

      if (existingReview) {
        throw new ConflictException('You have already reviewed this book');
      }

      // Check book exists
      const book = await tx.query.books.findFirst({
        where: eq(books.id, bookId),
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      // Create new review
      const [newReview] = await tx
        .insert(bookReviews)
        .values({
          userId,
          bookId,
          content,
          rating,
        })
        .returning();

      // Update book stats
      const totalRating = (book.averageRating || 0) * (book.ratingsCount || 0);
      const newCount = (book.ratingsCount || 0) + 1;
      const newAverage = (totalRating + rating) / newCount;

      await tx
        .update(books)
        .set({
          averageRating: Math.round(newAverage), // DB average_rating is integer in schema! Wait, schema says integer for average_rating. We need to store integers or change schema. We'll round it.
          ratingsCount: newCount,
        })
        .where(eq(books.id, bookId));

      return newReview;
    });
  }

  async removeReview(userId: string, reviewId: string, userRole: string) {
    return await this.db.transaction(async (tx) => {
      const review = await tx.query.bookReviews.findFirst({
        where: eq(bookReviews.id, reviewId),
      });

      if (!review) throw new NotFoundException('Review not found');

      const isOwner = review.userId === userId;
      const isAdmin = userRole === 'admin' || userRole === 'librarian';

      if (!isOwner && !isAdmin) {
        throw new ForbiddenException(
          'You are not authorized to delete this review',
        );
      }

      await tx.delete(bookReviews).where(eq(bookReviews.id, reviewId));

      const book = await tx.query.books.findFirst({
        where: eq(books.id, review.bookId),
      });

      if (book) {
        const totalRating =
          (book.averageRating || 0) * (book.ratingsCount || 0);
        const newCount = Math.max((book.ratingsCount || 1) - 1, 0);

        let newAverage = 0;
        if (newCount > 0) {
          newAverage = (totalRating - review.rating) / newCount;
        }

        await tx
          .update(books)
          .set({
            averageRating: Math.round(newAverage),
            ratingsCount: newCount,
          })
          .where(eq(books.id, book.id));
      }

      return null;
    });
  }

  async updateReview(
    userId: string,
    reviewId: string,
    content?: string,
    rating?: number,
  ) {
    return await this.db.transaction(async (tx) => {
      const review = await tx.query.bookReviews.findFirst({
        where: and(
          eq(bookReviews.id, reviewId),
          eq(bookReviews.userId, userId),
        ),
      });

      if (!review) {
        throw new NotFoundException(
          'Review not found or you are not the owner',
        );
      }

      const oldRating = review.rating;
      const isRatingChanged = rating !== undefined && rating !== oldRating;

      const updateData: any = { updatedAt: new Date() };
      if (content !== undefined) updateData.content = content;
      if (rating !== undefined) updateData.rating = rating;

      const [updatedReview] = await tx
        .update(bookReviews)
        .set(updateData)
        .where(eq(bookReviews.id, reviewId))
        .returning();

      if (isRatingChanged) {
        const book = await tx.query.books.findFirst({
          where: eq(books.id, review.bookId),
        });

        if (book) {
          const currentTotal =
            (book.averageRating || 0) * (book.ratingsCount || 0);
          const adjustedTotal = currentTotal - oldRating + rating;
          const count = book.ratingsCount || 1;
          const newAverage = adjustedTotal / count;

          await tx
            .update(books)
            .set({ averageRating: Math.round(newAverage) })
            .where(eq(books.id, book.id));
        }
      }

      return updatedReview;
    });
  }

  async getAllReviewsForBook(
    bookId: string,
    userId: string | null,
    page: number = 1,
    limit: number = 10,
  ) {
    let myReview: any = null;
    let reviewsList: any[] = [];

    const skip = (page - 1) * limit;

    if (page === 1 && userId) {
      myReview = await this.db.query.bookReviews.findFirst({
        where: and(
          eq(bookReviews.bookId, bookId),
          eq(bookReviews.userId, userId),
        ),
        with: {
          user: { columns: { userName: true, avatarImage: true } },
        },
      });
    }

    const filters = userId
      ? and(eq(bookReviews.bookId, bookId), ne(bookReviews.userId, userId))
      : eq(bookReviews.bookId, bookId);

    const otherReviews = await this.db.query.bookReviews.findMany({
      where: filters,
      orderBy: (bookReviews, { desc }) => [desc(bookReviews.createdAt)],
      limit,
      offset: skip,
      with: {
        user: { columns: { userName: true, avatarImage: true } },
      },
    });

    if (page === 1 && myReview) {
      reviewsList = [myReview, ...otherReviews];
    } else {
      reviewsList = otherReviews;
    }

    const totalReviewsQuery = await this.db
      .select({ count: count() })
      .from(bookReviews)
      .where(eq(bookReviews.bookId, bookId));

    const totalReviews = Number(totalReviewsQuery[0]?.count || 0);
    const totalPages = Math.ceil(totalReviews / limit);

    return {
      reviews: reviewsList,
      userHasReviewed: !!myReview,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasMore: page < totalPages,
      },
    };
  }
}
