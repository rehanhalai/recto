import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetBookDto {
  @IsString({ message: 'externalId is required' })
  externalId: string;

  @IsString({ message: 'Title is required' })
  title: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one author is required' })
  authors: string[];
}

export enum TbrStatus {
  WISHLIST = 'wishlist',
  READING = 'reading',
  FINISHED = 'finished',
}

export class TbrBookDto {
  @IsString({ message: 'bookId is required' })
  bookId: string;

  @IsEnum(TbrStatus, {
    message: 'status must be wishlist, reading, or finished',
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
    message: 'status must be wishlist, reading, or finished',
  })
  status: TbrStatus;
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortField {
  AVERAGE_RATING = 'averageRating',
  RELEASE_DATE = 'releaseDate',
  CREATED_AT = 'createdAt',
}

export class SearchBooksDto {
  @IsOptional()
  @IsString({ message: 'Title is required for search' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Genre for filtering' })
  @MaxLength(100, { message: 'Genre must not exceed 100 characters' })
  genre?: string;

  @IsOptional()
  @IsEnum(SortField)
  sort?: SortField;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(50, { message: 'Limit must not exceed 50' })
  limit?: number;
}

export class SearchBooksByAuthorDto {
  @IsString({ message: 'Author name is required for search' })
  @MinLength(2, { message: 'Author name must be at least 2 characters' })
  @MaxLength(200, { message: 'Author name must not exceed 200 characters' })
  author: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(50, { message: 'Limit must not exceed 50' })
  limit?: number;
}
