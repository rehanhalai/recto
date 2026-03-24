import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ReadingTrackerService } from "./reading-tracker.service";
import { ReadingTrackerStatus } from "./dto/reading-tracker.dto";

describe("ReadingTrackerService", () => {
  const createDbMock = () => {
    const whereResult = jest.fn().mockResolvedValue([{ count: 0 }]);
    const fromResult = jest.fn().mockReturnValue({ where: whereResult });
    const selectResult = jest.fn().mockReturnValue({ from: fromResult });

    return {
      query: {
        books: {
          findFirst: jest.fn(),
        },
        addedBooks: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      select: selectResult,
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
  };

  it("creates a reading entry with a startedAt date and no finishedAt", async () => {
    const db = createDbMock();
    const service = new ReadingTrackerService(db as never);
    const returning = jest.fn().mockResolvedValue([
      {
        id: "entry-1",
        userId: "user-1",
        bookId: "book-1",
        status: ReadingTrackerStatus.READING,
        startedAt: new Date("2026-03-16T12:00:00.000Z"),
        finishedAt: null,
        createdAt: new Date("2026-03-16T12:00:00.000Z"),
        updatedAt: new Date("2026-03-16T12:00:00.000Z"),
      },
    ]);
    const values = jest.fn().mockReturnValue({ returning });

    db.query.books.findFirst.mockResolvedValue({ id: "book-1" });
    db.query.addedBooks.findFirst.mockResolvedValue(undefined);
    db.insert.mockReturnValue({ values });

    const result = await service.saveEntry("user-1", {
      bookId: "book-1",
      status: ReadingTrackerStatus.READING,
    });

    expect(result.status).toBe(ReadingTrackerStatus.READING);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        bookId: "book-1",
        status: ReadingTrackerStatus.READING,
        finishedAt: null,
        startedAt: expect.any(Date),
      }),
    );
  });

  it("rejects finished entries when finishedAt is earlier than startedAt", async () => {
    const db = createDbMock();
    const service = new ReadingTrackerService(db as never);

    db.query.books.findFirst.mockResolvedValue({ id: "book-1" });
    db.query.addedBooks.findFirst.mockResolvedValue(undefined);

    await expect(
      service.saveEntry("user-1", {
        bookId: "book-1",
        status: ReadingTrackerStatus.FINISHED,
        startedAt: "2026-03-16T12:00:00.000Z",
        finishedAt: "2026-03-15T12:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws when removing a missing reading tracker entry", async () => {
    const db = createDbMock();
    const service = new ReadingTrackerService(db as never);
    const returning = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ returning });

    db.delete.mockReturnValue({ where });

    await expect(
      service.removeEntry("user-1", "missing-entry"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
