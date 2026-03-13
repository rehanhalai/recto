import { Inject, Injectable } from "@nestjs/common";
import { posts, users } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { DRIZZLE } from "db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";

@Injectable()
export class FeedService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async getNewestFeed(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await this.db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        bookId: posts.bookId,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          userName: users.userName,
          avatarImage: users.avatarImage,
        },
        commentCount: posts.commentsCount,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }

  // A basic trending logic, typically you would sort by votes/comments/views
  // For now, let's sort by comment counts (dummy implementation structure)
  async getTrendingFeed(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await this.db
      .select({
        id: posts.id,
        content: posts.content,
        image: posts.image,
        bookId: posts.bookId,
        createdAt: posts.createdAt,
        author: {
          id: users.id,
          userName: users.userName,
          avatarImage: users.avatarImage,
        },
        commentCount: posts.commentsCount,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.commentsCount), desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    return result;
  }
}
