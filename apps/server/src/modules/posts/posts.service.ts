import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { DRIZZLE } from "../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";
import { posts, users } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const [newPost] = await this.db
      .insert(posts)
      .values({
        authorId: userId,
        content: createPostDto.content,
        bookId: createPostDto.bookId,
      })
      .returning();

    return newPost;
  }

  async findAll() {
    return await this.db
      .select({
        post: posts,
        author: {
          id: users.id,
          userName: users.userName,
          avatarImage: users.avatarImage,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt));
  }

  async findOneById(id: string) {
    const [result] = await this.db
      .select({
        post: posts,
        author: {
          id: users.id,
          userName: users.userName,
          avatarImage: users.avatarImage,
          bio: users.bio,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id));

    if (!result) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    return result;
  }

  async remove(id: string, userId: string) {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id));

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    if (post.authorId !== userId) {
      throw new NotFoundException(`Post not found`); // Don't leak exists status
    }

    await this.db.delete(posts).where(eq(posts.id, id));
    return { success: true };
  }
}
