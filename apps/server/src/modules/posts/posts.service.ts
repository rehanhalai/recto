import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { DRIZZLE } from "../../../db/db.module";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../../../db/schema";
import { books, postLikes, posts, users } from "../../../db/schema";
import { and, desc, eq, inArray, lt } from "drizzle-orm";
import { StorageService } from "../storage/storage.service";
import { UploadAssetType } from "../storage/enums/upload-asset-type.enum";

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly storageService: StorageService,
  ) {}

  private async getLikedPostIdSet(
    userId: string | undefined,
    postIds: string[],
  ): Promise<Set<string>> {
    if (!userId || postIds.length === 0) {
      return new Set();
    }

    const likedRows = await this.db
      .select({ postId: postLikes.postId })
      .from(postLikes)
      .where(
        and(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds)),
      );

    return new Set(likedRows.map((row) => row.postId));
  }

  private toPostWithRelations(
    row: {
      id: string;
      authorId: string;
      bookId: string | null;
      content: string;
      image: string | null;
      likesCount: number;
      commentsCount: number;
      createdAt: Date;
      updatedAt: Date;
      author: {
        id: string | null;
        userName: string | null;
        fullName: string | null;
        avatarImage: string | null;
      } | null;
      book: {
        id: string | null;
        title: string | null;
        coverImage: string | null;
      } | null;
    },
    isLikedByMe: boolean,
  ) {
    return {
      id: row.id,
      authorId: row.authorId,
      bookId: row.bookId,
      content: row.content,
      image: row.image,
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      likeCount: row.likesCount,
      commentCount: row.commentsCount,
      isLikedByMe,
      author: row.author?.id
        ? {
            id: row.author.id,
            userName: row.author.userName ?? "unknown",
            fullName: row.author.fullName,
            avatarImage: row.author.avatarImage,
          }
        : undefined,
      book: row.book?.id
        ? {
            id: row.book.id,
            title: row.book.title ?? "Untitled",
            coverImage: row.book.coverImage,
          }
        : null,
    };
  }

  async create(
    userId: string,
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
  ) {
    if (createPostDto.bookId) {
      const book = await this.db.query.books.findFirst({
        where: eq(books.id, createPostDto.bookId),
        columns: { id: true },
      });

      if (!book) {
        throw new NotFoundException("Book not found");
      }
    }

    const uploadResult = file
      ? await this.storageService.upload(
          file,
          UploadAssetType.POST_IMAGE,
          userId,
        )
      : null;

    const [newPost] = await this.db
      .insert(posts)
      .values({
        authorId: userId,
        content: createPostDto.content,
        bookId: createPostDto.bookId ?? null,
        image: uploadResult?.url ?? null,
      })
      .returning();

    return this.findOneById(newPost.id, userId);
  }

  async findAll(currentUserId?: string) {
    const rows = await this.db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        bookId: posts.bookId,
        content: posts.content,
        image: posts.image,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          userName: users.userName,
          fullName: users.fullName,
          avatarImage: users.avatarImage,
        },
        book: {
          id: books.id,
          title: books.title,
          coverImage: books.coverImage,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(books, eq(posts.bookId, books.id))
      .orderBy(desc(posts.createdAt));

    const likedSet = await this.getLikedPostIdSet(
      currentUserId,
      rows.map((row) => row.id),
    );

    return rows.map((row) =>
      this.toPostWithRelations(row, likedSet.has(row.id)),
    );
  }

  async findOneById(id: string, currentUserId?: string) {
    const [row] = await this.db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        bookId: posts.bookId,
        content: posts.content,
        image: posts.image,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          userName: users.userName,
          fullName: users.fullName,
          avatarImage: users.avatarImage,
        },
        book: {
          id: books.id,
          title: books.title,
          coverImage: books.coverImage,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(books, eq(posts.bookId, books.id))
      .where(eq(posts.id, id));

    if (!row) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    const likedSet = await this.getLikedPostIdSet(currentUserId, [row.id]);

    return this.toPostWithRelations(row, likedSet.has(row.id));
  }

  async getFeed(userId: string, cursor?: string, limit = 10) {
    const safeLimit = Math.min(Math.max(limit || 10, 1), 50);

    let cursorDate: Date | undefined;
    if (cursor) {
      const parsed = new Date(cursor);
      if (Number.isNaN(parsed.getTime())) {
        throw new BadRequestException("Invalid cursor value");
      }
      cursorDate = parsed;
    }

    const baseQuery = this.db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        bookId: posts.bookId,
        content: posts.content,
        image: posts.image,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          userName: users.userName,
          fullName: users.fullName,
          avatarImage: users.avatarImage,
        },
        book: {
          id: books.id,
          title: books.title,
          coverImage: books.coverImage,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(books, eq(posts.bookId, books.id));

    const rows = await (cursorDate
      ? baseQuery
          .where(lt(posts.createdAt, cursorDate))
          .orderBy(desc(posts.createdAt), desc(posts.id))
          .limit(safeLimit + 1)
      : baseQuery
          .orderBy(desc(posts.createdAt), desc(posts.id))
          .limit(safeLimit + 1));

    const hasMore = rows.length > safeLimit;
    const pageRows = hasMore ? rows.slice(0, safeLimit) : rows;

    const likedSet = await this.getLikedPostIdSet(
      userId,
      pageRows.map((row) => row.id),
    );

    const data = pageRows.map((row) =>
      this.toPostWithRelations(row, likedSet.has(row.id)),
    );

    const nextCursor = hasMore
      ? (pageRows[pageRows.length - 1]?.createdAt?.toISOString?.() ?? null)
      : null;

    return {
      data,
      nextCursor,
      hasMore,
    };
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePostDto,
    file?: Express.Multer.File,
  ) {
    const [existingPost] = await this.db
      .select({ id: posts.id, authorId: posts.authorId })
      .from(posts)
      .where(eq(posts.id, id));

    if (!existingPost) {
      throw new NotFoundException("Post not found");
    }

    if (existingPost.authorId !== userId) {
      throw new ForbiddenException("You are not allowed to edit this post");
    }

    if (dto.bookId) {
      const book = await this.db.query.books.findFirst({
        where: eq(books.id, dto.bookId),
        columns: { id: true },
      });

      if (!book) {
        throw new NotFoundException("Book not found");
      }
    }

    const updateData: Partial<typeof posts.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (file) {
      const uploadResult = await this.storageService.upload(
        file,
        UploadAssetType.POST_IMAGE,
        userId,
      );
      updateData.image = uploadResult.url;
    }

    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.bookId !== undefined) updateData.bookId = dto.bookId;

    if (Object.keys(updateData).length === 1) {
      throw new BadRequestException("No editable fields were provided");
    }

    await this.db.update(posts).set(updateData).where(eq(posts.id, id));

    return this.findOneById(id, userId);
  }

  async like(postId: string, userId: string) {
    const [existingPost] = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!existingPost) {
      throw new NotFoundException("Post not found");
    }

    const inserted = await this.db
      .insert(postLikes)
      .values({ postId, userId })
      .onConflictDoNothing()
      .returning({ id: postLikes.id });

    return {
      liked: inserted.length > 0,
    };
  }

  async unlike(postId: string, userId: string) {
    const [existingPost] = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, postId));

    if (!existingPost) {
      throw new NotFoundException("Post not found");
    }

    await this.db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    return { liked: false };
  }

  async remove(id: string, userId: string) {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id));

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException("You are not allowed to delete this post");
    }

    await this.db.delete(posts).where(eq(posts.id, id));
    return { success: true };
  }
}
