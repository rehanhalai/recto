import { IsEnum, IsISO8601, IsOptional, IsString } from "class-validator";

export enum ReadingTrackerStatus {
  WISHLIST = "wishlist",
  READING = "reading",
  FINISHED = "finished",
}

export class SaveReadingTrackerEntryDto {
  @IsString({ message: "bookId is required" })
  bookId: string;

  @IsEnum(ReadingTrackerStatus, {
    message: "status must be wishlist, reading, or finished",
  })
  status: ReadingTrackerStatus;

  @IsOptional()
  @IsISO8601({}, { message: "startedAt must be a valid ISO 8601 date" })
  startedAt?: string;

  @IsOptional()
  @IsISO8601({}, { message: "finishedAt must be a valid ISO 8601 date" })
  finishedAt?: string;
}

export class GetReadingTrackerEntriesDto {
  @IsEnum(ReadingTrackerStatus, {
    message: "status must be wishlist, reading, or finished",
  })
  status: ReadingTrackerStatus;
}
