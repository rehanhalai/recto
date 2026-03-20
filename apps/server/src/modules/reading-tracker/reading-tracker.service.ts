import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { DRIZZLE } from "../../../db/db.module";
import * as schema from "../../../db/schema";
import { addedBooks, books } from "../../../db/schema";
import {
  GetReadingTrackerEntriesDto,
  ReadingTrackerStatus,
  SaveReadingTrackerEntryDto,
} from "./dto/reading-tracker.dto";

type AddedBookRecord = typeof addedBooks.$inferSelect;

@Injectable()
export class ReadingTrackerService {
  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async saveEntry(userId: string, dto: SaveReadingTrackerEntryDto) {
    await this.ensureBookExists(dto.bookId);

    const existingEntry = await this.findEntryByBook(userId, dto.bookId);
    const timeline = this.buildTimeline(
      dto.status,
      existingEntry,
      dto.startedAt,
      dto.finishedAt,
    );

    if (existingEntry) {
      const [updatedEntry] = await this.db
        .update(addedBooks)
        .set(timeline)
        .where(eq(addedBooks.id, existingEntry.id))
        .returning();

      return updatedEntry;
    }

    const [createdEntry] = await this.db
      .insert(addedBooks)
      .values({
        userId,
        bookId: dto.bookId,
        ...timeline,
      })
      .returning();

    return createdEntry;
  }

  async removeEntry(userId: string, entryId: string) {
    const [deletedEntry] = await this.db
      .delete(addedBooks)
      .where(and(eq(addedBooks.id, entryId), eq(addedBooks.userId, userId)))
      .returning();

    if (!deletedEntry) {
      throw new NotFoundException("Reading tracker entry not found");
    }

    return deletedEntry;
  }

  async listEntries(userId: string, query: GetReadingTrackerEntriesDto) {
    const entries = await this.db.query.addedBooks.findMany({
      where: and(
        eq(addedBooks.userId, userId),
        eq(addedBooks.status, query.status),
      ),
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            coverImage: true,
            sourceId: true,
          },
          with: {
            authors: {
              columns: { authorName: true },
            },
          },
        },
      },
      orderBy: (entry, { desc }) => [desc(entry.updatedAt)],
    });

    return entries.map((entry) => ({
      ...entry,
      book: entry.book
        ? {
            title: entry.book.title,
            authors: entry.book.authors.map((author) => author.authorName),
            coverImage: entry.book.coverImage,
            sourceId: entry.book.sourceId,
          }
        : entry.bookId,
    }));
  }

  private async ensureBookExists(bookId: string) {
    const book = await this.db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: { id: true },
    });

    if (!book) {
      throw new NotFoundException("Book not found");
    }
  }

  private async findEntryByBook(userId: string, bookId: string) {
    return this.db.query.addedBooks.findFirst({
      where: and(eq(addedBooks.userId, userId), eq(addedBooks.bookId, bookId)),
    });
  }

  private buildTimeline(
    status: ReadingTrackerStatus,
    existingEntry: AddedBookRecord | undefined,
    startedAtInput?: string,
    finishedAtInput?: string,
  ) {
    const parsedStartedAt = startedAtInput
      ? this.parseDate(startedAtInput, "startedAt")
      : undefined;
    const parsedFinishedAt = finishedAtInput
      ? this.parseDate(finishedAtInput, "finishedAt")
      : undefined;

    if (status === ReadingTrackerStatus.WISHLIST) {
      return {
        status,
        startedAt: null,
        finishedAt: null,
        updatedAt: new Date(),
      };
    }

    if (status === ReadingTrackerStatus.READING) {
      return {
        status,
        startedAt: parsedStartedAt ?? existingEntry?.startedAt ?? new Date(),
        finishedAt: null,
        updatedAt: new Date(),
      };
    }

    const startedAt =
      parsedStartedAt ??
      existingEntry?.startedAt ??
      parsedFinishedAt ??
      new Date();
    const finishedAt = parsedFinishedAt ?? new Date();

    if (finishedAt < startedAt) {
      throw new BadRequestException(
        "finishedAt cannot be earlier than startedAt",
      );
    }

    return {
      status,
      startedAt,
      finishedAt,
      updatedAt: new Date(),
    };
  }

  private parseDate(value: string, fieldName: string) {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(
        `${fieldName} must be a valid ISO 8601 date`,
      );
    }

    return parsedDate;
  }
}
