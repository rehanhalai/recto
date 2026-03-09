import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsUUID()
  @IsOptional()
  bookId?: string;
}
