import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  bookId?: string;
}
