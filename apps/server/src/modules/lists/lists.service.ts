import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../../db/db.module";
import * as schema from "../../../db/schema";
import { bookListItems, bookLists } from "../../../db/schema";
import { ilike, or } from "drizzle-orm";

@Injectable()
export class ListsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async getCommunityListsByBook(params: {
    bookId?: string;
    page: number;
    limit: number;
  }) {
    const page = Math.max(params.page, 1);
    const limit = Math.min(Math.max(params.limit, 1), 30);

    let listIds: string[] | undefined;

    if (params.bookId) {
      const rows = await this.db
        .select({ listId: bookListItems.listId })
        .from(bookListItems)
        .where(eq(bookListItems.bookId, params.bookId));

      listIds = [...new Set(rows.map((r) => r.listId))];

      if (listIds.length === 0) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            hasMore: false,
          },
        };
      }
    }

    const allPublicLists = await this.db.query.bookLists.findMany({
      where: listIds
        ? and(eq(bookLists.isPublic, true), inArray(bookLists.id, listIds))
        : eq(bookLists.isPublic, true),
      with: {
        user: {
          columns: {
            userName: true,
          },
        },
        items: {
          with: {
            book: {
              columns: {
                coverImage: true,
              },
            },
          },
          orderBy: (item, { desc }) => [desc(item.addedAt)],
        },
      },
      orderBy: (list, { desc }) => [desc(list.updatedAt)],
    });

    const start = (page - 1) * limit;
    const pageItems = allPublicLists.slice(start, start + limit);

    return {
      data: pageItems.map((list) => ({
        id: list.id,
        title: list.name,
        curator: {
          userName: list.user?.userName || "unknown",
        },
        bookCount: list.bookCount,
        covers: list.items
          .map((item) => item.book?.coverImage)
          .filter((cover): cover is string => Boolean(cover))
          .slice(0, 4),
      })),
      pagination: {
        page,
        limit,
        total: allPublicLists.length,
        hasMore: start + limit < allPublicLists.length,
      },
    };
  }

  async getUserLists(userId: string) {
    const lists = await this.db.query.bookLists.findMany({
      where: eq(bookLists.userId, userId),
      with: {
        items: {
          with: {
            book: {
              columns: {
                coverImage: true,
              },
            },
          },
          orderBy: (item, { desc }) => [desc(item.addedAt)],
          limit: 4,
        },
      },
      orderBy: (list, { desc }) => [desc(list.updatedAt)],
    });

    return lists.map((list) => ({
      id: list.id,
      name: list.name,
      description: list.description,
      is_public: list.isPublic,
      book_count: list.bookCount,
      covers: list.items
        .map((item) => item.book?.coverImage)
        .filter((cover): cover is string => Boolean(cover)),
    }));
  }

  async addBookToList(userId: string, listId: string, bookId: string) {
    if (!bookId) {
      throw new BadRequestException("book_id is required");
    }

    const list = await this.db.query.bookLists.findFirst({
      where: eq(bookLists.id, listId),
      columns: {
        id: true,
        userId: true,
      },
    });

    if (!list) {
      throw new NotFoundException("List not found");
    }

    if (list.userId !== userId) {
      throw new ForbiddenException("You cannot modify this list");
    }

    const existing = await this.db.query.bookListItems.findFirst({
      where: and(
        eq(bookListItems.listId, listId),
        eq(bookListItems.bookId, bookId),
      ),
      columns: { id: true },
    });

    if (!existing) {
      await this.db.insert(bookListItems).values({
        listId,
        bookId,
      });

      const counts = await this.db
        .select({ count: count() })
        .from(bookListItems)
        .where(eq(bookListItems.listId, listId));

      await this.db
        .update(bookLists)
        .set({
          bookCount: Number(counts[0]?.count || 0),
          updatedAt: new Date(),
        })
        .where(eq(bookLists.id, listId));
    }

    return {
      listId,
      bookId,
    };
  }

  async searchLists(query: string, page: number = 1, limit: number = 10) {
    const start = (page - 1) * limit;

    const results = await this.db.query.bookLists.findMany({
      where: and(
        eq(bookLists.isPublic, true),
        or(
          ilike(bookLists.name, `%${query}%`),
          ilike(bookLists.description, `%${query}%`),
        ),
      ),
      with: {
        user: {
          columns: {
            userName: true,
            avatarImage: true,
          },
        },
        items: {
          with: {
            book: {
              columns: {
                coverImage: true,
              },
            },
          },
          orderBy: (item, { desc }) => [desc(item.addedAt)],
          limit: 4,
        },
      },
      limit: limit + 1,
      offset: start,
      orderBy: (list, { desc }) => [desc(list.updatedAt)],
    });

    const hasMore = results.length > limit;
    const finalResults = hasMore ? results.slice(0, limit) : results;

    return {
      lists: finalResults.map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        is_public: list.isPublic,
        book_count: list.bookCount,
        user: {
          userName: list.user?.userName || "unknown",
          avatarImage: list.user?.avatarImage,
        },
        covers: list.items
          .map((item) => item.book?.coverImage)
          .filter((cover): cover is string => Boolean(cover)),
      })),
      pagination: {
        currentPage: page,
        limit,
        hasMore,
      },
    };
  }
}
