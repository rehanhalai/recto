import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class GetBookDto {}

export enum TbrStatus {
  WISHLIST = "wishlist",
  READING = "reading",
  FINISHED = "finished",
}

export class TbrBookDto {
  @IsString({ message: "bookId is required" })
  bookId: string;

  @IsEnum(TbrStatus, {
    message: "status must be wishlist, reading, or finished",
  })
  status: TbrStatus;

  @IsOptional()
  @IsString()
  startedAt?: string;

  @IsOptional()
  @IsString()
  finishedAt?: string;
}

export class FetchBooksBasedOnStatusDto {
  @IsEnum(TbrStatus, {
    message: "status must be wishlist, reading, or finished",
  })
  status: TbrStatus;
}

export class SearchBooksDto {
  @IsString({ message: "Query is required for search" })
  @MinLength(2, { message: "Query must be at least 2 characters" })
  @MaxLength(200, { message: "Query must not exceed 200 characters" })
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "Page must be greater than 0" })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "Limit must be greater than 0" })
  @Max(50, { message: "Limit must not exceed 50" })
  limit?: number;
}
