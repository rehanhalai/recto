import {
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Bio cannot exceed 300 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username cannot exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  userName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Full name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Full name cannot exceed 100 characters' })
  fullName?: string;
}

export class UserNameAvailabilityDto {
  @IsString()
  @MinLength(1, { message: 'User name cannot be empty' })
  @MaxLength(30, { message: 'User name cannot exceed 30 characters' })
  userName: string;
}

export class SearchUserDto {
  @IsString()
  @MinLength(1, { message: 'User name cannot be empty' })
  @MaxLength(30, { message: 'User name cannot exceed 30 characters' })
  userName: string;
}

export class ProfileRelationQueryDto extends SearchUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;

  @IsOptional()
  @IsString({ message: 'Cursor must be a string' })
  cursor?: string;
}
